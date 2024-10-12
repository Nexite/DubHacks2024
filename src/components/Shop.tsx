'use client';

import React from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ShopItem {
  name: string;
  price: number;
  imageUrl: string;
}

interface ShopProps {
  items: ShopItem[];
  className?: string;
}

const Shop: React.FC<ShopProps> = ({ items, className = '' }) => {
  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`}
          >
            Shop
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Popover.Panel className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-25">
              <div className="flex min-h-full items-center justify-center p-4" onClick={() => close()}>
                <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Hat Shop</h2>
                    <button
                      onClick={() => close()}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <ul>
                    {items.map((item, index) => (
                      <li key={index} className="flex justify-between items-center mb-2">
                        <img src={item.imageUrl} alt={item.name} className="w-8 h-8 mr-2" />
                        <span>{item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm">
                          Buy
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default Shop;
