import { signOut } from 'next-auth/react';

interface HeaderProps {
    diamonds: number;
}

const Header: React.FC<HeaderProps> = ({ diamonds }) => {
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
    };

    return (
        <div className="flex justify-between items-center p-4 bg-white shadow-md">
            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition-colors h-12 text-xl"
            >
                Logout
            </button>
            <div className="bg-blue-600 px-4 py-2 rounded-lg shadow-md flex items-center h-12">
                <span className="mr-2 text-yellow-300 text-2xl">💎</span>
                <span className="font-bold text-white text-2xl">{diamonds}</span>
            </div>
        </div>
    );
};

export default Header;
