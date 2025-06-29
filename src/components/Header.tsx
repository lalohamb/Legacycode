import React, { useState, useEffect } from 'react';
import { KeySquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debug logging to help troubleshoot connection state
  useEffect(() => {
    console.log('Header - Wallet connection state:', { isConnected, address });
  }, [isConnected, address]);

  const isHomePage = location.pathname === '/';

  const handleWalletClick = async () => {
    try {
      if (isConnected) {
        await disconnect();
      } else {
        await open();
      }
    } catch (error) {
      console.error('Error handling wallet connection:', error);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <KeySquare className="h-7 w-7 text-blue-600 mr-2" />
          <span className={`font-semibold text-xl ${
            scrolled || !isHomePage ? 'text-blue-900' : 'text-white'
          }`}>
            LegacyCode
          </span>
        </Link>
        <nav className="hidden md:flex space-x-8">
          {[
            { name: 'My Capsules', path: '/my-capsules' },
            { name: 'Capsule Types', path: '/capsule-types' },
            { name: 'Features', path: '/features' },
            { name: 'Security', path: '/security' },
            { name: 'Pricing', path: '/pricing' },
            { name: 'About', path: '/about' }
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`text-sm font-medium transition-colors ${
                scrolled || !isHomePage
                  ? 'text-gray-700 hover:text-blue-600'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleWalletClick}
          className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
            isConnected
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              : scrolled || !isHomePage
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isConnected && address ? formatAddress(address) : 'Connect Wallet'}
        </button>
        <img 
            //src="https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=400" 
            src="/img/logotext_poweredby_360w.png?auto=compress&cs=tinysrgb&w=360" 
            alt="Powered by Bolt" 
            className="w-20 h-20 object-cover"
          />
      </div>
    </header>
  );
};

export default Header;