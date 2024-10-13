import { NextRequest, NextResponse } from 'next/server';
import { ManagementClient } from 'auth0';
import { auth } from '@/lib/auth';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_MANAGEMENT_API_CLIENT_ID!,
  clientSecret: process.env.AUTH0_MANAGEMENT_API_CLIENT_SECRET!,
});

interface InventoryItem {
  id: string;
  equipped: boolean;
  category: string;
}

export async function GET() {
  const session = (await auth());
  if (!session || !session.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await management.users.get({ id: session.user.sub });
    const inventory = user.data.user_metadata?.inventory || [];
    return NextResponse.json({ inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = (await auth());
  if (!session || !session.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { itemId, category } = await req.json();

  if (!itemId || !category) {
    return NextResponse.json({ error: 'Invalid item ID or category' }, { status: 400 });
  }

  try {
    const user = await management.users.get({ id: session.user.sub });
    const inventory: InventoryItem[] = user.data.user_metadata?.inventory || [];

    if (!inventory.some(item => item.id === itemId)) {
      inventory.push({ id: itemId, equipped: false, category });

      await management.users.update(
        { id: session.user.sub },
        { user_metadata: { ...user.data.user_metadata, inventory } }
      );

      return NextResponse.json({ success: true, inventory });
    } else {
      return NextResponse.json({ error: 'Item already in inventory' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error adding item to inventory:', error);
    let errorMessage = 'Failed to add item to inventory';
    if (error instanceof Error) {
      errorMessage += ': ' + error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = (await auth());
  if (!session || !session.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { itemId, equip, category } = await req.json();

  try {
    const user = await management.users.get({ id: session.user.sub });
    let inventory: InventoryItem[] = user.data.user_metadata?.inventory || [];

    if (equip) {
      // Unequip all items in the same category
      inventory = inventory.map(item => {
        if (item.category === category) {
          return { ...item, equipped: false };
        }
        return item;
      });
    }

    // Update the selected item
    inventory = inventory.map(item => {
      if (item.id === itemId) {
        return { ...item, equipped: equip };
      }
      return item;
    });

    await management.users.update(
      { id: session.user.sub },
      { user_metadata: { ...user.data.user_metadata, inventory: inventory } }
    );

    return NextResponse.json({ success: true, inventory: inventory });
  } catch (error) {
    console.error('Error updating item in inventory:', error);
    return NextResponse.json({ error: 'Failed to update item in inventory' }, { status: 500 });
  }
}
