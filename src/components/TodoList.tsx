import React, { useState, useCallback, KeyboardEvent } from 'react';
import Confetti from 'react-confetti';

interface Todo {
    id: number;
    text: string;
    completed: boolean;
    diamonds: number;
}

interface TodoListProps {
    todos: Todo[];
    onAddTodo: (text: string) => void;
    onToggleTodo: (id: number) => void;
    onDeleteTodo: (id: number) => void;
    diamonds: number;
    setDiamonds: (diamonds: number) => void;
}

const recommendedTodos: Todo[] = [
    { id: 1, text: "Drink a glass of water", diamonds: 5, completed: false },
    { id: 2, text: "Go for a walk", diamonds: 17, completed: false },
    { id: 3, text: "Call your mom", diamonds: 15, completed: false },
    { id: 4, text: "Write a thank you note", diamonds: 20, completed: false },
    { id: 5, text: "Do the dishes", diamonds: 10, completed: false },
    { id: 6, text: "Think of 3 things you're grateful for", diamonds: 8, completed: false },
    { id: 7, text: "Eat a healthy breakfast", diamonds: 12, completed: false },
    { id: 8, text: "Write down 3 things you want to accomplish today", diamonds: 9, completed: false },
    { id: 9, text: "Meditate for 5 minutes", diamonds: 14, completed: false },
    { id: 10, text: "Do 10 minutes of stretching", diamonds: 13, completed: false },
    { id: 11, text: "Go to the gym", diamonds: 23, completed: false },
];

const TodoList: React.FC<TodoListProps> = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, diamonds, setDiamonds }) => {
    const [inputText, setInputText] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    const [completedTodos, setCompletedTodos] = useState<Todo[]>([]);

    const [recommendTodos, setRecommendTodos] = useState(() => {
        const shuffled = [...recommendedTodos].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    });

    const handleAddTodo = () => {
        if (inputText.trim() !== '') {
            onAddTodo(inputText.trim());
            setInputText('');
        }
    };

    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleAddTodo();
        }
    };

    const handleToggleTodo = useCallback((id: number) => {
        const todo = todos.find(t => t.id === id);
        if (todo && !todo.completed) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
        }
        onToggleTodo(id);
    }, [todos, onToggleTodo]);

    const handleCompleteRecommendedTodo = async (id: number) => {
        const todo = recommendTodos.find(t => t.id === id);
        if (todo) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
            setCompletedTodos(prev => [...prev, { ...todo, completed: true }]);
            setRecommendTodos(prev => prev.filter(t => t.id !== id));

            try {
                const updateDiamondsResponse = await fetch('/api/diamonds', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ diamonds: diamonds + todo.diamonds }),
                });


                if (!updateDiamondsResponse.ok) {
                    throw new Error('Failed to update diamonds');
                }

                setDiamonds(diamonds + todo.diamonds);

            } catch (error) {
                console.error('Error updating diamonds:', error);
            }
        }
    };

    todos.sort((a, b) => a.completed ? 1 : b.completed ? -1 : 0);
    console.log(recommendTodos);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {showConfetti && <Confetti />}
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Todo List</h2>
            <div className="flex mb-4">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-grow p-2 border rounded-l text-gray-800"
                    placeholder="Add a new todo"
                />
                <button
                    onClick={handleAddTodo}
                    className="bg-blue-500 text-white px-4 py-2 rounded-r"
                >
                    Add
                </button>
            </div>
            <ul>
                <h3 className="text-lg font-bold mb-2 text-gray-800">Your Todos</h3>

                {todos.map(todo => (
                    <li key={todo.id} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggleTodo(todo.id)}
                            className="mr-2"
                        />
                        <span className={`text-gray-800 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                            {todo.text} <span className="text-lg font-bold ml-2">💎 {todo.diamonds}</span>
                        </span>
                        <button
                            onClick={() => onDeleteTodo(todo.id)}
                            className="ml-auto bg-red-500 text-white px-2 py-1 rounded"
                        >
                            Delete
                        </button>
                    </li>
                ))}
                <h3 className="text-lg font-bold mb-2 mt-4 text-gray-800">Recommended Todos</h3>
                {recommendTodos.map(todo => (
                    <li key={todo.id} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleCompleteRecommendedTodo(todo.id)}
                            className="mr-2"
                        />
                        <span className={`text-gray-800 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                            {todo.text} <span className="text-lg font-bold ml-2">💎 {todo.diamonds}</span>
                        </span>
                    </li>
                ))}
                {completedTodos.map(todo => (
                    <li key={todo.id} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggleTodo(todo.id)}
                            className="mr-2"
                        />
                        <span className={`text-gray-800 line-through text-gray-500`}>
                            {todo.text} <span className="text-lg font-bold ml-2">💎 {todo.diamonds}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoList;
