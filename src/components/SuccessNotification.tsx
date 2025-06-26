import React, { useState } from 'react';
import { CheckCircle, Sparkles, Hash, ExternalLink, X, QrCode, Camera, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getIPFSGatewayURL } from '../utils/pinataService';

interface SuccessNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  metadataURI?: string;
  txHash?: string;
  title: string;
  capsuleId?: number;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  isVisible,
  onClose,
  metadataURI,
  txHash,
  title,
  capsuleId
}) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);

  if (!isVisible) return null;

  // Generate QR code data - this could be the capsule access URL or metadata URI
  const qrCodeData = metadataURI || `https://legacycode.app/capsule/${capsuleId || 'unknown'}`;

  const handleDownloadQR = () => {
    const svg = document.getElementById('success-qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `legacycode-capsule-${capsuleId || 'qr'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `LegacyCode Capsule: ${title}`,
          text: 'I just created a legacy capsule! Scan this QR code to access it.',
          url: qrCodeData
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrCodeData);
      alert('QR code data copied to clipboard!');
    }
  };

  const handlePhotoPrompt = () => {
    setPhotoTaken(true);
    // In a real implementation, you might want to:
    // 1. Access the device camera
    // 2. Take a photo of the QR code
    // 3. Save it to the device
    // For now, we'll just mark it as taken
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Colorful gradient header */}
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
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Success icon with animation */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-25"></div>
              <div className="relative bg-white rounded-full p-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-center mb-2">
            🎉 NFT Capsule Created Successfully!
          </h2>
          <p className="text-center text-green-100 text-sm">
            Your legacy NFT has been minted on the blockchain
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">"{title}"</h3>
            {capsuleId && (
              <p className="text-gray-600 text-sm mb-2">
                Capsule ID: #{capsuleId}
              </p>
            )}
            <p className="text-gray-600 text-sm">
              Your NFT capsule has been successfully minted and stored on the blockchain.
            </p>
          </div>

          {/* QR Code Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <QrCode className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900">Access QR Code</h4>
                  <p className="text-sm text-gray-600">Scan to access your capsule</p>
                </div>
              </div>
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showQRCode ? 'Hide' : 'Show'}
              </button>
            </div>

            {showQRCode && (
              <div className="space-y-4">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <QRCodeSVG
                      id="success-qr-code"
                      value={qrCodeData}
                      size={200}
                      level="H"
                      includeMargin={true}
                      className="block"
                    />
                  </div>
                </div>

                {/* QR Code Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadQR}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={handleShareQR}
                    className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </button>
                </div>

                {/* Photo Prompt */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Camera className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h5 className="font-medium text-amber-800 mb-2">
                        📸 Important: Take a Photo!
                      </h5>
                      <p className="text-amber-700 text-sm mb-3">
                        We recommend taking a photo of this QR code for backup access to your capsule. 
                        Store it safely with your important documents.
                      </p>
                      <button
                        onClick={handlePhotoPrompt}
                        disabled={photoTaken}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          photoTaken 
                            ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                            : 'bg-amber-600 text-white hover:bg-amber-700'
                        }`}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {photoTaken ? '✓ Photo Reminder Acknowledged' : 'Remind Me to Take Photo'}
                      </button>
                      {photoTaken && (
                        <p className="text-green-600 text-xs mt-2">
                          ✓ Great! Don't forget to save the photo in a secure location.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* QR Code Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 break-all">
                    <strong>QR Data:</strong> {qrCodeData}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Transaction details */}
          <div className="space-y-3">
            {metadataURI && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900 flex items-center">
                    <Hash className="h-4 w-4 mr-1" />
                    Metadata on IPFS
                  </span>
                  <a
                    href={getIPFSGatewayURL(metadataURI)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="text-xs text-blue-700 font-mono break-all">
                  {metadataURI}
                </p>
              </div>
            )}

            {txHash && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Transaction Hash
                  </span>
                </div>
                <p className="text-xs text-green-700 font-mono break-all">
                  {txHash}
                </p>
              </div>
            )}
          </div>

          {/* Status indicators */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 text-center">
              <div className="text-green-600 mb-1">✅</div>
              <div className="text-xs font-medium text-green-800">Blockchain</div>
              <div className="text-xs text-green-600">Minted</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 text-center">
              <div className="text-blue-600 mb-1">🌐</div>
              <div className="text-xs font-medium text-blue-800">IPFS</div>
              <div className="text-xs text-blue-600">Stored</div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Continue to Finalize
          </button>
        </div>

        {/* Decorative bottom border */}
        <div className="h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
      </div>
    </div>
  );
};

export default SuccessNotification;