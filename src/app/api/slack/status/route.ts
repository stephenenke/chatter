import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { SlackTokenManager } from '@/lib/slack-token';

export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isConnected = SlackTokenManager.hasToken(session.user.email);
  
  return NextResponse.json({ isConnected });
}