'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from './Header';
import TodoList from './TodoList';
import Rock from './Rock';
import Accessories from './Accessories';
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
                {id: "beanie", name: "Beanie", price: 250, imageUrl: "/hats/beanie.png", category: "hats"},
                {id: "bow_purple", name: "Purple Bow", price: 200, imageUrl: "/hats/bow_purple.png", category: "hats"},
                {id: "bow_red", name: "Red Bow", price: 200, imageUrl: "/hats/bow_red.png", category: "hats"},
                {id: "fedora", name: "Fedora", price: 300, imageUrl: "/hats/fedora.png", category: "hats"},
                {id: "halo", name: "Halo", price: 500, imageUrl: "/hats/halo.png", category: "hats"},
                {id: "minion_hair", name: "Minion", price: 1000, imageUrl: "/hats/minion_hair.png", category: "hats"},
                {id: "raised_eyebrows", name: "Raised Eyebrows", price: 175, imageUrl: "/hats/raised_eyebrow.png", category: "hats"}
            ]
        },
        {
            name: "clothes",
            items: [
                {id: "suit", name: "Suit", price: 450, imageUrl: "/clothes/suit.png", category: "clothes"},
                {id: "furry_coat", name: "Fur Coat", price: 400, imageUrl: "/clothes/furry_coat.png", category: "clothes"},
                {id: "hoodie", name: "Hoodie", price: 300, imageUrl: "/clothes/hoodie.png", category: "clothes"},
                {id: "minion_overalls", name: "Minion", price: 1000, imageUrl: "/clothes/minion_overalls.png", category: "clothes"},
            ]
        },
        {
            name: "eyes",
            items: [
                {id: "eyes_blue", name: "Blue Eyes", price: 50, imageUrl: "/eyes/eyes_blue.png", category: "eyes"},
                {id: "eyes_brown", name: "Brown Eyes", price: 50, imageUrl: "/eyes/eyes_brown.png", category: "eyes"},
                {id: "eyes_closed", name: "Closed Eyes", price: 75, imageUrl: "/eyes/eyes_closed.png", category: "eyes"},
                {id: "eyes_green", name: "Green Eyes", price: 50, imageUrl: "/eyes/eyes_green.png", category: "eyes"},
                {id: "eyes_bloodshot", name: "Bloodshot", price: 75, imageUrl: "/eyes/eyes_bloodshot.png", category: "eyes"},
                {id: "minion_eye", name: "Minion", price: 1000, imageUrl: "/eyes/minion_eye.png", category: "eyes"}
            ]
        },
        {
            name: "mouths",
            items: [
                {id: "mouth_smirk", name: "Smirk", price: 50, imageUrl: "/mouths/smirk.png", category: "mouths"},
                {id: "mouth_teeth", name: "Teeth", price: 50, imageUrl: "/mouths/2_teeth.png", category: "mouths"},
                {id: ":3", name: ":3", price: 50, imageUrl: "/mouths/3.png", category: "mouths"},
                {id: "grill", name: "Grill", price: 100, imageUrl: "/mouths/grill.png", category: "mouths"},
                {id: "grimace", name: "Grimace", price: 50, imageUrl: "/mouths/grimace.png", category: "mouths"},
                {id: "tongue", name: "Tongue", price: 75, imageUrl: "/mouths/tongue.png", category: "mouths"},
            ]
        },
        {
            name: "bodies",
            items: [
                {id: "minion", name: "Minion", price: 1000, imageUrl: "/bodies/minion.png", category: "bodies"}
            ]
        },
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
                return data.todo;
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
                        diamonds={diamonds}
                        setDiamonds={setDiamonds}
                        todos={todos}
                        onAddTodo={addTodo}
                        onToggleTodo={toggleTodo}
                        onDeleteTodo={deleteTodo}
                    />
                </div>

                <div className="w-1/2 p-6 flex flex-col">
                    <Rock inventory={inventory} shopItems={shopCategories.flatMap(category => category.items)} />
                    
                    <Accessories 
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