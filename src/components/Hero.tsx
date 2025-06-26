import React from 'react';
import { Lock, Shield, Key, Clock, Heart, Users, Star, ArrowRight, RefreshCw, LogOut } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();

  const handleCreateCapsule = () => {
    navigate('/create');
  };

  const handleExploreCapsules = () => {
    navigate('/capsule-types');
  };

  const handleWalletRefresh = async () => {
    try {
      if (isConnected) {
        await disconnect();
        // Small delay to ensure disconnect completes
        setTimeout(() => {
          open();
        }, 500);
      } else {
        await open();
      }
    } catch (error) {
      console.error('Error refreshing wallet connection:', error);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJ3aGl0ZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMiIvPjwvZz48L3N2Zz4=')] animate-pulse"></div>
      </div>

      {/* Floating legacy-themed images */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Family photo floating element */}
        <div className="absolute top-20 left-10 w-32 h-24 rounded-lg transform rotate-12 animate-float opacity-100">
          <img 
            src="https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400" 
            alt="Family memories" 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        {/* Black and white retro typewriter/vintage document */}
        <div className="absolute top-32 right-16 w-28 h-36 rounded-lg transform -rotate-6 animate-float-delayed opacity-100">
          <img 
            src="https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=400" 
            alt="Vintage typewriter memories" 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Vintage photo */}
        <div className="absolute bottom-32 left-20 w-24 h-32 rounded-lg transform rotate-6 animate-float opacity-100">
          <img 
            src="https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=400" 
            alt="Vintage memories" 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Digital device representing modern legacy */}
        <div className="absolute bottom-20 right-24 w-20 h-28 rounded-lg transform -rotate-12 animate-float-delayed opacity-100">
          <img 
            src="https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg?auto=compress&cs=tinysrgb&w=400" 
            alt="Digital legacy" 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Text content */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-8 animate-fade-in">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur opacity-75 animate-pulse"></div>
                  <div className="relative bg-slate-900 p-4 rounded-full border border-blue-400/30">
                    <Heart className="h-12 w-12 text-blue-400" />
                  </div>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight animate-fade-in">
                Your Legacy Lives
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Forever
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed animate-fade-in-delay">
                Preserve your most precious memories, wisdom, and love for future generations with blockchain-secured digital time capsules.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-10 animate-fade-in-delay">
                <div className="flex items-center text-blue-200">
                  <Shield className="h-5 w-5 mr-2 text-green-400" />
                  <span className="text-sm font-medium">Blockchain Secured</span>
                </div>
                <div className="flex items-center text-blue-200">
                  <Clock className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="text-sm font-medium">Time-Released</span>
                </div>
                <div className="flex items-center text-blue-200">
                  <Users className="h-5 w-5 mr-2 text-purple-400" />
                  <span className="text-sm font-medium">Family Focused</span>
                </div>
              </div>

              {/* Wallet Status and Controls */}
              {isConnected && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 border border-white/20 animate-fade-in-delay">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                      <div>
                        <p className="text-white font-medium">Wallet Connected</p>
                        <p className="text-blue-200 text-sm font-mono">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleWalletRefresh}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Refresh wallet connection"
                      >
                        <RefreshCw className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={handleWalletDisconnect}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                        title="Disconnect wallet"
                      >
                        <LogOut className="h-4 w-4 text-red-300" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-12 animate-fade-in-delay-2">
                <Button 
                  variant="primary" 
                  size="lg" 
                  icon={true} 
                  onClick={handleCreateCapsule}
                  className="px-10 py-5 text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Start Your Legacy
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleExploreCapsules}
                  className="px-10 py-5 text-lg bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
                >
                  See Examples
                </Button>
              </div>

              {/* Social proof */}
              <div className="flex items-center justify-center lg:justify-start gap-4 text-blue-200 animate-fade-in-delay-2">
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100" alt="User" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100" alt="User" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100" alt="User" />
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span>Trusted by 10,000+ families</span>
                </div>
              </div>
            </div>

            {/* Right column - Visual showcase */}
            <div className="relative">
              {/* Main showcase image - Updated to family photo album */}
              <div className="relative rounded-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.pexels.com/photos/1128317/pexels-photo-1128317.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Family photo album with precious memories" 
                  className="w-full h-96 object-cover shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white text-xl font-semibold mb-2">Preserve Every Precious Moment</h3>
                  <p className="text-blue-100 text-sm">From family recipes to life lessons, secure your legacy for generations to come.</p>
                </div>
              </div>

              {/* Floating feature cards */}
              <div className="absolute -top-6 -left-6 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 animate-float">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 rounded-lg p-2">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">Encrypted & Secure</div>
                    <div className="text-blue-200 text-xs">Military-grade protection</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 rounded-lg p-2">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">8 Unlock Methods</div>
                    <div className="text-blue-200 text-xs">Perfect timing guaranteed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature highlights section */}
      <div className="relative z-10 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Why Families Choose LegacyCode</h2>
              <p className="text-blue-200 text-lg">Join thousands preserving their most precious memories</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Heart className="h-8 w-8 text-pink-400" />}
                title="Emotional Connection"
                description="Create meaningful bridges between generations with personalized messages that unlock at perfect moments."
                image="https://images.pexels.com/photos/1128317/pexels-photo-1128317.jpeg?auto=compress&cs=tinysrgb&w=400"
              />
              <FeatureCard 
                icon={<Shield className="h-8 w-8 text-blue-400" />}
                title="Unbreakable Security"
                description="Your memories are protected by blockchain technology and military-grade encryption that lasts forever."
                image="https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400"
              />
              <FeatureCard 
                icon={<Clock className="h-8 w-8 text-green-400" />}
                title="Perfect Timing"
                description="Schedule releases for birthdays, graduations, weddings, or any meaningful moment in your loved ones' lives."
                image="https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Curved wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L48 110C96 100 192 80 288 75C384 70 480 80 576 85C672 90 768 90 864 80C960 70 1056 50 1152 45C1248 40 1344 50 1392 55L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" fill="white"/>
        </svg>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, image }) => {
  return (
    <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-blue-400/30 transition-all duration-300 hover:bg-white/15 hover:transform hover:-translate-y-2">
      {/* Feature image */}
      <div className="relative mb-6 rounded-xl overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-lg p-2">
          {icon}
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
        {title}
      </h3>
      <p className="text-blue-100/80 leading-relaxed">
        {description}
      </p>
      
      {/* Hover arrow */}
      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ArrowRight className="h-5 w-5 text-blue-400" />
      </div>
    </div>
  );
};

export default Hero;