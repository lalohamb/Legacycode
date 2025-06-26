// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ✅ OpenZeppelin Contracts for NFT, Token, and Access Control
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// ⚠️ Context.sol import omitted: already inherited via ERC721URIStorage and Ownable
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//@title LegacyCapsule - v03: Birthday-Based Unlock Capsule
//@version v03

contract Legacycapsulev03 is ERC721URIStorage, Ownable {
    enum ContentType { TEXT, VIDEO, IMAGE_GALLERY }

    struct Capsule {
        address owner;
        address recipient;
        string title;
        bytes32 contentHash;
        ContentType contentType;

        // Unlock logic
        bytes32 passphraseHash;
        uint256 birthdayUnlockTimestamp; // 🎂 Fixed birthday-based unlock timestamp
        uint256 unlockAmount;
        address unlockTokenAddress;
        address requiredNFTContract;
        uint256 requiredNFTTokenId;
        bytes32 qrCodeHash;

        // Status tracking
        bool passphraseVerified;
        bool birthdayVerified;
        bool tokenVerified;
        bool nftVerified;
        bool qrVerified;
        bool isUnlocked;
    }

    uint256 public nextTokenId = 1;
    mapping(uint256 => Capsule) public capsules;

    event CapsuleCreated(uint256 indexed capsuleId, address indexed owner);
    event CapsuleUnlocked(uint256 indexed capsuleId, address indexed by);

    //constructor() ERC721("LegacyCapsule", "LCAP") {}
    constructor() ERC721("LegacyCapsule", "LCAP") Ownable(msg.sender) {}


    function createCapsule(
        address recipient,
        string memory title,
        string memory tokenURI,
        bytes32 contentHash,
        bytes32 passphraseHash,
        uint256 birthdayUnlockTimestamp, // 🎂 UNIX timestamp of recipient's birthday
        uint256 unlockAmount,
        address unlockTokenAddress,
        address requiredNFTContract,
        uint256 requiredNFTTokenId,
        bytes32 qrCodeHash
    ) external returns (uint256) {
        uint256 tokenId = nextTokenId;

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        capsules[tokenId] = Capsule({
            owner: msg.sender,
            recipient: recipient,
            title: title,
            contentHash: contentHash,
            contentType: ContentType.TEXT,
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
        emit CapsuleCreated(tokenId, msg.sender);
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

    function finalizeUnlock(uint256 capsuleId) external {
        Capsule storage cap = capsules[capsuleId];
        require(
            cap.passphraseVerified &&
            cap.birthdayVerified &&
            cap.tokenVerified &&
            cap.nftVerified &&
            cap.qrVerified,
            "All steps not complete"
        );
        require(!cap.isUnlocked, "Already unlocked");
        cap.isUnlocked = true;
        emit CapsuleUnlocked(capsuleId, msg.sender);
    }

    function isCapsuleUnlocked(uint256 capsuleId) external view returns (bool) {
        return capsules[capsuleId].isUnlocked;
    }

    function getContentHash(uint256 capsuleId) external view returns (bytes32) {
        require(capsules[capsuleId].isUnlocked, "Capsule is locked");
        return capsules[capsuleId].contentHash;
    }
}

/*
====================================================
✅ Contract Summary – LegacyCapsule v03
----------------------------------------------------
Changes since v02:
- 🎂 Replaced generic timestamp with birthday-specific unlock:
    • `birthdayUnlockTimestamp` added to struct
    • `verifyBirthdayTimestamp()` replaces generic time unlock
    • Commented purpose in createCapsule()

- ✅ All previous methods (passphrase, token, NFT, QR) retained

Prepared for: Edward Hambrick
====================================================
*/
