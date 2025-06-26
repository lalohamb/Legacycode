import React from 'react';
import { X, CheckCircle, Sparkles, ExternalLink, Image as ImageIcon, Video, FileText, Award } from 'lucide-react';
import { getIPFSGatewayURL } from '../utils/pinataService';

interface UnlockedContentPopupProps {
  isVisible: boolean;
  onClose: () => void;
  capsuleData: {
    id: number;
    title: string;
    message: string;
    type: 'text' | 'video';
    lifeLesson?: string;
    unlockMethod: string;
  };
  uploadResult?: {
    metadataURI?: string;
    contentURI?: string;
    imageURIs: string[];
  };
  imageUrls?: string[];
  metadataContent?: any;
}

const UnlockedContentPopup: React.FC<UnlockedContentPopupProps> = ({
  isVisible,
  onClose,
  capsuleData,
  uploadResult,
  imageUrls = [],
  metadataContent
}) => {
  if (!isVisible) return null;

  const getMethodDisplayName = (method: string) => {
    const names = {
      'passphrase': 'Secret Passphrase',
      'qa': 'Question & Answer',
      'payment': 'Payment Required',
      'qrcode': 'QR Code Scan',
      'geolocation': 'Location Verification',
      'token': 'Token Ownership',
      'quiz': 'Quiz Answer',
      'timed': 'Time-based Release'
    };
    return names[method as keyof typeof names] || method;
  };

  // Determine which images to display
  const displayImages = uploadResult?.imageURIs && uploadResult.imageURIs.length > 0 
    ? uploadResult.imageURIs 
    : imageUrls;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-6 text-white relative overflow-hidden">
          {/* Animated sparkles */}
          <div className="absolute inset-0 opacity-20">
            <Sparkles className="absolute top-2 right-4 h-4 w-4 animate-pulse" />
            <Sparkles className="absolute top-8 left-6 h-3 w-3 animate-pulse delay-300" />
            <Sparkles className="absolute bottom-4 right-8 h-5 w-5 animate-pulse delay-700" />
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Success icon with animation */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-25"></div>
              <div className="relative bg-white rounded-full p-3">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">
            🎉 Capsule Unlocked Successfully!
          </h2>
          <p className="text-center text-green-100 text-sm">
            Unlocked using: {getMethodDisplayName(capsuleData.unlockMethod)}
          </p>
        </div>

        {/* Content area with scroll */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {/* Capsule info */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{capsuleData.title}</h3>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Award className="h-4 w-4 mr-1 text-blue-500" />
                Capsule #{capsuleData.id}
              </span>
              <span className="flex items-center">
                {capsuleData.type === 'text' ? (
                  <FileText className="h-4 w-4 mr-1 text-green-500" />
                ) : (
                  <Video className="h-4 w-4 mr-1 text-purple-500" />
                )}
                {capsuleData.type === 'text' ? 'Text Message' : 'Video Message'}
              </span>
            </div>
          </div>

          {/* Main content */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Legacy Message
            </h4>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {capsuleData.message}
              </p>
            </div>
          </div>

          {/* Display Pinata IPFS images if available */}
          {displayImages.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2 text-purple-600" />
                {uploadResult?.imageURIs ? 'Images from Pinata IPFS' : 'Attached Images'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayImages.map((uri, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={uploadResult?.imageURIs ? getIPFSGatewayURL(uri) : uri}
                      alt={`Capsule image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-sm border border-gray-200"
                      onError={(e) => {
                        console.error('Failed to load image:', uri);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg" />
                    {uploadResult?.imageURIs && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        IPFS
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display content from Pinata IPFS if available */}
          {uploadResult?.contentURI && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ExternalLink className="h-5 w-5 mr-2 text-green-600" />
                Content on Pinata IPFS
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <a 
                  href={getIPFSGatewayURL(uploadResult.contentURI)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Content on IPFS
                </a>
                <p className="text-blue-700 text-sm mt-2 font-mono break-all">
                  {uploadResult.contentURI}
                </p>
              </div>
            </div>
          )}

          {/* Life lesson section */}
          {capsuleData.lifeLesson && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                Life Lesson
              </h4>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                  "{capsuleData.lifeLesson}"
                </p>
              </div>
            </div>
          )}

          {/* Metadata info if available */}
          {metadataContent && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {metadataContent.properties?.created_at && (
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <p className="text-gray-600">
                      {new Date(metadataContent.properties.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {metadataContent.properties?.creator && (
                  <div>
                    <span className="font-medium text-gray-700">Creator:</span>
                    <p className="text-gray-600 font-mono text-xs">
                      {metadataContent.properties.creator.slice(0, 6)}...{metadataContent.properties.creator.slice(-4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>Legacy successfully unlocked and preserved</span>
            </div>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-2 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Close
            </button>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
      </div>
    </div>
  );
};

export default UnlockedContentPopup;