import React from 'react';

export type AuctionCardProps = {
  title: string;
  image: string;
  price: number;
  category: string;
  endTime: string;
};

const AuctionCard: React.FC<AuctionCardProps> = ({ title, image, price, category, endTime }) => {
  return (
    <div className="rounded-lg bg-white dark:bg-gray-900 shadow p-4 flex flex-col gap-2">
      <img
        src={image}
        alt={title}
        className="w-full h-40 object-cover rounded-md mb-2 border border-gray-200 dark:border-gray-800"
      />
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
          {category}
        </span>
        <span className="text-xs text-gray-500">Termina: {endTime}</span>
      </div>
      <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-1">{title}</h4>
      <div className="text-base font-semibold text-green-600 dark:text-green-400">${price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</div>
    </div>
  );
};

export default AuctionCard; 