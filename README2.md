# LegacyCode dApp Frontend + EVM + IPFS Integration

## Overview

This project is a decentralized application (dApp) called **LegacyCode**. It allows users to create secure, encrypted digital capsules that can be unlocked in the future through various methods. Capsules are stored off-chain using **IPFS**, while their metadata and unlock logic are handled via an **EVM-compatible smart contract**. The frontend is built using **Vite + React + TypeScript**.

---

## 🔧 Key Integrations

### 🧠 React Frontend

* Built with Vite and TypeScript
* Modular component-based architecture
* Supports TailwindCSS for styling

### 🔒 Ethereum Smart Contracts

* `LegacyCapsule.sol` handles capsule creation and unlock logic
* Integrated with `wagmi` and `viem` for Web3 interactions
* Deployable on any EVM-compatible chain (e.g., Ethereum, Polygon, Base)

### 📦 IPFS Off-chain Storage

* Capsule content is encrypted, uploaded to IPFS
* Stored content hash is saved on-chain
* Integrated via custom `ipfsClient.ts`

### 🧠 Unlock Logic Types

* Passphrase
* Question & Answer (QA)
* QR Code
* Payment
* Geolocation (hashed)
* Biometric file
* Token Ownership (ERC-20 / ERC-721)
* Timed Release
* Quiz

---

## 🗂️ Project Structure

```plaintext
src/
├── components/
│   ├── CreateCapsule.tsx
│   ├── UnlockRules.tsx
│   ├── UnlockCapsule.tsx
│   ├── VaultPreview.tsx
│   ├── VaultDisplay.tsx
│   └── Button.tsx
├── hooks/
│   ├── useCapsuleContract.ts
│   ├── useWallet.ts
├── utils/
│   ├── ipfsClient.ts
│   └── transformUnlockRules.ts
├── schema/
│   └── metadata.schema.json
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🧪 Smart Contract Interaction

### `createCapsule()`

* Takes metadata from form inputs
* Transforms into hashed values for secret-based unlock types
* Uploads encrypted metadata to IPFS
* Saves IPFS hash and unlock settings to blockchain

### `unlockCapsule()`

* Takes user input (passphrase, token ID, location hash, etc.)
* Verifies eligibility to unlock based on method
* If valid, marks capsule as unlocked and emits event

---

## 📄 Metadata Schema (Validation)

Stored in `schema/metadata.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["title", "contentHash", "contentType", "createdBy"],
  "properties": {
    "title": { "type": "string" },
    "description": { "type": "string" },
    "contentHash": { "type": "string" },
    "contentType": { "type": "string", "enum": ["TEXT", "VIDEO", "IMAGE_GALLERY"] },
    "createdBy": { "type": "string" },
    "timestamp": { "type": "number" },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
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
pnpm install
```

### 3. Run development server

```bash
pnpm dev
```

### 4. Deploy smart contract (optional)

```bash
npx hardhat deploy --network sepolia
```

### 5. Configure `.env`

```env
VITE_CONTRACT_ADDRESS=0x...
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

---

## 📫 Next Steps

* Add WalletConnect or MetaMask integration
* Deploy contract and test on Sepolia or Polygon
* Implement serverless functions for biometric comparison (optional)
* Improve UX for unlock failure modes

---

## 🧑‍💻 Author

Edward Hambrick — Built with ❤️ using Bolt.new + OpenAI + Solidity

---
# Here's a breakdown of the data required for each verification step in the multi-step unlock process:

## Passphrase Verification
Data Required from User: A passphrase (a string of text).
How it's used: The provided passphrase is hashed on the frontend and sent to the smart contract. The contract then compares this hash to the passphraseHash stored during the capsule's creation.

## Birthday Timestamp Verification
Data Required from User: None directly at the time of unlock.
How it's used: This step automatically verifies if the current blockchain timestamp (block.timestamp) has passed the birthdayUnlockTimestamp that was set when the capsule was created. The user simply needs to initiate the verification, and the contract checks the time condition.

## Token Ownership Verification
Data Required from User: None directly at the time of unlock.
How it's used: This step automatically checks if the connected wallet (msg.sender) holds a sufficient unlockAmount of the specified ERC-20 token at the unlockTokenAddress (both set during capsule creation). The user needs to ensure their wallet contains the required tokens.

## NFT Ownership Verification
Data Required from User: None directly at the time of unlock.
How it's used: This step automatically verifies if the connected wallet (msg.sender) is the owner of a specific NFT (requiredNFTTokenId) from a particular NFT contract (requiredNFTContract), both of which were set during capsule creation. The user needs to ensure their wallet holds the required NFT.

## QR Code Verification
Data Required from User: A QR phrase (a string of text).
How it's used: The user needs to scan a QR code (which contains the qrPhrase) and then input that phrase into the application. This phrase is then hashed on the frontend and sent to the smart contract for comparison against the qrCodeHash stored during capsule creation.

## In summary, for the unlock process, the user explicitly needs to provide the Passphrase and the QR Code phrase. The other steps are automatic checks performed by the smart contract based on conditions set during the capsule's creation and the current state of the blockchain (time and the user's wallet contents).

# 📜 License
MIT License
