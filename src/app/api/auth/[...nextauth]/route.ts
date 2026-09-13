import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Correo Electrónico", type: "email", placeholder: "admin@mascotas.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials, req) {
        // Simple auth check for now. We will wire this to Prisma `User` table later.
        if (credentials?.email === "admin@demo.com" && credentials?.password === "admin123") {
          return { id: "1", name: "Admin", email: "admin@demo.com" };
        }
        return null;
      }
    })
  ],
  pages: {
    // signIn: '/login', // To be customized later
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "super_secret_for_development_only",
});

export { handler as GET, handler as POST };
