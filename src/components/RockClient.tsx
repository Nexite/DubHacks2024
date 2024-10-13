'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from './Header';
import TodoList from './TodoList';
import Rock from './Rock';
import ShopWithTabs from './ShopWithTabs';
import LoginScreen from './LoginScreen';

interface Todo {
    id: number;
    text: string;
    completed: boolean;
    diamonds: number;
}

interface InventoryItem {
    id: string;
    equipped: boolean;
}

interface ShopItem {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
}

export default function RockClient() {
    const { data: session, status } = useSession();
    const [diamonds, setDiamonds] = useState(0);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);

    const shopCategories = [
        {
            name: "hats",
            items: [
                { id: "hat1", name: "Cowboy Hat", price: 10, imageUrl: "/hats/cowboy-hat.png", category: "hats" },
                { id: "hat2", name: "Top Hat", price: 15, imageUrl: "/hats/top-hat.png", category: "hats" },
                { id: "hat3", name: "Baseball Cap", price: 8, imageUrl: "/hats/baseball-cap.png", category: "hats" },
                { id: "hat4", name: "Baseball Cap", price: 8, imageUrl: "/hats/baseball-cap.png", category: "hats" },
                { id: "hat5", name: "rat", price: 8, imageUrl: "/hats/baseball-cap.png", category: "hats" }
            ]
        },
        {
            name: "eyes",
            items: [
                { id: "eyes1", name: "Sunglasses", price: 5, imageUrl: "/eyes/sunglasses.png", category: "eyes" }
            ]
        },
        {
            name: "teeth",
            items: [
                { id: "eyes1", name: "Sunglasses", price: 5, imageUrl: "/eyes/sunglasses.png", category: "eyes" }
            ]
        }
    ];

    useEffect(() => {
        if (session) {
            fetchTodos();
            fetchDiamonds();
            fetchInventory();
        }
    }, [session]);

    const fetchInventory = async () => {
        try {
            const response = await fetch('/api/inventory');
            const data = await response.json();
            if (data.inventory) {
                setInventory(data.inventory);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setError('Failed to fetch inventory');
        }
    };

    const fetchTodos = async () => {
        try {
            const response = await fetch('/api/todos');
            const data = await response.json();
            if (data.todos) {
                setTodos(data.todos);
            }
        } catch (error) {
            console.error('Error fetching todos:', error);
            setError('Failed to fetch todos');
        }
    };

    const fetchDiamonds = async () => {
        try {
            const response = await fetch('/api/diamonds');
            const data = await response.json();
            if (data.diamonds !== undefined) {
                setDiamonds(data.diamonds);
            }
        } catch (error) {
            console.error('Error fetching diamonds:', error);
            setError('Failed to fetch diamonds');
        }
    };

    const addTodo = async (text: string) => {
        if (text.trim() !== '') {
            try {
                setError(null);
                const response = await fetch('/api/todos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: text.trim() }),
                });
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                setTodos([...todos, data.todo]);
            } catch (error: unknown) {
                console.error('Error adding todo:', error);
                setError(error instanceof Error ? error.message : 'Failed to add todo');
            }
        }
    };

    const toggleTodo = async (id: number) => {
        try {
            const todoToToggle = todos.find(todo => todo.id === id);
            if (!todoToToggle) return;

            const response = await fetch('/api/todos', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, completed: !todoToToggle.completed }),
            });

            if (!response.ok) {
                throw new Error('Failed to update todo');
            }

            const newDiamonds = todoToToggle.completed
                ? diamonds - todoToToggle.diamonds
                : diamonds + todoToToggle.diamonds;

            await fetch('/api/diamonds', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ diamonds: newDiamonds }),
            });

            setTodos(todos.map(todo =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            ));
            setDiamonds(newDiamonds);
        } catch (error) {
            console.error('Error toggling todo:', error);
            setError('Failed to update todo');
        }
    };

    const deleteTodo = async (id: number) => {
        try {
            const response = await fetch('/api/todos', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete todo');
            }

            setTodos(todos.filter(todo => todo.id !== id));
        } catch (error) {
            console.error('Error deleting todo:', error);
            setError('Failed to delete todo');
        }
    };

    const handlePurchase = async (item: ShopItem) => {
        if (diamonds >= item.price) {
            try {
                console.log('Sending purchase request for item:', item);
                const response = await fetch('/api/inventory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ itemId: item.id, category: item.category }),
                });

                console.log('Purchase response status:', response.status);
                const responseData = await response.json();
                console.log('Purchase response data:', responseData);

                if (!response.ok) {
                    throw new Error(responseData.error || 'Failed to add item to inventory');
                }

                const newDiamondCount = diamonds - item.price;
                const diamondResponse = await fetch('/api/diamonds', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ diamonds: newDiamondCount }),
                });

                if (!diamondResponse.ok) {
                    throw new Error('Failed to update diamond count');
                }

                setDiamonds(newDiamondCount);
                await fetchInventory();
            } catch (error) {
                console.error('Error purchasing item:', error);
                setError(error instanceof Error ? error.message : 'Failed to purchase item');
            }
        } else {
            setError('Not enough diamonds to purchase this item');
        }
    };

    const handleEquip = async (itemId: string, category: string, equip: boolean) => {
        try {
            const response = await fetch('/api/inventory', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId, equip, category }),
            });

            if (!response.ok) {
                throw new Error('Failed to update inventory');
            }

            const data = await response.json();
            setInventory(data.inventory);
        } catch (error) {
            console.error('Error equipping/unequipping item:', error);
            setError('Failed to equip/unequip item');
        }
    };

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!session) {
        console.log('No session found, redirecting to login');
        return <LoginScreen />;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Header diamonds={diamonds} />

            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/2 p-6 overflow-y-auto">
                    <TodoList
                        todos={todos}
                        onAddTodo={addTodo}
                        onToggleTodo={toggleTodo}
                        onDeleteTodo={deleteTodo}
                    />
                </div>

                <div className="w-1/2 p-6 flex flex-col">
                    <Rock inventory={inventory} shopItems={shopCategories.flatMap(category => category.items)} />
                    
                    <ShopWithTabs 
                        categories={shopCategories} 
                        diamonds={diamonds} 
                        onPurchase={handlePurchase}
                        inventory={inventory}
                        onEquip={handleEquip}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
        </div>
    );
}