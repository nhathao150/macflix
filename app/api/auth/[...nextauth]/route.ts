import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { Session, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials: Record<string, string> | undefined) {
        await connectMongoDB();
        const email = credentials?.email;
        const password = credentials?.password;
        
        if (!email || !password) throw new Error("Thiếu thông tin đăng nhập!");

        // 1. Nếu chưa cấu hình MongoDB_URI, hỗ trợ cho đăng nhập ngay với tài khoản TV chỉ định để test giao diện
        if (!process.env.MONGODB_URI) {
          if (email.toLowerCase() === "tranphannhathao159@gmail.com") {
            return {
              id: "tv-designated-id",
              name: "Nhật Thảo (TV Mode)",
              email: email.toLowerCase()
            };
          }
          throw new Error("Chưa cấu hình MONGODB_URI trong file .env.local!");
        }

        await connectMongoDB();

        // 2. Tìm user trong Database nếu có DB
        const user = await User.findOne({ email });
        if (!user) {
          // Fallback nếu tài khoản TV chưa được bấm Đăng ký trong DB
          if (email.toLowerCase() === "tranphannhathao159@gmail.com") {
            return {
              id: "tv-designated-id",
              name: "Nhật Thảo (TV Mode)",
              email: email.toLowerCase()
            };
          }
          throw new Error("Không tìm thấy tài khoản!");
        }

        if (user.isVerified === false) {
          throw new Error("Tài khoản chưa được xác thực email!");
        }

        // So sánh mật khẩu mã hóa
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
          throw new Error("Mật khẩu không chính xác!");
        }

        // Trả về dữ liệu để lưu vào phiên đăng nhập
        return { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email 
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  
  // NƠI TRUYỀN DỮ LIỆU EMAIL RA NGOÀI CHO CÁC TRANG KHÁC ĐỌC
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        try {
          await connectMongoDB();
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            await User.create({
              name: user.name,
              email: user.email,
              avatar: user.image,
              isVerified: true,
              authProvider: "google"
            });
          }
          return true;
        } catch (error) {
          console.error("Lỗi khi lưu user Google:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: JWT, user: NextAuthUser | any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        // Thêm id vào session luôn cho xịn
        (session.user as Record<string, any>).id = token.id as string; 
      }
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET || "macflix_secret_default_key_123456",
  pages: {
    signIn: "/login", 
  },
  debug: true, // Bật chế độ debug để ghi lại mọi lỗi vào Vercel Logs
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };