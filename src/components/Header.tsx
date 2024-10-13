import { signOut } from 'next-auth/react';

interface HeaderProps {
    diamonds: number;
}

export default function Header({ diamonds }: HeaderProps) {
    return (
        <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
                <span className="text-2xl font-bold">💎 {diamonds}</span>
            </div>
            <h1 className="text-2xl font-bold">TaskRock</h1>
            <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
                Log Out
            </button>
        </header>
    );
}
