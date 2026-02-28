import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { WatchHistoryItem } from "@/types";

// Hàm tiện ích: Lấy thời điểm 6 tháng trước
const getSixMonthsAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ message: "Thiếu email" }, { status: 400 });

    await connectMongoDB();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ message: "Không tìm thấy user" }, { status: 404 });

    // Lọc: Chỉ lấy những phim xem trong vòng 6 tháng qua
    const sixMonthsAgo = getSixMonthsAgo();
    const validHistory = (user.watchHistory || []).filter((item: WatchHistoryItem) => new Date(item.timestamp) >= sixMonthsAgo);

    return NextResponse.json({ history: validHistory }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, movieData } = await req.json();
    await connectMongoDB();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ message: "Không tìm thấy user" }, { status: 404 });

    const sixMonthsAgo = getSixMonthsAgo();
    
    // 1. Xóa phim này khỏi vị trí cũ (nếu có) và Lọc bỏ phim quá 6 tháng
    let history = user.watchHistory || [];
    history = history.filter((item: WatchHistoryItem) => item.slug !== movieData.slug && new Date(item.timestamp) >= sixMonthsAgo);

    // 2. Đẩy phim mới lên Top 1
    history.unshift({ ...movieData, timestamp: new Date() });

    // 3. Cắt gọt: Chỉ giữ lại tối đa 15 bộ
    if (history.length > 15) history = history.slice(0, 15);

    user.watchHistory = history;
    await user.save();

    return NextResponse.json({ message: "Đã đồng bộ lịch sử" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}