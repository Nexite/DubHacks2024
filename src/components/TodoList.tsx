import React, { useState } from 'react';

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

    const handleAddTodo = () => {
        if (inputText.trim() !== '') {
            onAddTodo(inputText.trim());
            setInputText('');
        }
    };

    return (
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
                            onChange={() => onToggleTodo(todo.id)}
                            className="mr-2"
                        />
                        <span className={`text-gray-800 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                            {todo.text} (💎 {todo.diamonds})
                        </span>
                        <button
                            onClick={() => onDeleteTodo(todo.id)}
                            className="ml-auto bg-red-500 text-white px-2 py-1 rounded"
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
