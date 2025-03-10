import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface AuthProps {
  children: React.ReactNode;
}

/**
 * A server component that ensures the user is authenticated
 * Redirects to the sign-in page if not authenticated
 */
export async function Auth({ children }: AuthProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return <>{children}</>;
}

/**
 * A server component that ensures the user is *not* authenticated
 * Redirects to the home page if already authenticated
 */
export async function UnAuth({ children }: AuthProps) {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect('/');
  }

  return <>{children}</>;
}