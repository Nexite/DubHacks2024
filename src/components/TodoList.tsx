import React, { useState, useCallback } from 'react';
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
}

const TodoList: React.FC<TodoListProps> = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo }) => {
    const [inputText, setInputText] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    const handleAddTodo = () => {
        if (inputText.trim() !== '') {
            onAddTodo(inputText.trim());
            setInputText('');
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

    todos.sort((a, b) => a.completed ? 1 : b.completed ? -1 : 0);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {showConfetti && <Confetti />}
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
                    onClick={handleAddTodo}
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
                            onChange={() => handleToggleTodo(todo.id)}
                            className="mr-2"
                            disabled={typeof todo.id === 'number' && todo.id > Date.now() - 5000} // Disable for new todos
                        />
                        <span className={`text-gray-800 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                            {todo.text} (💎 {todo.diamonds})
                        </span>
                        <button
                            onClick={() => onDeleteTodo(todo.id)}
                            className="ml-auto bg-red-500 text-white px-2 py-1 rounded"
                            disabled={typeof todo.id === 'number' && todo.id > Date.now() - 5000} // Disable for new todos
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoList;
