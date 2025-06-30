// Browser-compatible Pinata service using fetch API instead of Node.js SDK

// Get API credentials from environment variables
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  console.warn('Pinata API credentials not found. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_API_KEY in your .env file');
}

export interface CapsuleMetadata {
  name: string;
  description: string;
  image?: string;
  animation_url?: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    content_type: 'text' | 'video';
    unlock_method: string;
    created_at: string;
    creator: string;
    recipient?: string;
    image_uris?: string[]; // Store all image URIs for proper IPFS retrieval
    content_url?: string; // NEW: Direct link to the main content on IPFS
    life_lesson?: string; // NEW: Life lesson or connected event
  };
}

export interface UploadResult {
  metadataURI: string;
  contentURI?: string;
  imageURIs: string[];
}

// Test Pinata connection using fetch
export async function testPinataConnection(): Promise<boolean> {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    console.error('Pinata API credentials not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY
      }
    });

    if (response.ok) {
      console.log('✅ Pinata connection successful');
      return true;
    } else {
      console.error('❌ Pinata connection failed:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Pinata connection failed:', error);
    return false;
  }
}

// Upload a single file to Pinata using fetch
export async function uploadFileToPinata(
  file: File, 
  filename?: string,
  metadata?: any
): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API credentials not configured. Please check your environment variables.');
  }

  try {
    console.log('Uploading file to Pinata:', filename || file.name);

    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    const pinataMetadata = JSON.stringify({
      name: filename || file.name,
      ...metadata
    });
    formData.append('pinataMetadata', pinataMetadata);

    // Add options
    const pinataOptions = JSON.stringify({
      cidVersion: 0
    });
    formData.append('pinataOptions', pinataOptions);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const ipfsHash = result.IpfsHash;
    const uri = `ipfs://${ipfsHash}`;
    
    console.log('File uploaded to Pinata:', uri);
    return uri;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Upload JSON data to Pinata using fetch
export async function uploadJSONToPinata(
  jsonData: any,
  filename: string = 'metadata.json'
): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API credentials not configured. Please check your environment variables.');
  }

  try {
    console.log('Uploading JSON to Pinata:', filename);

    const data = {
      pinataContent: jsonData,
      pinataMetadata: {
        name: filename
      },
      pinataOptions: {
        cidVersion: 0
      }
    };

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const ipfsHash = result.IpfsHash;
    const uri = `ipfs://${ipfsHash}`;
    
    console.log('JSON uploaded to Pinata:', uri);
    return uri;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw new Error(`Failed to upload JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Upload multiple images to Pinata
export async function uploadImages(images: File[]): Promise<string[]> {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API credentials not configured. Please check your environment variables.');
  }

  if (images.length === 0) {
    return [];
  }

  try {
    const imageURIs: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`Uploading image ${i + 1}/${images.length}:`, image.name);
      
      const uri = await uploadFileToPinata(
        image, 
        `image_${i + 1}_${image.name}`,
        { keyvalues: { type: 'image', index: i.toString() } }
      );
      
      imageURIs.push(uri);
    }

    console.log('All images uploaded:', imageURIs);
    return imageURIs;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Upload video content to Pinata
export async function uploadVideo(
  video: File | Blob, 
  filename: string = 'video.webm'
): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API credentials not configured. Please check your environment variables.');
  }

  try {
    console.log('Uploading video to Pinata:', filename);
    
    // Convert Blob to File if necessary
    let fileToUpload: File;
    if (video instanceof File) {
      fileToUpload = video;
    } else {
      fileToUpload = new File([video], filename, { type: 'video/webm' });
    }

    const uri = await uploadFileToPinata(
      fileToUpload,
      filename,
      { keyvalues: { type: 'video' } }
    );
    
    return uri;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Upload text content as a file to Pinata
export async function uploadTextContent(
  content: string, 
  filename: string = 'content.txt'
): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API credentials not configured. Please check your environment variables.');
  }

  try {
    console.log('Uploading text content to Pinata');
    
    const textBlob = new Blob([content], { type: 'text/plain' });
    const textFile = new File([textBlob], filename, { type: 'text/plain' });

    const uri = await uploadFileToPinata(
      textFile,
      filename,
      { keyvalues: { type: 'text' } }
    );
    
    return uri;
  } catch (error) {
    console.error('Error uploading text content:', error);
    throw new Error(`Failed to upload text content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create and upload complete NFT metadata
export async function uploadCapsuleMetadata(
  title: string,
  description: string,
  contentType: 'text' | 'video',
  unlockMethod: string,
  creator: string,
  recipient?: string,
  contentURI?: string,
  imageURIs: string[] = [],
  lifeLesson?: string // NEW: Life lesson parameter
): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API credentials not configured. Please check your environment variables.');
  }

  try {
    console.log('Creating NFT metadata for:', title);

    // Create metadata object
    const metadata: CapsuleMetadata = {
      name: title,
      description: description,
      external_url: 'https://legacycode.app',
      attributes: [
        {
          trait_type: 'Content Type',
          value: contentType === 'text' ? 'Text Message' : 'Video Message'
        },
        {
          trait_type: 'Unlock Method',
          value: unlockMethod
        },
        {
          trait_type: 'Created',
          value: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        }
      ],
      properties: {
        content_type: contentType,
        unlock_method: unlockMethod,
        created_at: new Date().toISOString(),
        creator: creator,
        ...(recipient && { recipient }),
        // Store all image URIs in properties for proper IPFS retrieval
        ...(imageURIs.length > 0 && { image_uris: imageURIs }),
        // NEW: Store content URL and life lesson
        ...(contentURI && { content_url: contentURI }),
        ...(lifeLesson && { life_lesson: lifeLesson })
      }
    };

    // Add main image if available
    if (imageURIs.length > 0) {
      metadata.image = imageURIs[0]; // Use first image as main image
    }

    // Add animation_url for video content
    if (contentType === 'video' && contentURI) {
      metadata.animation_url = contentURI;
    }

    // Add additional images as attributes if there are multiple
    if (imageURIs.length > 1) {
      metadata.attributes.push({
        trait_type: 'Additional Images',
        value: imageURIs.length - 1
      });
    }

    // Add life lesson as attribute if provided
    if (lifeLesson) {
      metadata.attributes.push({
        trait_type: 'Life Lesson',
        value: 'Included'
      });
    }

    console.log('Metadata object created with content URL and life lesson:', metadata);

    // Upload metadata to Pinata
    const metadataURI = await uploadJSONToPinata(
      metadata, 
      `${title.replace(/\s+/g, '_')}_metadata.json`
    );
    
    console.log('Metadata uploaded to Pinata:', metadataURI);
    return metadataURI;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw new Error(`Failed to upload metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Complete upload process for a capsule
export async function uploadCompleteCapsule(
  title: string,
  description: string,
  contentType: 'text' | 'video',
  unlockMethod: string,
  creator: string,
  recipient?: string,
  textContent?: string,
  videoContent?: File | Blob,
  images: File[] = [],
  lifeLesson?: string // NEW: Life lesson parameter
): Promise<UploadResult> {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API credentials not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_API_KEY in your .env file');
  }

  try {
    console.log('Starting complete capsule upload process to Pinata...');

    // Test connection first
    const connectionOk = await testPinataConnection();
    if (!connectionOk) {
      throw new Error('Failed to connect to Pinata. Please check your API credentials.');
    }

    // Upload images first
    const imageURIs = await uploadImages(images);

    // Upload content based on type
    let contentURI: string | undefined;
    if (contentType === 'text' && textContent) {
      contentURI = await uploadTextContent(textContent, `${title.replace(/\s+/g, '_')}_content.txt`);
    } else if (contentType === 'video' && videoContent) {
      contentURI = await uploadVideo(videoContent, `${title.replace(/\s+/g, '_')}_video.webm`);
    }

    // Upload metadata with all image URIs, content URL, and life lesson
    const metadataURI = await uploadCapsuleMetadata(
      title,
      description,
      contentType,
      unlockMethod,
      creator,
      recipient,
      contentURI,
      imageURIs,
      lifeLesson // NEW: Pass life lesson to metadata
    );

    console.log('Complete capsule upload to Pinata finished:', {
      metadataURI,
      contentURI,
      imageURIs,
      lifeLesson
    });

    return {
      metadataURI,
      contentURI,
      imageURIs
    };
  } catch (error) {
    console.error('Error in complete capsule upload to Pinata:', error);
    throw new Error(`Failed to upload capsule to Pinata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Utility function to get IPFS gateway URL
export function getIPFSGatewayURL(ipfsURI: string, gateway: string = 'https://gateway.pinata.cloud/ipfs/'): string {
  if (ipfsURI.startsWith('ipfs://')) {
    return `${gateway}${ipfsURI.slice(7)}`;
  }
  return ipfsURI;
}

// NEW: Utility function to fetch content from IPFS
export async function fetchContentFromIPFS(contentURI: string): Promise<string> {
  try {
    console.log('Fetching content from IPFS:', contentURI);
    const response = await fetch(getIPFSGatewayURL(contentURI));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const content = await response.text();
    console.log('Content fetched from IPFS successfully');
    return content;
  } catch (error) {
    console.error('Error fetching content from IPFS:', error);
    throw new Error(`Failed to fetch content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Check if Pinata is properly configured
export function isPinataConfigured(): boolean {
  return !!PINATA_API_KEY && !!PINATA_SECRET_API_KEY;
}

// Get pinned files from Pinata (useful for debugging)
export async function listPinnedFiles(limit: number = 10): Promise<any[]> {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API credentials not configured');
  }

  try {
    const response = await fetch(`https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=${limit}`, {
      method: 'GET',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.rows || [];
  } catch (error) {
    console.error('Error listing pinned files:', error);
    throw new Error(`Failed to list pinned files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}