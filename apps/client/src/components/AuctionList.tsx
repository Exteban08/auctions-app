import React, { useState } from 'react';
import { Auction } from '../api/auctionsApi';

interface AuctionListProps {
  auctions: Auction[];
  title: string;
}

const AuctionList: React.FC<AuctionListProps> = ({ auctions, title }) => {
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  const handleAuctionClick = (auction: Auction) => {
    setSelectedAuction(auction);
  };

  const closeModal = () => {
    setSelectedAuction(null);
  };

  return (
    <div className="py-12 px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-inner">
      <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{title}</h2>
      
      <div className="max-w-6xl mx-auto">
        {auctions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No hay subastas activas en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {auctions.map((auction) => (
              <div 
                key={auction.id} 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => handleAuctionClick(auction)}
              >
                <div className="relative">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-full h-52 object-cover rounded-lg mb-4"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium rounded-full shadow-md">
                      {auction.category}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-3 line-clamp-2">
                  {auction.title}
                </h3>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    ${auction.price.toLocaleString('es-MX')}
                  </span>
                  <span className="text-sm font-medium px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                    {auction.endTime}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    {auction.bidCount} {auction.bidCount === 1 ? 'puja' : 'pujas'}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {auction.seller}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {selectedAuction.title}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="relative mb-6">
                    <img
                      src={selectedAuction.image}
                      alt={selectedAuction.title}
                      className="w-full h-72 object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-full shadow-md">
                        {selectedAuction.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                      Descripción
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedAuction.description || "No hay descripción disponible para este artículo."}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Vendedor</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedAuction.seller}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                      Precio actual
                    </h4>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ${selectedAuction.price.toLocaleString('es-MX')}
                    </p>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Pujas: <span className="font-medium text-gray-800 dark:text-white">{selectedAuction.bidCount}</span>
                      </span>
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-full">
                        {selectedAuction.endTime}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                      Historial de pujas
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {selectedAuction.bids && selectedAuction.bids.length > 0 ? (
                        selectedAuction.bids.map((bid, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{bid.userName}</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">${bid.amount.toLocaleString('es-MX')}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          No hay pujas aún
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg hover:shadow-lg transition font-semibold text-lg">
                      Hacer Puja
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionList; 