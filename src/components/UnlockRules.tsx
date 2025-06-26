import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Key, FileQuestion, DollarSign, QrCode, MapPin, Wallet, BrainCircuit, Calendar } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Button from './Button';

type UnlockMethod = 'passphrase' | 'qa' | 'payment' | 'qrcode' | 'geolocation' | 'token' | 'quiz' | 'timed';

interface UnlockRulesData {
  method: UnlockMethod;
  passphrase?: string;
  personName?: string;
  dateOfBirth?: string;
  mothersName?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  unlockFee?: number;
  qrPhrase?: string;
  extractedPhrase?: string;
  location?: string;
  erc20TokenAddress?: string;
  erc20UnlockAmount?: number;
  erc721ContractAddress?: string;
  unlockTokenId?: string;
  quizAnswer?: string;
  unlockDate?: string;
}

interface CapsuleData {
  title: string;
  type: 'text' | 'video';
  message: string;
  recipient: string;
  lifeLesson: string;
  file?: File;
  videoBlob?: Blob;
  images: File[];
}

const cities = [
  'New York, USA',
  'London, UK',
  'Tokyo, Japan',
  'Paris, France',
  'Sydney, Australia',
  'Dubai, UAE',
  'Singapore',
  'Toronto, Canada',
];

const UnlockRules: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<UnlockRulesData>({
    method: 'passphrase',
  });

  // Get capsule data from navigation state
  const capsuleFormData = location.state?.capsuleFormData as CapsuleData;

  useEffect(() => {
    // Check if we have capsule data from the previous step
    if (!capsuleFormData) {
      // If no data in state, inform user and redirect
      alert('Capsule data was lost. This can happen if you refresh the page. Please start over.');
      navigate('/create');
      return;
    }
  }, [capsuleFormData, navigate]);

  const handleMethodChange = (method: UnlockMethod) => {
    setFormData({ ...formData, method });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === 'erc20UnlockAmount' || name === 'unlockFee') {
      const numericValue = parseFloat(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: isNaN(numericValue) ? undefined : numericValue 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    let isValid = true;
    switch (formData.method) {
      case 'passphrase':
        isValid = !!formData.passphrase;
        break;
      case 'qa':
        isValid = !!(formData.personName && formData.dateOfBirth && formData.mothersName);
        break;
      case 'payment':
        isValid = !!formData.unlockFee;
        break;
      case 'qrcode':
        isValid = !!(formData.qrPhrase && formData.extractedPhrase);
        break;
      case 'geolocation':
        isValid = !!formData.location;
        break;
      case 'token':
        // Check if at least one token requirement is specified
        const hasERC20 = !!(formData.erc20TokenAddress && formData.erc20UnlockAmount && formData.erc20UnlockAmount > 0);
        const hasERC721 = !!formData.erc721ContractAddress;
        isValid = hasERC20 || hasERC721;
        
        if (!isValid) {
          alert('Please specify at least one token requirement: ERC-20 token with amount, or ERC-721 NFT contract address.');
          return;
        }
        break;
      case 'quiz':
        isValid = !!formData.quizAnswer;
        break;
      case 'timed':
        isValid = !!formData.unlockDate;
        break;
    }

    if (!isValid) {
      alert('Please fill in all required fields for the selected unlock method.');
      return;
    }

    // Navigate to finalize with both capsule data and unlock rules
    navigate('/finalize', { 
      state: { 
        capsuleFormData: capsuleFormData, 
        unlockRules: formData 
      } 
    });
  };

  // Show loading if no capsule data
  if (!capsuleFormData) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Set Capsule Unlock Rules</h1>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Choose how your capsule will be unlocked
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'passphrase', icon: <Key />, label: 'Passphrase' },
                { id: 'qa', icon: <FileQuestion />, label: 'Q&A' },
                { id: 'payment', icon: <DollarSign />, label: 'Payment' },
                { id: 'qrcode', icon: <QrCode />, label: 'QR Code' },
                { id: 'geolocation', icon: <MapPin />, label: 'Location' },
                { id: 'token', icon: <Wallet />, label: 'Token' },
                { id: 'quiz', icon: <BrainCircuit />, label: 'Quiz' },
                { id: 'timed', icon: <Calendar />, label: 'Timed' },
              ].map(({ id, icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleMethodChange(id as UnlockMethod)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                    formData.method === id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-200 text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {React.cloneElement(icon as React.ReactElement, {
                    className: 'h-6 w-6 mb-2',
                  })}
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {formData.method === 'passphrase' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Create a secret passphrase
                </label>
                <input
                  type="password"
                  name="passphrase"
                  value={formData.passphrase || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a secure passphrase"
                />
              </div>
            )}

            {formData.method === 'qa' && (
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name of Person
                  </label>
                  <input
                    type="text"
                    name="personName"
                    value={formData.personName || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the person's full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's First Name
                  </label>
                  <input
                    type="text"
                    name="mothersName"
                    value={formData.mothersName || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter mother's first name"
                  />
                </div>
                <div className="pt-4 border-t border-gray-300">
                  <p className="text-sm text-gray-600 mb-4">
                    All three answers must match exactly to unlock the capsule.
                  </p>
                </div>
              </div>
            )}

            {formData.method === 'payment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set an unlock fee in ETH
                </label>
                <input
                  type="number"
                  name="unlockFee"
                  value={formData.unlockFee || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount in ETH (e.g., 0.01)"
                />
                <p className="mt-2 text-sm text-gray-500">
                  This amount in ETH will be required for unlocking
                </p>
              </div>
            )}

            {formData.method === 'qrcode' && (
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Embed unlock phrase (will generate QR code)
                  </label>
                  <input
                    type="text"
                    name="qrPhrase"
                    value={formData.qrPhrase || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter text to encode in QR"
                  />
                </div>

                {formData.qrPhrase && (
                  <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                    <QRCodeSVG
                      value={formData.qrPhrase}
                      size={200}
                      level="H"
                      includeMargin={true}
                      className="bg-white p-2 rounded-lg"
                    />
                    <p className="text-sm text-gray-600">
                      Scan this QR code to extract the unlock phrase
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter extracted phrase to verify
                  </label>
                  <input
                    type="text"
                    name="extractedPhrase"
                    value={formData.extractedPhrase || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the phrase from QR code"
                  />
                  {formData.extractedPhrase && formData.qrPhrase && (
                    <p className={`mt-2 text-sm ${
                      formData.extractedPhrase === formData.qrPhrase
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formData.extractedPhrase === formData.qrPhrase
                        ? '✓ Phrases match'
                        : '✗ Phrases do not match'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {formData.method === 'geolocation' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select required location
                </label>
                <select
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.method === 'token' && (
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Token Requirements</h3>
                  <p className="text-sm text-gray-600">
                    Specify the ERC-20 token and/or ERC-721 NFT requirements for unlocking this capsule.
                  </p>
                </div>

                {/* ERC-20 Token Section */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-gray-900">ERC-20 Token (Optional)</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ERC-20 Token Contract Address
                      </label>
                      <input
                        type="text"
                        name="erc20TokenAddress"
                        value={formData.erc20TokenAddress || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter ERC-20 token contract address (0x...)"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        The contract address of the ERC-20 token required for unlocking
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Required Token Amount *
                      </label>
                      <input
                        type="number"
                        name="erc20UnlockAmount"
                        value={formData.erc20UnlockAmount || ''}
                        onChange={handleInputChange}
                        min="0"
                        step="0.000000000000000001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter required token amount (e.g., 100)"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        The minimum amount of tokens required to unlock the capsule (in token units, not wei)
                      </p>
                      {formData.erc20TokenAddress && formData.erc20UnlockAmount && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Requirement:</strong> User must own at least {formData.erc20UnlockAmount} tokens from the specified contract
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ERC-721 NFT Section */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <Wallet className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-medium text-gray-900">ERC-721 NFT (Optional)</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ERC-721 NFT Contract Address
                      </label>
                      <input
                        type="text"
                        name="erc721ContractAddress"
                        value={formData.erc721ContractAddress || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter ERC-721 NFT contract address (0x...)"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        The contract address of the ERC-721 NFT collection required for unlocking
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specific Token ID (Optional)
                      </label>
                      <input
                        type="number"
                        name="unlockTokenId"
                        value={formData.unlockTokenId || ''}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter specific NFT token ID (leave empty for any token from collection)"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        If specified, only this exact NFT token ID will unlock the capsule. If left empty, any NFT from the collection will work.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Validation Note */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You must specify at least one token requirement (ERC-20 or ERC-721). 
                    The user will need to own the required tokens to unlock the capsule.
                  </p>
                </div>

                {/* Current Implementation Note */}
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Implementation Note:</strong> In the current contract version, both ERC-20 and ERC-721 
                    addresses will be set to the same value for testing purposes. Future versions will support 
                    separate addresses for each token type.
                  </p>
                </div>
              </div>
            )}

            {formData.method === 'quiz' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected answer to legacy question
                </label>
                <input
                  type="text"
                  name="quizAnswer"
                  value={formData.quizAnswer || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter the correct answer"
                />
              </div>
            )}

            {formData.method === 'timed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set unlock date and time
                </label>
                <input
                  type="datetime-local"
                  name="unlockDate"
                  value={formData.unlockDate || ''}
                  onChange={handleInputChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  The capsule will automatically unlock at this date and time
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Lock className="h-5 w-5 mr-2" />
              <span className="text-sm">Your capsule will be securely encrypted</span>
            </div>
            <Button
              variant="primary"
              size="lg"
              icon={true}
              onClick={handleNext}
            >
              Next: Finalize Capsule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnlockRules;