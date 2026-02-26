import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials: any) {
        await connectMongoDB();
        const { email, password } = credentials;

        // Tìm user trong Database
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("Không tìm thấy tài khoản!");
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
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        // Thêm id vào session luôn cho xịn
        (session.user as any).id = token.id as string; 
      }
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/dang-nhap", 
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };