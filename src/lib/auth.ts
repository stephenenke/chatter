import { Session, getServerSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Add type declaration for extended session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

// Define auth options here instead of importing from auth.ts
// This avoids circular dependencies
export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // For development/testing only - use OAuth providers in production
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is a simple example, in production you'd validate against a database
        if (credentials?.email === "demo@example.com" && credentials?.password === "password") {
          return {
            id: "demo-user-id",
            name: "Demo User",
            email: "demo@example.com",
          };
        }
        
        // Return null if user credentials are invalid
        return null;
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      // If the user object is available (on sign-in), add their ID to the token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add the user ID to the session
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Service for handling authentication-related functionality
 */
export class AuthService {
  /**
   * Get the current user session from the server
   */
  static async getSession(): Promise<Session | null> {
    return getServerSession(authOptions);
  }

  /**
   * Get the current user ID from the session
   * @throws Error if user is not authenticated
   */
  static async getUserId(): Promise<string> {
    const session = await this.getSession();
    
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    
    return session.user.id;
  }

  /**
   * Check if the current user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session?.user;
  }
}