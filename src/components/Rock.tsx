import Image from 'next/image';
import { InventoryItem, ShopItem } from './Accessories';

const Rock: React.FC<{ inventory: InventoryItem[]; shopItems: ShopItem[] }> = ({ inventory, shopItems }) => {
    const equippedItemImages = inventory.filter(item => item.equipped).map(item => shopItems.find(shopItem => shopItem.id === item.id)?.imageUrl);
    
    const hasEyes = equippedItemImages.some(url => url?.includes('eyes/'));
    if (!hasEyes) {
        equippedItemImages.push('/eyes/eyes.png');
    }
    const hasBody = equippedItemImages.some(url => url?.includes('bodies/'));
    if (!hasBody) {
        equippedItemImages.push('/bodies/rock.png');
    }
    // sort equippedItemImages so body is first, then eyes, then mouths, then anything else
    equippedItemImages.sort((a, b) => a?.includes('bodies/') ? -1 : b?.includes('bodies/') ? 1 : a?.includes('eyes/') ? -1 : b?.includes('eyes/') ? 1 : a?.includes('mouths/') ? -1 : b?.includes('mouths/') ? 1 : 0);
    
    return (
        <div className="flex-grow relative mb-4">
            <div className="rock-container">
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
                    animation: bounce 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Rock;
