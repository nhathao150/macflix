import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

const getSixMonthsAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d;
};

// Lấy danh sách phim yêu thích
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ message: "Thiếu email" }, { status: 400 });

    await connectMongoDB();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ message: "Không tìm thấy user" }, { status: 404 });

    const sixMonthsAgo = getSixMonthsAgo();
    const validFavorites = (user.favorites || []).filter((item: any) => new Date(item.timestamp) >= sixMonthsAgo);

    return NextResponse.json({ favorites: validFavorites }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}

// Thêm hoặc Xóa phim yêu thích (Toggle)
export async function POST(req: Request) {
  try {
    const { email, movieData } = await req.json();
    await connectMongoDB();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ message: "Không tìm thấy user" }, { status: 404 });

    const sixMonthsAgo = getSixMonthsAgo();
    let favorites = user.favorites || [];
    
    // Dọn dẹp phim quá 6 tháng trước khi thao tác
    favorites = favorites.filter((item: any) => new Date(item.timestamp) >= sixMonthsAgo);

    // Kiểm tra xem phim đã có trong yêu thích chưa
    const existingIndex = favorites.findIndex((item: any) => item.slug === movieData.slug);

    if (existingIndex >= 0) {
      // Nếu có rồi ➔ Bấm vào là XÓA
      favorites.splice(existingIndex, 1);
    } else {
      // Nếu chưa có ➔ Bấm vào là THÊM (vào đầu danh sách)
      favorites.unshift({ ...movieData, timestamp: new Date() });
      
      // Giới hạn tối đa 15 bộ yêu thích
      if (favorites.length > 15) favorites = favorites.slice(0, 15);
    }

    user.favorites = favorites;
    await user.save();

    return NextResponse.json({ message: "Đã cập nhật yêu thích", isFavorited: existingIndex < 0 }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}