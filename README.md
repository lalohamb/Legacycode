# LegacyCode dApp Frontend with Pinata IPFS Integration

## Overview

This project is a decentralized application (dApp) called **LegacyCode**. It allows users to create secure, encrypted digital capsules that can be unlocked in the future through various methods. The frontend is built using **Vite + React + TypeScript** and integrates with Web3 wallets for blockchain interactions. Content is stored permanently on **IPFS** using **Pinata**.

---

## 🔧 Key Features

### 🧠 React Frontend

* Built with Vite and TypeScript
* Modular component-based architecture
* Supports TailwindCSS for styling
* Web3 wallet integration with wagmi

### 🔒 Blockchain Integration

* Web3 wallet connection via WalletConnect and MetaMask
* Smart contract interaction capabilities
* Support for multiple EVM-compatible chains
* Full ERC-721 NFT functionality

### 📦 IPFS Storage with Pinata

* Permanent content storage on IPFS
* Automatic metadata generation and upload
* Support for images, videos, and text content
* Decentralized and censorship-resistant storage

### 🧠 Unlock Logic Types

* Passphrase
* Question & Answer (QA)
* QR Code
* Payment
* Geolocation (simulated)
* Token Ownership (ERC-20 / ERC-721)
* Quiz
* Timed Release

---

## 🗂️ Project Structure

```plaintext
src/
├── components/
│   ├── CreateCapsule.tsx       # NFT creation with Pinata upload
│   ├── UnlockRules.tsx         # Unlock method configuration
│   ├── FinalizeCapsule.tsx     # Final review and minting
│   ├── VaultPreview.tsx        # NFT viewing and unlocking
│   ├── MyCapsules.tsx          # List user's NFT capsules
│   ├── Header.tsx              # Navigation with wallet connection
│   ├── Hero.tsx                # Landing page hero section
│   ├── Features.tsx            # Feature showcase
│   ├── Security.tsx            # Security information
│   ├── Pricing.tsx             # Pricing plans
│   ├── About.tsx               # About page
│   ├── CapsuleTypes.tsx        # Unlock method examples
│   └── Button.tsx              # Reusable button component
├── hooks/
│   └── useCapsuleContract.ts   # Smart contract interactions
├── utils/
│   ├── pinataService.ts        # Pinata IPFS integration
│   └── transformUnlockRules.ts # Unlock rule processing
├── contracts/
│   ├── abi.ts                  # Contract ABI
│   └── Legacycapsule.sol       # Smart contract source
├── App.tsx                     # Main app component
├── main.tsx                    # App entry point
└── index.css                   # Global styles
```

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourname/legacycode.git
cd legacycode
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example`:

```env
# Get your API credentials from https://pinata.cloud/
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here

# Deploy your contract and add the address
VITE_CONTRACT_ADDRESS=0x...

# Optional: Custom IPFS Gateway
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### 4. Get Pinata API Credentials

1. Visit [Pinata](https://pinata.cloud/)
2. Sign up for a free account
3. Generate API key and secret
4. Add them to your `.env` file

### 5. Deploy the Smart Contract

Deploy the `Legacycapsule.sol` contract to your chosen network and update `VITE_CONTRACT_ADDRESS`.

### 6. Run development server

```bash
npm run dev
```

---

## 📫 Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your Web3 wallet
2. **Create Capsule**: Navigate to the create page and fill in your capsule details
3. **Upload Content**: Add images, videos, or text that will be stored on Pinata IPFS
4. **Set Unlock Rules**: Choose how your capsule will be unlocked
5. **Finalize**: Review and mint your NFT capsule on the blockchain
6. **Manage Capsules**: View all your capsules in the "My Capsules" page
7. **Test Unlock**: Use the preview page to test the unlock process

---

## 🔗 Pinata IPFS Integration

### Content Storage

- **Images**: Uploaded to Pinata IPFS and referenced in NFT metadata
- **Videos**: Stored on Pinata IPFS with URI in metadata's `animation_url`
- **Text**: Stored as files on Pinata IPFS for permanent access
- **Metadata**: JSON metadata automatically generated and uploaded

### Pinata Benefits

- **Reliable**: Professional IPFS pinning service with 99.9% uptime
- **Fast**: Global CDN for quick access to content
- **Secure**: Enterprise-grade infrastructure
- **Standards**: Full compatibility with NFT standards

### Metadata Structure

```json
{
  "name": "Capsule Title",
  "description": "Capsule description",
  "image": "ipfs://QmImageHash",
  "animation_url": "ipfs://QmVideoHash",
  "external_url": "https://legacycode.app",
  "attributes": [
    {
      "trait_type": "Content Type",
      "value": "Text Message"
    },
    {
      "trait_type": "Unlock Method",
      "value": "Passphrase"
    }
  ],
  "properties": {
    "content_type": "text",
    "unlock_method": "passphrase",
    "created_at": "2025-01-27T...",
    "creator": "0x...",
    "recipient": "0x..."
  }
}
```

---

## 🔐 Smart Contract Features

### ERC-721 NFT Functionality

- Full NFT standard compliance
- Transferable ownership
- Metadata URI support
- Approval and transfer functions

### Capsule-Specific Features

- Multiple unlock methods
- Content hash verification
- Recipient specification
- Unlock event logging

---

## 🧑‍💻 Development

### Key Dependencies

- **@pinata/sdk**: Pinata IPFS storage and pinning
- **wagmi**: Ethereum wallet integration
- **viem**: Ethereum client library
- **react-dropzone**: File upload interface
- **qrcode.react**: QR code generation

### Environment Setup

1. Ensure you have Node.js 18+ installed
2. Install dependencies with `npm install`
3. Configure environment variables
4. Start development server with `npm run dev`

---

## 📜 License

MIT License

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ using React + TypeScript + Pinata + Ethereum