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
            <div className="rock-container">
                <Image
                    src="/rock.png"
                    alt="A picture of a rock"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg rock-sway"
                />
                {equippedItemImages.map((imageUrl, index) => (
                    <Image
                        key={index}
                        src={imageUrl || ''}
                        alt={`Equipped item ${index + 1}`}
                        layout="fill"
                        objectFit="contain"
                        className={`rounded-lg ${imageUrl?.includes('eyes') || imageUrl?.includes('mouths') ? 'accessory-bounce' : ''}`}
                    />
                ))}
            </div>
            <style jsx global>{`
                @keyframes sway {
                    0%, 100% { transform: rotate(-1deg); }
                    50% { transform: rotate(1deg); }
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-2px); }
                }
                
                .rock-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    animation: sway 6s ease-in-out infinite;
                }
                
                .rock-sway {
                    animation: sway 6s ease-in-out infinite;
                }
                
                .accessory-bounce {
                    animation: bounce 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Rock;
