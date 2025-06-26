# Why do I need the mytesttoken contract If I already  created the NFT with a wallet  and mint a new nft??
You're asking a great question that gets to the core functionality of the LegacyCode application!

The MyTestToken contract serves a very specific purpose within the LegacyCode dApp, and it's different from the NFT (Non-Fungible Token) that your wallet mints when you create a capsule.

## Here's the breakdown:

Your Wallet and NFT Minting: When you create a capsule in the LegacyCode application, your wallet interacts with the LegacyCapsule smart contract. This contract mints a new NFT, which represents your digital capsule. This NFT is what you own and can transfer.

MyTestToken (ERC-20 Token): The MyTestToken is a separate contract that creates an ERC-20 fungible token. It's not an NFT. Its primary role is to act as a test asset for one of the unlock conditions of the LegacyCapsule contract.

Multi-Step Unlock Verification: The LegacyCapsulev03 contract (which is the one being used) has a multi-step unlock process. Two of these steps are:

verifyTokenOwnership: This checks if your wallet holds a certain amount of a specified ERC-20 token.
verifyNFTOwnership: This checks if your wallet owns a specific ERC-721 NFT (or any NFT from a collection).
The MyTestToken is designed to fulfill both of these requirements for testing purposes. You can configure a capsule to require ownership of MyTestToken (as an ERC-20) or even a specific token ID of MyTestToken (as an ERC-721, due to the contract's current implementation where the same address is used for both).

## In essence, you need the MyTestToken contract not to mint your NFT capsule, but to unlock a capsule that has been configured with token or NFT ownership as a verification step. It's a utility token for demonstrating and testing the advanced unlock features of the LegacyCapsule contract.

You can find more details on how to use MyTestToken for testing in the README_TOKEN_DEPLOYMENT.md and README_STEPSTOTEST.md files.


# how much is requried for the  checks if your wallet holds a certain amount of a specified ERC-20 token?
The amount required for the ERC-20 token ownership check is determined when the capsule is created. This value is stored in the unlockAmount field of the capsule's data within the LegacyCapsule smart contract. The contract's verifyTokenOwnership function then checks if the user's wallet balance of the specified ERC-20 token is greater than or equal to this unlockAmount.

Currently, in the frontend, when you select the "Token" unlock method in src/components/UnlockRules.tsx, there isn't an input field to specify the exact unlockAmount for the ERC-20 token. As a result, the src/utils/transformUnlockRules.ts file passes a default value of 0 for unlockAmount to the createCapsule function in the smart contract. This means that, with the current frontend implementation, any amount greater than or equal to zero (i.e., any positive balance) would satisfy the token ownership check.

However, the LegacyCapsule contract is designed to accept a specific unlockAmount, and the project's test instructions (e.g., in README_TOKEN_DEPLOYMENT.md) suggest that a non-zero amount, such as "100 tokens," is intended for testing this feature.

To allow you to specify the required ERC-20 token amount, you would need to modify the frontend.

## The Plan
1. Modify src/components/UnlockRules.tsx:

- Add a new input field for unlockAmount within the "ERC-20 Token" section when the "Token" unlock method is selected. This input should allow users to specify the required amount of ERC-20 tokens.

2. Modify src/utils/transformUnlockRules.ts:

Update the token case within the switch statement to read the unlockAmount from the formData and convert it to a BigInt (wei) before passing it to the contract.

3. Modify src/components/FinalizeCapsule.tsx:

Ensure that the unlockAmount is correctly displayed in the "Unlock Method Summary" section when the "Token" unlock method is chosen, reflecting the value entered by the user.

4. Modify src/components/VaultPreview.tsx:

Verify that the VaultPreview component correctly fetches and displays the unlockAmount from the on-chain capsule data for the "Token Ownership" verification step.

Implement this plan - Explain multi-step unlock-Open UnlockRules.tsx-Open transformUnlockRules.ts

# how does the [verifyNFTOwnership: This checks if your wallet owns a specific ERC-721 NFT (or any NFT from a collection).] work exactly. IS this the NFT the user just minted?


## Thought for 11s
## The verifyNFTOwnership function in the Legacycapsulev03 smart contract is designed to check if the wallet attempting to unlock a capsule (msg.sender) is the owner of a specific ERC-721 NFT.

Here's how it works:

Requirement Definition: When a capsule is created using the createCapsule function, the creator specifies two key parameters: requiredNFTContract (the address of the ERC-721 NFT collection) and requiredNFTTokenId (the specific token ID within that collection).
Verification: During the unlock process, when verifyNFTOwnership is called, the contract checks if the msg.sender (the user's connected wallet) is the owner of the NFT identified by the requiredNFTContract and requiredNFTTokenId that were set during the capsule's creation.

# Is this the NFT the user just minted?
No, it is not the LegacyCapsule NFT itself that the user just minted. The LegacyCapsule NFT acts as a container for the content and its unlock rules. The verifyNFTOwnership check refers to an external ERC-721 NFT. This allows capsule creators to gate access to their content based on whether a user owns a specific NFT from another collection (e.g., a membership NFT, a collectible, or a game item).

# Current Implementation Detail:
In the current frontend implementation, specifically within src/hooks/useCapsuleContract.ts, the requiredNFTContract parameter passed to the createCapsule function is set to the same address as the unlockTokenAddress (which is intended for ERC-20 tokens). This means that if you configure an ERC-20 token (like MyTestToken) for the token ownership verification, the NFT ownership verification will also attempt to check for an NFT from that same contract address. If the specified ERC-20 token contract does not also implement the ERC-721 standard, this verification step will likely fail.