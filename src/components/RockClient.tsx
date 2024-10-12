'use client';

import { useState } from 'react';
import Shop from '@/components/Shop';
import Image from 'next/image';

const shopItems = [
  { name: 'Cowboy Hat', price: 9.99, imageUrl: '/hats/cowboy-hat.png' },
  { name: 'Top Hat', price: 14.99, imageUrl: '/hats/top-hat.png' },
  { name: 'Baseball Cap', price: 7.99, imageUrl: '/hats/baseball-cap.png' },
];

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  diamonds: number;
}

export default function RockClient() {
    const [diamonds, setDiamonds] = useState(0);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [inputText, setInputText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const addTodo = async () => {
        if (inputText.trim() !== '') {
            try {
                setError(null);
                const response = await fetch('/api/analyze-task', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ task: inputText.trim() }),
                });
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                setTodos([...todos, { 
                    id: Date.now(), 
                    text: inputText.trim(), 
                    completed: false,
                    diamonds: data.diamonds
                }]);
                setInputText('');
            } catch (error: unknown) {
                console.error('Error adding todo:', error);
                setError(error instanceof Error ? error.message : 'Failed to add todo');
                // Fallback to a default value if the API call fails
                setTodos([...todos, { 
                    id: Date.now(), 
                    text: inputText.trim(), 
                    completed: false,
                    diamonds: 1
                }]);
                setInputText('');
            }
        }
    };

    const toggleTodo = (id: number) => {
        setTodos(todos.map(todo => {
            if (todo.id === id) {
                if (!todo.completed) {
                    setDiamonds(prev => prev + todo.diamonds);
                } else {
                    setDiamonds(prev => prev - todo.diamonds);
                }
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        }));
    };

    const deleteTodo = (id: number) => {
        const todoToDelete = todos.find(todo => todo.id === id);
        if (todoToDelete && todoToDelete.completed) {
            setDiamonds(prev => prev - todoToDelete.diamonds);
        }
        setTodos(todos.filter(todo => todo.id !== id));
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header with Diamond counter and Shop button */}
            <div className="flex justify-end items-center p-4 bg-white shadow-md">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-600 p-3 rounded-lg shadow-md flex items-center h-12">
                        <span className="mr-2 text-yellow-300 text-2xl">💎</span>
                        <span className="font-bold text-white text-2xl">{diamonds}</span>
                    </div>
                    <Shop items={shopItems} className="h-12 text-xl" />
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Todo List */}
                <div className="w-1/2 p-6 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Todo List</h2>
                        <div className="flex mb-4">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="flex-grow p-2 border rounded-l text-gray-800"
                                placeholder="Add a new todo"
                            />
                            <button
                                onClick={addTodo}
                                className="bg-blue-500 text-white px-4 py-2 rounded-r"
                            >
                                Add
                            </button>
                        </div>
                        <ul>
                            {todos.map(todo => (
                                <li key={todo.id} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        checked={todo.completed}
                                        onChange={() => toggleTodo(todo.id)}
                                        className="mr-2"
                                    />
                                    <span className={`text-gray-800 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                                        {todo.text} (💎 {todo.diamonds})
                                    </span>
                                    <button
                                        onClick={() => deleteTodo(todo.id)}
                                        className="ml-auto bg-red-500 text-white px-2 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Rock Image */}
                <div className="w-1/2 p-6 flex flex-col items-center">
                    <div className="relative w-full h-3/4">
                        <Image
                            src="/rock.webp"
                            alt="A picture of a rock"
                            layout="fill"
                            objectFit="contain"
                            className="rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Error display */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
        </div>
    )
}
