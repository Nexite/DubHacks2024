import { NextRequest, NextResponse } from 'next/server';
import { ManagementClient } from 'auth0';
import { auth } from '@/lib/auth';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_MANAGEMENT_API_CLIENT_ID!,
  clientSecret: process.env.AUTH0_MANAGEMENT_API_CLIENT_SECRET!,
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await management.users.get({ id: session.user.sub });
    const diamonds = user.data.user_metadata?.diamonds || 0;
    return NextResponse.json({ diamonds });
  } catch (error) {
    console.error('Error fetching diamonds:', error);
    return NextResponse.json({ error: 'Failed to fetch diamonds' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { diamonds } = await req.json();

  try {
    const user = await management.users.get({ id: session.user.sub });
    await management.users.update({ id: session.user.sub }, { user_metadata: { ...user.data.user_metadata, diamonds } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating diamonds:', error);
    return NextResponse.json({ error: 'Failed to update diamonds' }, { status: 500 });
  }
}
