import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Video, Clock, Upload, Camera, Image, Link, AlertCircle, CreditCard, DollarSign } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import Button from './Button';
import { useCapsuleContract } from '../hooks/useCapsuleContract';

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

// Type guard for hex addresses
function isValidHexAddress(address: string): address is `0x${string}` {
  return address.length === 42 && 
         address.startsWith('0x') &&
         /^0x[a-fA-F0-9]{40}$/.test(address);
}

const CreateCapsule: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  
  // 💰 Get minting fee from contract
  const { getMintingFee, getFeeRecipient } = useCapsuleContract();
  const { data: mintingFee } = getMintingFee();
  const { data: feeRecipient } = getFeeRecipient();
  
  const [formData, setFormData] = useState<CapsuleData>({
    title: '',
    type: 'text',
    message: '',
    recipient: '',
    lifeLesson: '',
    images: [],
  });

  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Clear local storage when component mounts to ensure fresh start
  useEffect(() => {
    console.log('CreateCapsule component mounted - clearing local storage for fresh start');
    localStorage.removeItem('capsuleData');
    localStorage.removeItem('unlockRules');
    localStorage.removeItem('uploadResult');
  }, []);

  // Debug logging for wallet connection state
  useEffect(() => {
    console.log('CreateCapsule - Wallet connection state:', { isConnected, address });
  }, [isConnected, address]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  }, []);

  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...acceptedFiles]
    }));
  }, []);

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov']
    },
    maxFiles: 1
  });

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: 'text' | 'video') => {
    setFormData(prev => ({ ...prev, type }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setFormData(prev => ({ ...prev, videoBlob: blob }));
        setRecordedChunks(chunks);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleNext = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    // Validate form data
    if (!formData.title.trim()) {
      alert('Please enter a capsule title');
      return;
    }

    if (formData.type === 'text' && !formData.message.trim()) {
      alert('Please enter a message for your text capsule');
      return;
    }

    if (formData.type === 'video' && !formData.file && !formData.videoBlob) {
      alert('Please upload or record a video for your video capsule');
      return;
    }

    // Navigate to unlock rules with capsule data in state
    console.log('Navigating to unlock rules with capsule data');
    navigate('/unlock-rules', { state: { capsuleFormData: formData } });
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Your Legacy NFT Capsule</h1>
        
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">Please connect your wallet to create an NFT capsule on the blockchain.</p>
          </div>
        )}

        {/* 💰 Minting Fee Display */}
        {mintingFee && isConnected && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-blue-900">Minting Fee Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Required Fee</label>
                <p className="text-2xl font-bold text-blue-900">{formatEther(mintingFee)} ETH</p>
                <p className="text-sm text-blue-600">This fee will be charged when you mint your NFT</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Fee Recipient</label>
                <p className="text-blue-900 font-mono text-sm">
                  {feeRecipient ? `${feeRecipient.slice(0, 6)}...${feeRecipient.slice(-4)}` : 'Loading...'}
                </p>
                <p className="text-sm text-blue-600">Platform fee collection address</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>Note:</strong> This fee covers the cost of minting your NFT on the blockchain. 
                You'll be prompted to pay this fee in the final step.
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {/* Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NFT Capsule Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a meaningful title for your NFT capsule"
                  required
                />
              </div>

              {/* Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capsule Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('text')}
                    className={`flex items-center justify-center p-4 rounded-lg border ${
                      formData.type === 'text'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Text Message
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('video')}
                    className={`flex items-center justify-center p-4 rounded-lg border ${
                      formData.type === 'video'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Video Message
                  </button>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Add Images (will be uploaded to Pinata IPFS during finalization)
                </label>
                <div
                  {...getImageRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isImageDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                >
                  <input {...getImageInputProps()} />
                  <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {isImageDragActive
                      ? "Drop your images here"
                      : "Drag & drop images or click to select"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Images will be uploaded to Pinata IPFS when you finalize the capsule
                  </p>
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.type === 'video' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Video Content (will be uploaded to Pinata IPFS during finalization)
                  </label>
                  
                  <div className="space-y-4">
                    {/* Video Recording */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-700">Record Video</h3>
                        <Button
                          variant={isRecording ? "secondary" : "primary"}
                          size="sm"
                          onClick={isRecording ? stopRecording : startRecording}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </Button>
                      </div>
                      
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full rounded-lg bg-gray-100 ${!stream ? 'hidden' : ''}`}
                      />
                      
                      {formData.videoBlob && !stream && (
                        <video
                          src={URL.createObjectURL(formData.videoBlob)}
                          controls
                          className="w-full rounded-lg"
                        />
                      )}
                    </div>

                    {/* File Upload */}
                    <div
                      {...getVideoRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                        ${isVideoDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                    >
                      <input {...getVideoInputProps()} />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {isVideoDragActive
                          ? "Drop your video here"
                          : "Drag & drop a video file or click to select"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Video will be uploaded to Pinata IPFS when you finalize the capsule
                      </p>
                      {formData.file && (
                        <p className="text-sm text-blue-600 mt-2">
                          Selected: {formData.file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'text' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legacy Message * (will be uploaded to Pinata IPFS during finalization)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your wisdom, story, or message..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your message will be uploaded to Pinata IPFS when you finalize the capsule
                  </p>
                </div>
              )}

              {/* Recipient */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intended Recipient (Ethereum Address - Optional)
                </label>
                <input
                  type="text"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0x... (leave empty for anyone to unlock)"
                  pattern="^0x[a-fA-F0-9]{40}$"
                />
                {formData.recipient && !isValidHexAddress(formData.recipient) && (
                  <p className="mt-1 text-sm text-red-600">
                    Please enter a valid Ethereum address (42 characters starting with 0x)
                  </p>
                )}
              </div>

              {/* Life Lesson */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Life Lesson or Connected Event
                </label>
                <textarea
                  name="lifeLesson"
                  value={formData.lifeLesson}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What inspired this capsule? What lesson or event is it connected to?"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                icon={true}
                onClick={handleNext}
                className="w-full"
                disabled={!isConnected}
              >
                Continue to Unlock Rules
              </Button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-2">
            <div className="sticky top-32">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">NFT Capsule Preview</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg text-gray-900">
                    {formData.title || 'Untitled NFT Capsule'}
                  </h3>
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-500">
                    {formData.type === 'text' ? (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    ) : (
                      <Video className="h-4 w-4 mr-2" />
                    )}
                    {formData.type === 'text' ? 'Text Message NFT' : 'Video Message NFT'}
                  </div>
                  
                  <div className="flex items-center text-sm text-blue-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Content will be uploaded to Pinata IPFS during finalization
                  </div>
                  
                  {formData.recipient && (
                    <div className="text-sm">
                      <span className="text-gray-500">For: </span>
                      <span className="text-gray-700 font-mono text-xs">{formData.recipient}</span>
                    </div>
                  )}
                  
                  {formData.type === 'text' && formData.message && (
                    <div className="text-sm text-gray-700 border-l-2 border-gray-200 pl-4">
                      {formData.message.length > 150
                        ? `${formData.message.substring(0, 150)}...`
                        : formData.message}
                    </div>
                  )}

                  {formData.type === 'video' && (formData.file || formData.videoBlob) && (
                    <div className="text-sm text-blue-600">
                      {formData.file ? (
                        <p>Video uploaded: {formData.file.name}</p>
                      ) : (
                        <p>Video recorded and ready</p>
                      )}
                    </div>
                  )}

                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Attached Images:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {formData.images.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                      {formData.images.length > 3 && (
                        <p className="text-sm text-gray-500 mt-2">
                          +{formData.images.length - 3} more images
                        </p>
                      )}
                    </div>
                  )}

                  {isConnected && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✓ Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        NFT will be minted to your address
                      </p>
                      {mintingFee && (
                        <p className="text-sm text-green-600 mt-1">
                          💰 Minting fee: {formatEther(mintingFee)} ETH
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCapsule;