import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRepository } from "@/repositories/UserRepository";
import { UserService } from "@/services/UserService";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Correo Electrónico", type: "email", placeholder: "admin@mascotas.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const userRepository = new UserRepository();
        const userService = new UserService(userRepository);

        const user = await userService.verifyCredentials(credentials.email, credentials.password);
        
        if (user) {
          return { id: user.id, name: user.name, email: user.email, requiresPasswordChange: user.requiresPasswordChange };
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.requiresPasswordChange = (user as any).requiresPasswordChange;
      }
      
      // Update token if session is updated manually
      if (trigger === "update" && session?.requiresPasswordChange !== undefined) {
        token.requiresPasswordChange = session.requiresPasswordChange;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).requiresPasswordChange = token.requiresPasswordChange;
      }
      return session;
    }
  },
  pages: {
    // signIn: '/login', // To be customized later
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

if (!process.env.NEXTAUTH_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET is not set. Please define it in your environment variables.");
  } else {
    console.warn("WARNING: NEXTAUTH_SECRET is not set. Using a fallback for development. Do NOT do this in production.");
    authOptions.secret = "super_secret_for_development_only";
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
