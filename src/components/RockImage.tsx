import Image from 'next/image';

const RockImage: React.FC = () => {
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

export default RockImage;
