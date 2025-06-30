import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Sparkles, ExternalLink, Image as ImageIcon, Video, FileText, Award, Loader2 } from 'lucide-react';
import { getIPFSGatewayURL, fetchContentFromIPFS } from '../utils/pinataService';

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
    contentUrl?: string; // NEW: Direct content URL from IPFS
  };
  imageUrls?: string[]; // Now exclusively for IPFS URIs
  metadataContent?: any;
}

const UnlockedContentPopup: React.FC<UnlockedContentPopupProps> = ({
  isVisible,
  onClose,
  capsuleData,
  imageUrls = [], // Default to empty array
  metadataContent
}) => {
  // NEW: State for fetching content from IPFS
  const [actualContent, setActualContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentError, setContentError] = useState<string>('');

  // NEW: Fetch actual content from IPFS when popup opens and content URL is available
  useEffect(() => {
    if (isVisible && capsuleData.contentUrl && capsuleData.type === 'text' && !actualContent) {
      const fetchContent = async () => {
        setIsLoadingContent(true);
        setContentError('');
        
        try {
          console.log('Fetching content from IPFS URL:', capsuleData.contentUrl);
          const content = await fetchContentFromIPFS(capsuleData.contentUrl);
          setActualContent(content);
          console.log('Successfully fetched content from IPFS');
        } catch (error) {
          console.error('Error fetching content from IPFS:', error);
          setContentError('Failed to load content from IPFS');
          // Fallback to the message from capsuleData
          setActualContent(capsuleData.message);
        } finally {
          setIsLoadingContent(false);
        }
      };

      fetchContent();
    }
  }, [isVisible, capsuleData.contentUrl, capsuleData.type, capsuleData.message, actualContent]);

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

  // Determine what content to display
  const displayContent = actualContent || capsuleData.message;

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
              {capsuleData.contentUrl && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  From IPFS
                </span>
              )}
            </h4>
            
            {/* Content loading state */}
            {isLoadingContent ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Loading content from IPFS...</span>
              </div>
            ) : contentError ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ {contentError}. Showing fallback content.
                </p>
              </div>
            ) : null}
            
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {displayContent}
              </p>
            </div>

            {/* Show content source info */}
            {capsuleData.contentUrl && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>🌐 Content Source:</strong> This content was fetched directly from IPFS, ensuring permanent and decentralized storage.
                </p>
                <div className="mt-2 flex items-center">
                  <span className="text-blue-700 text-xs mr-2">IPFS URI:</span>
                  <a 
                    href={getIPFSGatewayURL(capsuleData.contentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs font-mono break-all flex items-center"
                  >
                    {capsuleData.contentUrl}
                    <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Display images from IPFS */}
          {imageUrls.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2 text-purple-600" />
                Images from IPFS
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageUrls.map((uri, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getIPFSGatewayURL(uri)}
                      alt={`Capsule image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-sm border border-gray-200"
                      onError={(e) => {
                        console.error('Failed to load image from IPFS:', uri);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg" />
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      IPFS
                    </div>
                    {/* Link to view full image */}
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href={getIPFSGatewayURL(uri)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1 rounded-full hover:bg-opacity-100 transition-all flex items-center"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>🌐 IPFS Storage:</strong> These images are permanently stored on the InterPlanetary File System (IPFS) 
                  via Pinata, ensuring they remain accessible and uncensorable forever.
                </p>
              </div>
            </div>
          )}

          {/* Life lesson section - Enhanced display */}
          {capsuleData.lifeLesson && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                Life Lesson or Connected Event
              </h4>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="bg-yellow-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap italic text-lg">
                      "{capsuleData.lifeLesson}"
                    </p>
                    <div className="mt-3 text-right">
                      <span className="text-yellow-700 text-sm font-medium">— Legacy Wisdom</span>
                    </div>
                  </div>
                </div>
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
                {metadataContent.properties?.image_uris && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Images on IPFS:</span>
                    <p className="text-gray-600 text-xs">
                      {metadataContent.properties.image_uris.length} image{metadataContent.properties.image_uris.length !== 1 ? 's' : ''} stored permanently
                    </p>
                  </div>
                )}
                {metadataContent.properties?.content_url && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Content on IPFS:</span>
                    <p className="text-gray-600 text-xs font-mono break-all">
                      {metadataContent.properties.content_url}
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
              <span>Legacy successfully unlocked and preserved on IPFS</span>
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