import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { SlackTokenManager } from '@/lib/slack-token';

export async function GET(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code: code,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error);
    }

    // Store the token (in production, use a secure database)
    SlackTokenManager.setToken(session.user.email, data.access_token);

    // Redirect back to the main page
    return NextResponse.redirect(new URL('/', request.url));

  } catch (error) {
    console.error('Slack auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}