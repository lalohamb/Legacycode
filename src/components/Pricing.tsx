import React from 'react';
import { Check, Coins, Shield, Zap, Globe, ArrowRight, DollarSign, Wallet, CreditCard } from 'lucide-react';
import { formatEther } from 'viem';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { useCapsuleContract } from '../hooks/useCapsuleContract';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { getMintingFee, getFeeRecipient } = useCapsuleContract();
  const { data: mintingFee } = getMintingFee();
  const { data: feeRecipient } = getFeeRecipient();

  return (
    <div className="pt-32 pb-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-block p-4 bg-blue-50 rounded-full mb-6">
            <Coins className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Simple, Pay-Per-Capsule Pricing
          </h1>
          <p className="text-xl text-gray-600">
            No subscriptions, no hidden fees. Pay only when you create a legacy capsule.
          </p>
        </div>

        {/* Main Pricing Display */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center shadow-2xl">
            <div className="mb-6">
              <div className="inline-block p-3 bg-white/20 rounded-full mb-4">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">One-Time Fee Per Capsule</h2>
              <p className="text-blue-100">Create unlimited capsules, pay only when you mint</p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <div className="text-5xl font-bold mb-2">
                {mintingFee ? formatEther(mintingFee) : '0.006'} ETH
              </div>
              <div className="text-blue-100 text-lg">per NFT capsule created</div>
              {!mintingFee && (
                <div className="text-blue-200 text-sm mt-2">
                  *Fee shown is default. Connect to see current rate.
                </div>
              )}
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                <span>Permanent blockchain storage</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                <span>IPFS content hosting via Pinata</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                <span>Advanced unlock mechanisms</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                <span>Transferable NFT ownership</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                <span>No recurring fees ever</span>
              </div>
            </div>

            <div className="mt-8">
              <Button
                variant="secondary"
                size="lg"
                icon={true}
                onClick={() => navigate('/create')}
                className="w-full bg-white text-blue-600 hover:bg-gray-100"
              >
                Create Your First Capsule
              </Button>
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-blue-500" />}
            title="Blockchain Security"
            description="Your fee covers the gas costs for minting your NFT on the Ethereum blockchain, ensuring permanent and immutable storage."
          />
          <FeatureCard
            icon={<Globe className="h-8 w-8 text-blue-500" />}
            title="IPFS Storage"
            description="Content is stored on IPFS via Pinata for decentralized, permanent access. No monthly hosting fees required."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-blue-500" />}
            title="Platform Maintenance"
            description="Supports ongoing development, security updates, and infrastructure to keep your legacy accessible forever."
          />
        </div>

        {/* Fee Details */}
        {(mintingFee || feeRecipient) && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Current Fee Structure</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {mintingFee && (
                <div className="text-center">
                  <div className="inline-block p-3 bg-green-50 rounded-full mb-4">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Minting Fee</h3>
                  <p className="text-3xl font-bold text-green-600 mb-2">{formatEther(mintingFee)} ETH</p>
                  <p className="text-gray-600 text-sm">Live rate from smart contract</p>
                </div>
              )}
              
              {feeRecipient && (
                <div className="text-center">
                  <div className="inline-block p-3 bg-purple-50 rounded-full mb-4">
                    <Wallet className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fee Recipient</h3>
                  <p className="text-purple-600 font-mono text-sm mb-2">
                    {feeRecipient.slice(0, 6)}...{feeRecipient.slice(-4)}
                  </p>
                  <p className="text-gray-600 text-sm">Platform treasury address</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <FAQ
                question="Why do I need to pay a fee?"
                answer="The fee covers blockchain gas costs for minting your NFT, IPFS storage via Pinata, and platform maintenance. This ensures your capsule is permanently stored and accessible."
              />
              <FAQ
                question="Are there any recurring charges?"
                answer="No! You pay once when creating each capsule. There are no monthly subscriptions, storage fees, or hidden charges. Your capsule remains accessible forever."
              />
              <FAQ
                question="What if ETH prices change?"
                answer="The fee is set in ETH and may be adjusted periodically to account for network conditions and operational costs. Current rates are always displayed before creation."
              />
              <FAQ
                question="Can I get a refund?"
                answer="Once a capsule is minted on the blockchain, the transaction is permanent and cannot be reversed. Please review your capsule carefully before finalizing."
              />
              <FAQ
                question="What payment methods do you accept?"
                answer="We accept ETH payments through any Web3 wallet (MetaMask, WalletConnect, etc.). The fee is paid directly to the smart contract during minting."
              />
              <FAQ
                question="Is there a limit to capsule size?"
                answer="Content is stored on IPFS with generous limits. Large files may take longer to upload, but there's no strict size limit for most use cases."
              />
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Pay-Per-Capsule Works Better</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <ValueCard
              title="No Waste"
              description="Only pay for what you actually create. Perfect for occasional use or special occasions."
            />
            <ValueCard
              title="Permanent Access"
              description="One payment ensures your capsule exists forever on the blockchain and IPFS."
            />
            <ValueCard
              title="True Ownership"
              description="Your NFT capsule is truly yours. Transfer, sell, or keep it - no platform lock-in."
            />
          </div>
          
          <Button
            variant="primary"
            size="lg"
            icon={true}
            onClick={() => navigate('/create')}
            className="inline-flex"
          >
            Start Creating Your Legacy
          </Button>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg text-center">
      <div className="bg-blue-50 rounded-lg p-3 inline-block mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

const ValueCard: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
      <h4 className="text-lg font-semibold text-gray-900 mb-3">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

const FAQ: React.FC<{
  question: string;
  answer: string;
}> = ({ question, answer }) => {
  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-2">{question}</h4>
      <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
    </div>
  );
};

export default Pricing;