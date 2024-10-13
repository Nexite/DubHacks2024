import Image from 'next/image';
import { InventoryItem, ShopItem } from './ShopWithTabs';

const Rock: React.FC<{ inventory: InventoryItem[]; shopItems: ShopItem[] }> = ({ inventory, shopItems }) => {
    const equippedItemImages = inventory.filter(item => item.equipped).map(item => shopItems.find(shopItem => shopItem.id === item.id)?.imageUrl);
    console.log(equippedItemImages);
    
    return (
        <div className="flex-grow relative mb-4">
            <Image
                src="/rock.webp"
                alt="A picture of a rock"
                layout="fill"
                objectFit="contain"
                className="rounded-lg"
            />
        </div>
    );
};

export default Rock;
