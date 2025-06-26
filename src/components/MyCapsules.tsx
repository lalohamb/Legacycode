import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, ExternalLink, Eye, Lock, Unlock, Calendar, User, RefreshCw, Search, Filter, Database, Send, Loader2, CheckCircle, Wallet, Info, X } from 'lucide-react';
import Button from './Button';
import { useSupabaseCapsules } from '../hooks/useSupabaseCapsules';
import { SupabaseCapsuleService } from '../lib/supabase';
import { getIPFSGatewayURL } from '../utils/pinataService';
import { useCapsuleContract } from '../hooks/useCapsuleContract';
import { useAccount } from 'wagmi';

const MyCapsules: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { capsules, loading, error, refetch, searchCapsules, filterByUnlockMethod, clearFilters } = useSupabaseCapsules();
  const { transferCapsule, isTransferring, isSuccess, txHash } = useCapsuleContract();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Transfer states
  const [transferStates, setTransferStates] = useState<{[key: number]: {
    showTransfer: boolean;
    transferTo: string;
    isTransferring: boolean;
  }}>({});
  const [transferSuccess, setTransferSuccess] = useState<{[key: number]: {
    success: boolean;
    txHash: string;
  }}>({});

  // MetaMask import guide states
  const [showMetaMaskGuide, setShowMetaMaskGuide] = useState<{[key: number]: boolean}>({});

  const getUnlockMethodDisplayName = (method: string) => {
    const names = {
      'passphrase': 'Secret Passphrase',
      'qa': 'Question & Answer',
      'payment': 'Payment Required',
      'qrcode': 'QR Code Scan',
      'geolocation': 'Location Verification',
      'token': 'Token Ownership',
      'quiz': 'Quiz Answer',
      'timed': 'Time-based Release',
      'multi-step': 'Multi-Step Verification'
    };
    return names[method as keyof typeof names] || method;
  };

  const handleViewCapsule = (capsuleId: number) => {
    // Store the capsule ID and navigate to preview
    localStorage.setItem('selectedCapsuleId', capsuleId.toString());
    navigate('/preview');
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchCapsules(searchQuery.trim());
    } else {
      await clearFilters();
    }
  };

  const handleFilterChange = async (method: string) => {
    setSelectedFilter(method);
    if (method) {
      await filterByUnlockMethod(method);
    } else {
      await clearFilters();
    }
  };

  const handleClearFilters = async () => {
    setSearchQuery('');
    setSelectedFilter('');
    await clearFilters();
  };

  // Transfer functions
  const toggleTransfer = (capsuleId: number) => {
    setTransferStates(prev => ({
      ...prev,
      [capsuleId]: {
        ...prev[capsuleId],
        showTransfer: !prev[capsuleId]?.showTransfer,
        transferTo: prev[capsuleId]?.showTransfer ? '' : prev[capsuleId]?.transferTo || '',
        isTransferring: false
      }
    }));
  };

  const updateTransferTo = (capsuleId: number, value: string) => {
    setTransferStates(prev => ({
      ...prev,
      [capsuleId]: {
        ...prev[capsuleId],
        transferTo: value,
        showTransfer: true,
        isTransferring: false
      }
    }));
  };

  const handleTransfer = async (capsuleId: number) => {
    const transferState = transferStates[capsuleId];
    if (!transferCapsule || !address || !transferState?.transferTo) {
      return;
    }

    if (!transferState.transferTo.match(/^0x[a-fA-F0-9]{40}$/)) {
      return;
    }

    try {
      // Set transferring state for this specific capsule
      setTransferStates(prev => ({
        ...prev,
        [capsuleId]: {
          ...prev[capsuleId],
          isTransferring: true
        }
      }));

      console.log('Initiating NFT transfer for capsule:', capsuleId, 'to:', transferState.transferTo);
      
      await transferCapsule(address, transferState.transferTo as `0x${string}`, BigInt(capsuleId));
      
      // On success, update states
      setTransferSuccess(prev => ({
        ...prev,
        [capsuleId]: {
          success: true,
          txHash: txHash || ''
        }
      }));

      // Update Supabase if configured
      if (SupabaseCapsuleService.isConfigured()) {
        SupabaseCapsuleService.updateCapsuleOwner(capsuleId, transferState.transferTo)
          .then(() => console.log('Capsule owner updated in Supabase'))
          .catch(err => console.warn('Failed to update owner in Supabase:', err));
      }

      // Reset transfer state
      setTransferStates(prev => ({
        ...prev,
        [capsuleId]: {
          showTransfer: false,
          transferTo: '',
          isTransferring: false
        }
      }));

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setTransferSuccess(prev => ({
          ...prev,
          [capsuleId]: {
            success: false,
            txHash: ''
          }
        }));
        // Refresh the capsules list
        refetch();
      }, 5000);

    } catch (error: any) {
      console.error('Transfer failed:', error);
      
      // Reset transferring state on error
      setTransferStates(prev => ({
        ...prev,
        [capsuleId]: {
          ...prev[capsuleId],
          isTransferring: false
        }
      }));
    }
  };

  // MetaMask guide functions
  const toggleMetaMaskGuide = (capsuleId: number) => {
    setShowMetaMaskGuide(prev => ({
      ...prev,
      [capsuleId]: !prev[capsuleId]
    }));
  };

  // Get unique unlock methods for filter dropdown
  const uniqueUnlockMethods = Array.from(new Set(capsules.map(c => c.unlock_method)));

  return (
    <div className="container mx-auto px-4 pt-32 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My NFT Capsules</h1>
            <p className="text-gray-600">
              {SupabaseCapsuleService.isConfigured() 
                ? 'Enhanced with Supabase indexing for fast loading and search'
                : 'Manage and view your legacy NFT capsules stored on the blockchain'
              }
            </p>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={true}
              onClick={() => navigate('/create')}
            >
              Create New Capsule
            </Button>
          </div>
        </div>

        {/* Supabase Status Indicator */}
        {SupabaseCapsuleService.isConfigured() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Enhanced Indexing Active</h3>
                <p className="text-sm text-blue-700">
                  Your capsules are indexed in Supabase for faster loading, search, and filtering capabilities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search capsules by title or unlock method..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* Search Button */}
            <Button
              variant="primary"
              size="md"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">Filter by unlock method:</label>
                <select
                  value={selectedFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Methods</option>
                  {uniqueUnlockMethods.map(method => (
                    <option key={method} value={method}>
                      {getUnlockMethodDisplayName(method)}
                    </option>
                  ))}
                </select>
                
                {(searchQuery || selectedFilter) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {SupabaseCapsuleService.isConfigured() 
                ? 'Loading your capsules from Supabase...'
                : 'Loading your capsules from the blockchain...'
              }
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <p className="text-red-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && capsules.length === 0 && (
          <div className="text-center py-12">
            <Hash className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || selectedFilter ? 'No Matching Capsules Found' : 'No Capsules Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedFilter 
                ? 'Try adjusting your search or filter criteria.'
                : 'You haven\'t created any NFT capsules yet. Start preserving your legacy today!'
              }
            </p>
            <div className="space-y-4">
              {searchQuery || selectedFilter ? (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  icon={true}
                  onClick={() => navigate('/create')}
                >
                  Create Your First Capsule
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={handleRefresh}
              >
                Refresh from {SupabaseCapsuleService.isConfigured() ? 'Supabase' : 'Blockchain'}
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && capsules.length > 0 && (
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                {searchQuery || selectedFilter 
                  ? `Found ${capsules.length} capsule${capsules.length === 1 ? '' : 's'} matching your criteria`
                  : `Showing ${capsules.length} capsule${capsules.length === 1 ? '' : 's'}`
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {capsules.map((capsule) => (
                <CapsuleCard
                  key={capsule.id}
                  capsule={capsule}
                  onView={() => handleViewCapsule(capsule.id)}
                  transferState={transferStates[capsule.id]}
                  transferSuccess={transferSuccess[capsule.id]}
                  onToggleTransfer={() => toggleTransfer(capsule.id)}
                  onUpdateTransferTo={(value) => updateTransferTo(capsule.id, value)}
                  onTransfer={() => handleTransfer(capsule.id)}
                  isConnected={isConnected}
                  userAddress={address}
                  showMetaMaskGuide={showMetaMaskGuide[capsule.id]}
                  onToggleMetaMaskGuide={() => toggleMetaMaskGuide(capsule.id)}
                />
              ))}
            </div>

            {/* Statistics */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Legacy Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard
                  label="Total Capsules"
                  value={capsules.length.toString()}
                  icon={<Hash className="h-5 w-5" />}
                />
                <StatCard
                  label="Unlocked"
                  value={capsules.filter(c => c.is_unlocked).length.toString()}
                  icon={<Unlock className="h-5 w-5" />}
                />
                <StatCard
                  label="Locked"
                  value={capsules.filter(c => !c.is_unlocked).length.toString()}
                  icon={<Lock className="h-5 w-5" />}
                />
                <StatCard
                  label="With Recipients"
                  value={capsules.filter(c => c.recipient_address && c.recipient_address !== '0x0000000000000000000000000000000000000000').length.toString()}
                  icon={<User className="h-5 w-5" />}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CapsuleCard: React.FC<{
  capsule: any;
  onView: () => void;
  transferState?: {
    showTransfer: boolean;
    transferTo: string;
    isTransferring: boolean;
  };
  transferSuccess?: {
    success: boolean;
    txHash: string;
  };
  onToggleTransfer: () => void;
  onUpdateTransferTo: (value: string) => void;
  onTransfer: () => void;
  isConnected: boolean;
  userAddress?: string;
  showMetaMaskGuide: boolean;
  onToggleMetaMaskGuide: () => void;
}> = ({ 
  capsule, 
  onView, 
  transferState, 
  transferSuccess,
  onToggleTransfer, 
  onUpdateTransferTo, 
  onTransfer,
  isConnected,
  userAddress,
  showMetaMaskGuide,
  onToggleMetaMaskGuide
}) => {
  const getUnlockMethodDisplayName = (method: string) => {
    const names = {
      'passphrase': 'Secret Passphrase',
      'qa': 'Question & Answer',
      'payment': 'Payment Required',
      'qrcode': 'QR Code Scan',
      'geolocation': 'Location Verification',
      'token': 'Token Ownership',
      'quiz': 'Quiz Answer',
      'timed': 'Time-based Release',
      'multi-step': 'Multi-Step Verification'
    };
    return names[method as keyof typeof names] || method;
  };

  // Check if current user is the owner
  const isOwner = userAddress && capsule.owner_address && 
    userAddress.toLowerCase() === capsule.owner_address.toLowerCase();

  // Get contract address from environment
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      {/* Transfer Success Notification */}
      {transferSuccess?.success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <div className="flex-1">
              <p className="text-green-800 text-sm font-medium">Transfer Successful!</p>
              <p className="text-green-700 text-xs mt-1">NFT has been transferred to the new owner.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-3 ${
            capsule.is_unlocked ? 'bg-green-50' : 'bg-blue-50'
          }`}>
            {capsule.is_unlocked ? (
              <Unlock className="h-5 w-5 text-green-600" />
            ) : (
              <Lock className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">#{capsule.id}</h3>
            <p className={`text-xs ${
              capsule.is_unlocked ? 'text-green-600' : 'text-blue-600'
            }`}>
              {capsule.is_unlocked ? 'Unlocked' : 'Locked'}
            </p>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          
          {/* Transfer Button - Only show for owners */}
          {isConnected && isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleTransfer}
              disabled={transferState?.isTransferring}
            >
              <Send className="h-4 w-4 mr-1" />
              {transferState?.showTransfer ? 'Cancel' : 'Transfer'}
            </Button>
          )}

          {/* MetaMask Import Guide Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleMetaMaskGuide}
            className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            <Wallet className="h-4 w-4 mr-1" />
            {showMetaMaskGuide ? 'Hide Guide' : 'Import Guide'}
          </Button>
        </div>
      </div>

      <h4 className="text-lg font-medium text-gray-900 mb-3">{capsule.title}</h4>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <span className="font-medium mr-2">Type:</span>
          <span className="capitalize">{capsule.content_type} Message</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium mr-2">Unlock:</span>
          <span>{getUnlockMethodDisplayName(capsule.unlock_method)}</span>
        </div>
        {capsule.recipient_address && capsule.recipient_address !== '0x0000000000000000000000000000000000000000' && (
          <div className="flex items-center">
            <span className="font-medium mr-2">For:</span>
            <span className="font-mono text-xs">
              {capsule.recipient_address.slice(0, 6)}...{capsule.recipient_address.slice(-4)}
            </span>
          </div>
        )}
        <div className="flex items-center">
          <span className="font-medium mr-2">Owner:</span>
          <span className="font-mono text-xs">
            {capsule.owner_address.slice(0, 6)}...{capsule.owner_address.slice(-4)}
          </span>
        </div>
        <div className="flex items-center">
          <span className="font-medium mr-2">Created:</span>
          <span className="text-xs">
            {new Date(capsule.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Transfer Interface */}
      {transferState?.showTransfer && isConnected && isOwner && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Transfer NFT</h5>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Recipient Address *
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={transferState.transferTo}
                onChange={(e) => onUpdateTransferTo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                disabled={transferState.isTransferring}
                autoComplete="off"
                spellCheck="false"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a valid Ethereum address (42 characters starting with 0x)
              </p>
              {transferState.transferTo && !transferState.transferTo.match(/^0x[a-fA-F0-9]{40}$/) && (
                <p className="text-red-600 text-xs mt-1">
                  ⚠️ Please enter a valid Ethereum address
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={onTransfer}
                disabled={!transferState.transferTo || !transferState.transferTo.match(/^0x[a-fA-F0-9]{40}$/) || transferState.isTransferring}
                className="flex-1 text-xs"
              >
                {transferState.isTransferring ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  'Confirm Transfer'
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleTransfer}
                disabled={transferState.isTransferring}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MetaMask Import Guide */}
      {showMetaMaskGuide && (
        <div className="mt-4 p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <Wallet className="h-5 w-5 text-orange-600 mr-2" />
              <h5 className="text-sm font-medium text-orange-900">Import NFT to MetaMask</h5>
            </div>
            <button
              onClick={onToggleMetaMaskGuide}
              className="text-orange-600 hover:text-orange-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-3 text-sm text-orange-800">
            <p className="font-medium">Follow these steps to view your Legacy Capsule NFT in MetaMask:</p>
            
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="bg-orange-200 text-orange-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</span>
                <div>
                  <p className="font-medium">Open MetaMask</p>
                  <p className="text-xs text-orange-700">Make sure you're connected to the correct network</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="bg-orange-200 text-orange-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</span>
                <div>
                  <p className="font-medium">Go to NFTs tab</p>
                  <p className="text-xs text-orange-700">Click on "NFTs" in your MetaMask wallet</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="bg-orange-200 text-orange-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</span>
                <div>
                  <p className="font-medium">Click "Import NFT"</p>
                  <p className="text-xs text-orange-700">Look for the "Import NFT" or "+" button</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="bg-orange-200 text-orange-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">4</span>
                <div>
                  <p className="font-medium">Enter Contract Details</p>
                  <div className="mt-1 space-y-1">
                    <div className="bg-white rounded p-2 border border-orange-200">
                      <p className="text-xs font-medium text-orange-900">Contract Address:</p>
                      <p className="font-mono text-xs text-orange-800 break-all">
                        {contractAddress || 'Contract not configured'}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2 border border-orange-200">
                      <p className="text-xs font-medium text-orange-900">Token ID:</p>
                      <p className="font-mono text-xs text-orange-800">
                        {capsule.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="bg-orange-200 text-orange-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">5</span>
                <div>
                  <p className="font-medium">Click "Import"</p>
                  <p className="text-xs text-orange-700">Your Legacy Capsule NFT will appear in MetaMask!</p>
                </div>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-orange-100 rounded-lg border border-orange-300">
              <div className="flex items-start">
                <Info className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-orange-900">💡 Pro Tip:</p>
                  <p className="text-xs text-orange-800">
                    Once imported, you can view your NFT's metadata, transfer it, or showcase it in your MetaMask collection. 
                    The NFT represents ownership of your Legacy Capsule on the blockchain!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {capsule.metadata_uri && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Metadata URI</span>
            <a
              href={getIPFSGatewayURL(capsule.metadata_uri)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-xs text-blue-600 font-mono mt-1 truncate">
            {capsule.metadata_uri}
          </p>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="text-blue-600">{icon}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

export default MyCapsules;