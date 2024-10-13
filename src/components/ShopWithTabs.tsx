import React, { useState } from 'react';
import Image from 'next/image';

export interface ShopItem {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
}

interface ShopCategory {
    name: string;
    items: ShopItem[];
}

export interface InventoryItem {
    id: string;
    equipped: boolean;
}

interface ShopWithTabsProps {
    categories: ShopCategory[];
    diamonds: number;
    onPurchase: (item: ShopItem) => void;
    inventory: InventoryItem[];
    onEquip: (itemId: string, category: string, equip: boolean) => void;
}

const ShopWithTabs: React.FC<ShopWithTabsProps> = ({ categories, diamonds, onPurchase, inventory, onEquip }) => {
    const [activeCategory, setActiveCategory] = useState(categories[0].name);

    const isItemOwned = (itemId: string) => inventory.some(item => item.id === itemId);
    const isItemEquipped = (itemId: string) => inventory.some(item => item.id === itemId && item.equipped);

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mt-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Shop</h2>
                <div className="bg-blue-600 px-3 py-1 rounded-lg shadow-md flex items-center">
                    <span className="mr-2 text-yellow-300 text-lg">💎</span>
                    <span className="font-bold text-white text-lg">{diamonds}</span>
                </div>
            </div>
            <div className="flex mb-3 overflow-x-auto custom-scrollbar">
                {categories.map((category) => (
                    <button
                        key={category.name}
                        className={`mr-2 px-3 py-1 rounded-t-lg whitespace-nowrap text-sm ${
                            activeCategory === category.name
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => setActiveCategory(category.name)}
                    >
                        {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                    </button>
                ))}
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <div className="flex space-x-4 pb-3">
                    {categories
                        .find((category) => category.name === activeCategory)
                        ?.items.map((item) => (
                            <div key={item.id} className="bg-gray-100 p-3 rounded-lg flex flex-col items-center min-w-[200px]">
                                <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="mb-2" />
                                <h3 className="font-bold text-base mb-1">{item.name}</h3>
                                <div className="flex-grow flex items-end">
                                    {isItemOwned(item.id) ? (
                                        <p className="text-gray-500 text-sm mb-2">Purchased</p>
                                    ) : (
                                        <p className="text-blue-600 font-bold text-base mb-2">💎 {item.price}</p>
                                    )}
                                </div>
                                <div className="w-full">
                                    {isItemOwned(item.id) ? (
                                        isItemEquipped(item.id) ? (
                                            <button
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm w-full"
                                                onClick={() => onEquip(item.id, item.category, false)}
                                            >
                                                Unequip
                                            </button>
                                        ) : (
                                            <button
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm w-full"
                                                onClick={() => onEquip(item.id, item.category, true)}
                                            >
                                                Equip
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            className={`px-3 py-1 rounded text-sm w-full ${
                                                diamonds >= item.price
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                            onClick={() => onPurchase(item)}
                                            disabled={diamonds < item.price}
                                        >
                                            Buy
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #888 #f1f1f1;
                }
            `}</style>
        </div>
    );
};

export default ShopWithTabs;
