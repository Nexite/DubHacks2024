import Image from 'next/image';
import { InventoryItem, ShopItem } from './Accessories';

const Rock: React.FC<{ inventory: InventoryItem[]; shopItems: ShopItem[] }> = ({ inventory, shopItems }) => {
    const equippedItemImages = inventory.filter(item => item.equipped).map(item => shopItems.find(shopItem => shopItem.id === item.id)?.imageUrl);
    
    // Check if eyes are equipped, if not, add the default eyes image
    const hasEyes = equippedItemImages.some(url => url?.includes('eyes/'));
    if (!hasEyes) {
        equippedItemImages.push('/eyes/eyes.png');
    }
    
    return (
        <div className="flex-grow relative mb-4">
            <Image
                src="/rock.png"
                alt="A picture of a rock"
                layout="fill"
                objectFit="contain"
                className="rounded-lg"
            />
            {equippedItemImages.map((imageUrl, index) => (
                <Image
                    key={index}
                    src={imageUrl || ''}
                    alt={`Equipped item ${index + 1}`}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg"
                />
            ))}
        </div>
    );
};

export default Rock;
