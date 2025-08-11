"use client";

import AuctionList from "../components/AuctionList";
import NotificationBell from "../components/NotificationBell";
import LoginModal from "../components/LoginModal";
import SignupModal from "../components/SignupModal";
import CreateAuctionModal from "../components/CreateAuctionModal";
import MultisubastaSection from "../components/MultisubastaSection";
import CreateMultisubastaModal from "../components/CreateMultisubastaModal";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { fetchAuctions, Auction } from "@/api/auctionsApi";

export default function Home() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showCreateAuctionModal, setShowCreateAuctionModal] = useState(false);
  const [showCreateMultisubastaModal, setShowCreateMultisubastaModal] = useState(false);
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch auctions from the API
  useEffect(() => {
    const getAuctions = async () => {
      try {
        setLoading(true);
        const auctions = await fetchAuctions();
        setActiveAuctions(auctions);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch auctions:', err);
        setError('Failed to load auctions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getAuctions();
  }, []);

  const handleLoginSuccess = (user: { id: string; email: string; name: string }, token: string) => {
    login(user, token);
  };

  const handleSignupSuccess = (user: { id: string; email: string; name: string }, token: string) => {
    login(user, token);
  };

  const handleAuctionCreated = async () => {
    // Refresh the auction list
    try {
      setLoading(true);
      const auctions = await fetchAuctions();
      setActiveAuctions(auctions);
      setError(null);
      console.log('Auction created successfully! Refreshed auction list.');
    } catch (err) {
      console.error('Failed to refresh auctions:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMultisubastaCreated = async () => {
    // Refresh the auction list after multisubasta creation
    try {
      setLoading(true);
      const auctions = await fetchAuctions();
      setActiveAuctions(auctions);
      setError(null);
      console.log('Multisubasta created successfully! Refreshed auction list.');
    } catch (err) {
      console.error('Failed to refresh auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-indigo-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Subastas</span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Hola, {user?.name}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition shadow-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setShowSignupModal(true)}
                className="px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900 transition"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 dark:from-blue-900/40 dark:to-indigo-900/40"></div>
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center justify-center text-center gap-8">
          <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Descubre, Puja, ¡Gana!
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl">
            Participa en subastas en vivo de artículos únicos. ¡Haz tu oferta en tiempo real y gana tu próximo tesoro!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <a
                  href="#subastas-activas"
                  className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  Ver Subastas
                </a>
                <button
                  onClick={() => setShowCreateAuctionModal(true)}
                  className="px-8 py-4 rounded-lg bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  Crear Subasta
                </button>
                <button
                  onClick={() => setShowCreateMultisubastaModal(true)}
                  className="px-8 py-4 rounded-lg bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 font-semibold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  Crear Multisubasta
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  Registrarse para Ver Subastas
                </button>
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="px-8 py-4 rounded-lg bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  Registrarse para Pujar
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Subastas Activas */}
      <section id="subastas-activas" className="py-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <AuctionList auctions={activeAuctions} title="Subastas Activas" />
        )}
      </section>
      
      {/* Multisubastas Section */}
      <MultisubastaSection />

      {/* Cómo Funciona */}
      <section className="py-20 px-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">¿Cómo funciona?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg transform transition-all hover:scale-105">
              <div className="mb-6 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-2xl font-bold mx-auto">1</div>
              <h3 className="font-bold text-xl mb-4 text-center text-gray-800 dark:text-white">Explora</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">Descubre subastas activas y encuentra artículos únicos que te apasionen.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg transform transition-all hover:scale-105">
              <div className="mb-6 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-2xl font-bold mx-auto">2</div>
              <h3 className="font-bold text-xl mb-4 text-center text-gray-800 dark:text-white">Puja</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">Haz tu oferta en tiempo real y compite con otros usuarios por tus artículos favoritos.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg transform transition-all hover:scale-105">
              <div className="mb-6 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-2xl font-bold mx-auto">3</div>
              <h3 className="font-bold text-xl mb-4 text-center text-gray-800 dark:text-white">Gana</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">Si eres el mejor postor cuando finaliza la subasta, ¡el artículo es tuyo!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pie de página */}
      <footer className="mt-auto py-10 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Subastas App</h3>
              <p className="text-blue-200">La plataforma líder para coleccionistas y entusiastas.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-200 hover:text-white transition">Inicio</a></li>
                <li><a href="#subastas-activas" className="text-blue-200 hover:text-white transition">Subastas</a></li>
                <li><a href="#multisubastas" className="text-blue-200 hover:text-white transition">Multisubastas</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition">Ayuda</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Contacto</h3>
              <p className="text-blue-200">info@subastasapp.com</p>
              <p className="text-blue-200">+1 (555) 123-4567</p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-blue-800 text-center text-blue-200">
            &copy; {new Date().getFullYear()} Subastas App. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* Modales de autenticación */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
        onSignupSuccess={handleSignupSuccess}
      />

      {/* Modal de crear subasta */}
      <CreateAuctionModal
        isOpen={showCreateAuctionModal}
        onClose={() => setShowCreateAuctionModal(false)}
        onAuctionCreated={handleAuctionCreated}
      />

      {/* Modal de crear multisubasta */}
      <CreateMultisubastaModal
        isOpen={showCreateMultisubastaModal}
        onClose={() => setShowCreateMultisubastaModal(false)}
        onMultisubastaCreated={handleMultisubastaCreated}
      />
    </div>
  );
}
