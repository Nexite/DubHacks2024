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
  if (!session || !session.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await management.users.get({ id: session.user.sub });
    const todos = user.data.user_metadata?.todos || [];
    return NextResponse.json({ todos });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { text } = await req.json();

  try {
    const user = await management.users.get({ id: session.user.sub });
    const todos = user.data.user_metadata?.todos || [];
    
    // Use the absolute URL for the analyze-task API route
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/analyze-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task: text.trim() }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze task');
    }
    
    const data = await response.json();
    const diamonds = data.diamonds || 1; // Default to 1 if no diamonds returned
    const newTodo = { id: Date.now(), text, diamonds, completed: false };

    todos.push(newTodo);

    await management.users.update({ id: session.user.sub }, { user_metadata: { ...user.data.user_metadata, todos } });

    return NextResponse.json({ todo: newTodo });
  } catch (error) {
    console.error('Error adding todo:', error);
    return NextResponse.json({ error: 'Failed to add todo' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, completed } = await req.json();

  try {
    const user = await management.users.get({ id: session.user.sub });
    const todos = user.data.user_metadata?.todos || [];
    const updatedTodos = todos.map((todo: any) =>
      todo.id === id ? { ...todo, completed } : todo
    );

    // add diamonds for completed todos to user metadata
    const diamonds = updatedTodos.filter((todo: any) => todo.completed).reduce((acc: number, todo: any) => acc + todo.diamonds, 0);

    await management.users.update({ id: session.user.sub }, { user_metadata: { ...user.data.user_metadata, diamonds: user.data.user_metadata?.diamonds + diamonds, todos: updatedTodos } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();

  try {
    const user = await management.users.get({ id: session.user.sub });
    const todos = user.data.user_metadata?.todos || [];
    const updatedTodos = todos.filter((todo: any) => todo.id !== id);

    await management.users.update({ id: session.user.sub }, { user_metadata: { ...user.data.user_metadata, todos: updatedTodos } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
