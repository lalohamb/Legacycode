// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ✅ OpenZeppelin Contracts for NFT, Token, and Access Control
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LegacyCapsule - v04: Single-Step Unlock Based on Chosen Method with Minting Fee
 * @version v04
 * @dev This contract allows capsules to be unlocked using only the verification method chosen during creation
 * @dev Now includes minting fee collection functionality
 */
contract Legacycapsulev04 is ERC721URIStorage, Ownable {
    enum ContentType { TEXT, VIDEO, IMAGE_GALLERY }
    
    enum UnlockMethod { 
        PASSPHRASE,     // 0 - Requires passphrase verification only
        QA,             // 1 - Requires Q&A verification (uses passphrase hash for combined data)
        PAYMENT,        // 2 - Requires payment (ETH) to unlock
        QRCODE,         // 3 - Requires QR code verification only
        GEOLOCATION,    // 4 - Requires location verification (uses passphrase hash for location)
        TOKEN,          // 5 - Requires token AND NFT ownership verification
        QUIZ,           // 6 - Requires quiz answer verification (uses passphrase hash)
        TIMED           // 7 - Requires time-based unlock (birthday timestamp)
    }

    struct Capsule {
        address owner;
        address recipient;
        string title;
        bytes32 contentHash;
        ContentType contentType;
        UnlockMethod chosenUnlockMethod;

        // Unlock logic - only relevant fields will be used based on chosenUnlockMethod
        bytes32 passphraseHash;        // Used for PASSPHRASE, QA, QRCODE, GEOLOCATION, QUIZ
        uint256 birthdayUnlockTimestamp; // Used for TIMED
        uint256 unlockAmount;          // Used for PAYMENT (ETH), TOKEN (ERC-20 amount)
        address unlockTokenAddress;    // Used for TOKEN (ERC-20 address)
        address requiredNFTContract;   // Used for TOKEN (ERC-721 address)
        uint256 requiredNFTTokenId;    // Used for TOKEN (specific NFT token ID)
        bytes32 qrCodeHash;           // Used for QRCODE (can be different from passphraseHash)

        // Status tracking - only relevant flags will be checked based on chosenUnlockMethod
        bool passphraseVerified;
        bool birthdayVerified;
        bool tokenVerified;
        bool nftVerified;
        bool qrVerified;
        bool isUnlocked;
    }

    // 💰 Fee collection variables
    uint256 public mintingFee;
    address public feeRecipient;

    uint256 public nextTokenId = 1;
    mapping(uint256 => Capsule) public capsules;

    event CapsuleCreated(uint256 indexed capsuleId, address indexed owner, UnlockMethod unlockMethod);
    event CapsuleUnlocked(uint256 indexed capsuleId, address indexed by, UnlockMethod unlockMethod);
    event MintingFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event FeesWithdrawn(address recipient, uint256 amount);

    constructor() ERC721("LegacyCapsule", "LCAP") Ownable(msg.sender) {
        // Initialize with default values
        mintingFee = 0.01 ether; // Default 0.01 ETH minting fee
        feeRecipient = msg.sender; // Contract deployer receives fees by default
    }

    /**
     * @dev Set the minting fee (only owner)
     * @param _fee New minting fee in wei
     */
    function setMintingFee(uint256 _fee) external onlyOwner {
        uint256 oldFee = mintingFee;
        mintingFee = _fee;
        emit MintingFeeUpdated(oldFee, _fee);
    }

    /**
     * @dev Set the fee recipient address (only owner)
     * @param _recipient New fee recipient address
     */
    function setFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Fee recipient cannot be zero address");
        address oldRecipient = feeRecipient;
        feeRecipient = _recipient;
        emit FeeRecipientUpdated(oldRecipient, _recipient);
    }

    /**
     * @dev Get current minting fee
     * @return Current minting fee in wei
     */
    function getMintingFee() external view returns (uint256) {
        return mintingFee;
    }

    /**
     * @dev Get current fee recipient
     * @return Current fee recipient address
     */
    function getFeeRecipient() external view returns (address) {
        return feeRecipient;
    }

    function createCapsule(
        address recipient,
        string memory title,
        string memory tokenURI,
        bytes32 contentHash,
        ContentType _contentType,
        UnlockMethod _chosenUnlockMethod,
        bytes32 passphraseHash,
        uint256 birthdayUnlockTimestamp,
        uint256 unlockAmount,
        address unlockTokenAddress,
        address requiredNFTContract,
        uint256 requiredNFTTokenId,
        bytes32 qrCodeHash
    ) external payable returns (uint256) {
        // 💰 Check minting fee payment
        require(msg.value >= mintingFee, "Insufficient minting fee");

        uint256 tokenId = nextTokenId;

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        capsules[tokenId] = Capsule({
            owner: msg.sender,
            recipient: recipient,
            title: title,
            contentHash: contentHash,
            contentType: _contentType,
            chosenUnlockMethod: _chosenUnlockMethod,
            passphraseHash: passphraseHash,
            birthdayUnlockTimestamp: birthdayUnlockTimestamp,
            unlockAmount: unlockAmount,
            unlockTokenAddress: unlockTokenAddress,
            requiredNFTContract: requiredNFTContract,
            requiredNFTTokenId: requiredNFTTokenId,
            qrCodeHash: qrCodeHash,
            passphraseVerified: false,
            birthdayVerified: false,
            tokenVerified: false,
            nftVerified: false,
            qrVerified: false,
            isUnlocked: false
        });

        nextTokenId += 1;

        // 💰 Transfer minting fee to fee recipient
        if (mintingFee > 0) {
            payable(feeRecipient).transfer(mintingFee);
        }

        // 💰 Refund excess payment if any
        if (msg.value > mintingFee) {
            payable(msg.sender).transfer(msg.value - mintingFee);
        }

        emit CapsuleCreated(tokenId, msg.sender, _chosenUnlockMethod);
        return tokenId;
    }

    function submitPassphrase(uint256 capsuleId, bytes32 providedHash) external {
        Capsule storage cap = capsules[capsuleId];
        require(!cap.passphraseVerified, "Already verified");
        require(providedHash == cap.passphraseHash, "Incorrect passphrase");
        cap.passphraseVerified = true;
    }

    function verifyBirthdayTimestamp(uint256 capsuleId) external {
        Capsule storage cap = capsules[capsuleId];
        require(!cap.birthdayVerified, "Birthday already verified");
        require(block.timestamp >= cap.birthdayUnlockTimestamp, "Birthday unlock not reached");
        cap.birthdayVerified = true;
    }

    function verifyTokenOwnership(uint256 capsuleId) external {
        Capsule storage cap = capsules[capsuleId];
        require(!cap.tokenVerified, "Token already verified");
        require(IERC20(cap.unlockTokenAddress).balanceOf(msg.sender) >= cap.unlockAmount, "Insufficient token balance");
        cap.tokenVerified = true;
    }

    function verifyNFTOwnership(uint256 capsuleId) external {
        Capsule storage cap = capsules[capsuleId];
        require(!cap.nftVerified, "NFT already verified");
        require(IERC721(cap.requiredNFTContract).ownerOf(cap.requiredNFTTokenId) == msg.sender, "Not NFT owner");
        cap.nftVerified = true;
    }

    function verifyQRCode(uint256 capsuleId, bytes32 providedHash) external {
        Capsule storage cap = capsules[capsuleId];
        require(!cap.qrVerified, "QR already verified");
        require(providedHash == cap.qrCodeHash, "Invalid QR code");
        cap.qrVerified = true;
    }

    // Payment-based unlock - user sends ETH to unlock
    function unlockWithPayment(uint256 capsuleId) external payable {
        Capsule storage cap = capsules[capsuleId];
        require(cap.chosenUnlockMethod == UnlockMethod.PAYMENT, "Not a payment unlock capsule");
        require(msg.value >= cap.unlockAmount, "Insufficient payment");
        require(!cap.isUnlocked, "Already unlocked");
        
        cap.isUnlocked = true;
        emit CapsuleUnlocked(capsuleId, msg.sender, UnlockMethod.PAYMENT);
        
        // Send payment to capsule owner
        payable(cap.owner).transfer(msg.value);
    }

    function finalizeUnlock(uint256 capsuleId) external {
        Capsule storage cap = capsules[capsuleId];
        require(!cap.isUnlocked, "Already unlocked");

        // Check requirements based on chosen unlock method
        if (cap.chosenUnlockMethod == UnlockMethod.PASSPHRASE) {
            require(cap.passphraseVerified, "Passphrase not verified");
            
        } else if (cap.chosenUnlockMethod == UnlockMethod.QA) {
            require(cap.passphraseVerified, "Q&A not verified");
            
        } else if (cap.chosenUnlockMethod == UnlockMethod.PAYMENT) {
            revert("Use unlockWithPayment() for payment-based capsules");
            
        } else if (cap.chosenUnlockMethod == UnlockMethod.QRCODE) {
            require(cap.qrVerified, "QR code not verified");
            
        } else if (cap.chosenUnlockMethod == UnlockMethod.GEOLOCATION) {
            require(cap.passphraseVerified, "Location not verified");
            
        } else if (cap.chosenUnlockMethod == UnlockMethod.TOKEN) {
            require(cap.tokenVerified && cap.nftVerified, "Token and NFT ownership not verified");
            
        } else if (cap.chosenUnlockMethod == UnlockMethod.QUIZ) {
            require(cap.passphraseVerified, "Quiz answer not verified");
            
        } else if (cap.chosenUnlockMethod == UnlockMethod.TIMED) {
            require(cap.birthdayVerified, "Time condition not met");
            
        } else {
            revert("Invalid unlock method");
        }

        cap.isUnlocked = true;
        emit CapsuleUnlocked(capsuleId, msg.sender, cap.chosenUnlockMethod);
    }

    function isCapsuleUnlocked(uint256 capsuleId) external view returns (bool) {
        return capsules[capsuleId].isUnlocked;
    }

    function getContentHash(uint256 capsuleId) external view returns (bytes32) {
        require(capsules[capsuleId].isUnlocked, "Capsule is locked");
        return capsules[capsuleId].contentHash;
    }

    // Helper function to get unlock method as string
    function getUnlockMethodName(uint256 capsuleId) external view returns (string memory) {
        UnlockMethod method = capsules[capsuleId].chosenUnlockMethod;
        
        if (method == UnlockMethod.PASSPHRASE) return "Passphrase";
        if (method == UnlockMethod.QA) return "Question & Answer";
        if (method == UnlockMethod.PAYMENT) return "Payment Required";
        if (method == UnlockMethod.QRCODE) return "QR Code";
        if (method == UnlockMethod.GEOLOCATION) return "Location Verification";
        if (method == UnlockMethod.TOKEN) return "Token Ownership";
        if (method == UnlockMethod.QUIZ) return "Quiz Answer";
        if (method == UnlockMethod.TIMED) return "Time-based Release";
        
        return "Unknown";
    }

    // 💰 Withdraw contract balance (for payment-based unlocks and any accumulated fees)
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
        emit FeesWithdrawn(owner(), balance);
    }

    // 💰 Emergency withdraw to specific address
    function emergencyWithdraw(address payable recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        recipient.transfer(balance);
        emit FeesWithdrawn(recipient, balance);
    }

    // 💰 Get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

/*
====================================================
✅ Contract Summary – LegacyCapsule v04 with Fee Collection
----------------------------------------------------
New Fee Collection Features:
- 💰 mintingFee: Configurable fee for minting NFTs
- 💰 feeRecipient: Address that receives minting fees
- 💰 setMintingFee(): Owner can update minting fee
- 💰 setFeeRecipient(): Owner can change fee recipient
- 💰 getMintingFee(): View current minting fee
- 💰 getFeeRecipient(): View current fee recipient
- 💰 createCapsule(): Now payable, requires minting fee
- 💰 withdraw(): Owner can withdraw accumulated funds
- 💰 emergencyWithdraw(): Emergency withdrawal to specific address
- 💰 getContractBalance(): View contract balance

Fee Collection Logic:
- Users must send at least the minting fee when creating capsules
- Minting fee is immediately transferred to fee recipient
- Excess payment is refunded to the user
- Default fee: 0.01 ETH (configurable)
- Default recipient: Contract deployer (configurable)

Events Added:
- MintingFeeUpdated: When fee is changed
- FeeRecipientUpdated: When recipient is changed
- FeesWithdrawn: When funds are withdrawn

Prepared by: Edward Hambrick
====================================================
*/