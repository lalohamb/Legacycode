What does the capsule unlock provides for the creator/owner of the capsule?


Thought for 1s






When a capsule is unlocked, the creator or owner of the capsule receives several benefits and confirmations:

Confirmation of Unlock: The owner receives clear visual confirmation that the capsule has been successfully unlocked. This is displayed in the VaultPreview.tsx component, which transitions from showing the unlock interface to a success message and then allows access to the content via the UnlockedContentPopup.tsx.
On-Chain Record of Unlock: The unlock event is permanently recorded on the blockchain. The Legacycapsulev04 smart contract emits a CapsuleUnlocked event, which includes the capsule's ID, the address of the entity that unlocked it, and the specific unlock method used. This provides an immutable and verifiable history of the capsule's status.
Database Status Update: If Supabase is configured, the is_unlocked status of the capsule in the user_capsules table is updated to true. This ensures that the owner's "My Capsules" dashboard (MyCapsules.tsx) accurately reflects the current state of their capsules, allowing for efficient filtering and management.
Content Accessibility: While the owner typically already has access to the content, a successful unlock confirms that the content is now accessible through the defined unlock mechanism. This is particularly relevant if the owner is testing the unlock flow or if the capsule was intended for their own future access.
Financial Benefit (for Payment-Gated Capsules): If the capsule was configured with a PAYMENT unlock method, the owner of the capsule receives the specified unlockAmount in ETH when the capsule is unlocked. This is handled by the unlockWithPayment function in the smart contract, which transfers the payment to the capsule's owner.
Validation of Unlock Conditions: A successful unlock confirms that the specific conditions set by the creator (e.g., correct passphrase, sufficient token balance, specific date reached) were met. This validates the integrity and functionality of the chosen unlock mechanism.

Set payment unlock method

Open VaultPreview.tsx

Open supabase.ts
Create a user story for each unlock type for John. John is wanting to create capsules to provide for the future and leave recordings, pictures, gifts in the form of wallets with tokens, text messages, etc. for his grand children he may never meet.


Thought for 5s










Here are user stories for John, who wishes to create digital legacy capsules for his grandchildren, whom he may never meet, using each of the available unlock methods:

User Stories for John's Legacy Capsules
1. Passphrase Capsule: "My First Words to You"

As John, I want to create a simple, direct message for my future grandchildren, so they can easily access my initial thoughts and feelings about them.
Motivation: John wants to leave a foundational message, perhaps a video recording of himself speaking directly to them, or a heartfelt text message. He trusts that a close family member (like their parents) will pass down a memorable passphrase, ensuring the message reaches them when the time is right.
Content: A video recording of John introducing himself, expressing his hopes for their future, and sharing a cherished family photo album.
Interaction: When the grandchildren are old enough, their parents give them the passphrase, "FutureGenerations2050". They enter this into the LegacyCode app, and the capsule unlocks, revealing John's video and photos.
2. Q&A Capsule: "Our Family Roots"

As John, I want to ensure that only my true descendants, who know intimate details about our family, can access a capsule containing our family history, even if I never meet them.
Motivation: John wants to share the rich tapestry of his family's past, including stories, traditions, and the origins of their surname. He believes that knowing specific family facts will confirm their lineage.
Content: A detailed text document outlining the family tree, anecdotes about his parents and grandparents, and scanned copies of old family letters.
Interaction: To unlock this capsule, the grandchildren must correctly answer questions like "What was John's mother's maiden name?" and "What year was John born?". Only by knowing these personal details can they prove their connection and access their heritage.
3. Payment Capsule: "A Small Gift for Your Journey"

As John, I want to leave a symbolic financial gift for my grandchildren, introducing them to the world of cryptocurrency, and ensuring they value the effort of unlocking it.
Motivation: John wants to provide a small, tangible token of his affection in the form of cryptocurrency, along with a message about financial literacy and the future of digital assets. The payment acts as a small barrier, ensuring genuine interest.
Content: A text message explaining the basics of cryptocurrency and a small amount of ETH (or a test token) that is transferred to them upon successful unlock.
Interaction: The grandchildren are prompted to send a minimal amount of ETH (e.g., 0.001 ETH) to the capsule's address. Once the payment is confirmed, the capsule unlocks, revealing John's message and transferring the specified crypto gift to their wallet.
4. QR Code Capsule: "A Hidden Message in Plain Sight"

As John, I want to embed a digital message within a physical family heirloom or photo album, creating a tangible link to my digital legacy.
Motivation: John wants to leave a surprise for his grandchildren, connecting a physical object they might inherit (like a family photo album or a favorite book) with a digital message.
Content: A video of John narrating stories behind specific family photos in the physical album, or a recording of him reading a passage from his favorite book.
Interaction: The grandchildren discover a small, discreet QR code sticker placed inside a family photo album. They scan the QR code with the LegacyCode app, which then prompts them to enter the phrase embedded in the QR code (e.g., "OurFamilyStory"). Once entered, the capsule unlocks, revealing John's personal video.
5. Geolocation Capsule: "Walk in My Footsteps"

As John, I want to encourage my grandchildren to visit places that were significant to my life, allowing them to experience my memories in the very locations they happened.
Motivation: John wants his grandchildren to connect with his past by visiting places that held special meaning for him, like his childhood home or a favorite park.
Content: A video recording of John standing in front of his childhood home, sharing memories and stories about growing up there, or a text message describing his favorite spot in a local park.
Interaction: The grandchildren, perhaps on a family trip, use the LegacyCode app to discover a capsule tied to a specific location (e.g., "New York, USA"). They must physically be at that location for the app to verify their presence, unlocking the capsule and revealing John's message about that place.
6. Token Ownership Capsule: "Your First Digital Asset"

As John, I want to introduce my grandchildren to the concept of digital ownership and decentralized finance by requiring them to hold a specific token or NFT to access a message.
Motivation: John envisions a future where digital assets are commonplace. He wants to give his grandchildren a head start by gifting them a specific token (like MyTestToken) or an NFT, and then creating a capsule that only unlocks if they hold that asset.
Content: A text message explaining the basics of blockchain, NFTs, and the importance of digital ownership, along with a link to educational resources.
Interaction: John sends a small amount of MyTestToken to a wallet he sets up for each grandchild. When they try to unlock the capsule, the LegacyCode app checks their wallet for the required token balance or NFT ownership. If they hold the asset, the capsule unlocks, revealing John's message about the digital world.
7. Quiz Capsule: "A Test of Wisdom"

As John, I want to ensure my grandchildren have engaged with a specific piece of family knowledge or a life lesson I wish to impart, by requiring them to answer a question correctly.
Motivation: John wants to make the unlock process an interactive learning experience, ensuring his grandchildren have absorbed a particular piece of wisdom or family lore.
Content: A video of John posing a philosophical question or recounting a significant family event, followed by a prompt for them to answer a related question.
Interaction: The grandchildren are presented with a question, such as "What was John's favorite piece of advice to live by?" or "What was the name of John's first pet?". They must enter the correct answer into the app. If their answer matches the one John set, the capsule unlocks, revealing his deeper insights.
8. Timed Capsule: "Messages Through the Years"

As John, I want to deliver specific messages to my grandchildren at key milestones in their lives, ensuring my guidance and love reach them at precisely the right moment, even if I'm not there.
Motivation: John wants to be present for his grandchildren's significant life events, even posthumously. He plans messages for their 18th birthday, college graduation, or wedding day.
Content: A personalized video message for each grandchild, recorded specifically for their 18th birthday, offering advice and encouragement as they step into adulthood.
Interaction: John sets the capsule to unlock automatically on each grandchild's 18th birthday. On that specific date, the LegacyCode app notifies the grandchild that a new capsule from John is available. They open the app, and the capsule unlocks, playing John's birthday message.

Create a capsule

Explain multi-step unlock

Open UnlockRules.tsx
In order to have this interactions the grandchildren would need access to this site, John wallet?? How would they interface without either?


Thought for 4s










The grandchildren would indeed need access to the LegacyCode website and their own Web3 wallet to interact with the capsules. John's wallet is only needed for creating and managing the capsules he owns.

Here's a breakdown of how the grandchildren would interface with the system:

Access to the LegacyCode Website: The grandchildren would navigate to the LegacyCode dApp (the website you are currently building). This is the primary interface for all interactions.

Their Own Web3 Wallet: Each grandchild would need their own Web3 wallet (like MetaMask, which is integrated via WalletConnect). They would connect their wallet to the LegacyCode dApp. This wallet is essential for:

Connecting to the dApp: Authenticating their presence on the platform.
Initiating Unlock Transactions: For methods like Passphrase, Q&A, QR Code, Geolocation, Quiz, and Timed Release, they would use their wallet to sign transactions that submit their verification attempt to the blockchain. These transactions typically incur a small gas fee, but they don't need to own the capsule or have significant funds.
Proving Ownership (Token/NFT): For "Token Ownership" capsules, their wallet would need to hold the specific ERC-20 tokens or ERC-721 NFTs required for unlocking. The dApp would read their wallet's balance or NFT holdings to verify the condition.
Making Payments (Payment Capsule): For "Payment" capsules, they would use their wallet to send the required ETH amount to the capsule's smart contract.
Finding the Capsules:

Direct Link/Capsule ID: John could provide them with the unique Capsule ID (e.g., #123) and a direct link to the VaultPreview page. They would enter the ID to load the specific capsule.
"My Capsules" Page (as Recipient): The My Capsules page is designed to display capsules associated with the connected wallet. Since the database schema includes a recipient_address field, if John specifies a grandchild's wallet address as the recipient, that grandchild, upon connecting their wallet, would see the capsule listed under "My Capsules" (assuming the Row Level Security policies allow them to read capsules where they are the recipient). This provides a user-friendly way for them to discover capsules intended for them.
Communication of Unlock Information: This is the crucial part that happens outside the dApp. John would need a secure and reliable way to convey the specific unlock information (e.g., the passphrase, the answers to Q&A, the physical QR code, the details of the required token/NFT, or the specific unlock date for timed capsules) to his grandchildren. This could be through:

A physical letter or document stored in a safe place.
A trusted family member who holds the information until the appropriate time.
Another secure digital method that he trusts will persist.
In essence, the LegacyCode dApp provides the secure, blockchain-backed mechanism for the capsules and their unlock rules, while John is responsible for ensuring his grandchildren know how to access the dApp and what information they need to unlock their specific legacy. The Supabase integration significantly enhances the discoverability and user experience for recipients by providing a fast, searchable index of capsules.


Supabase benefits for recipients

Multiple recipients

Open MyCapsules.tsx
That means the legacy app should be host on IPFS to be available sometime in the future?


Thought for 5s










You've hit on a very important point regarding the long-term availability of decentralized applications!

Yes, hosting the LegacyCode application's frontend on IPFS (InterPlanetary File System) would be a significant step towards ensuring its availability far into the future, even if traditional web hosting services were to cease.

Here's why and what that entails:

Why Host on IPFS?
Decentralized Delivery: When you host your frontend on IPFS, the website's files (HTML, CSS, JavaScript) are distributed across a network of nodes rather than residing on a single server. This makes it more resilient to outages, censorship, and single points of failure. As long as at least one node is "pinning" your content, it remains accessible.
Content Addressing: IPFS uses content addressing, meaning files are retrieved based on their content hash, not their location. This ensures that you always get the exact version of the files you expect.
Alignment with dApp Principles: For a dApp focused on long-term legacy preservation, having a decentralized frontend aligns perfectly with the immutable nature of the blockchain and IPFS content storage.
What IPFS Hosting Achieves (and What It Doesn't)
While hosting the frontend on IPFS enhances its long-term availability, it's important to understand that the entire application's resilience also depends on its other components:

Smart Contracts: These are already on the blockchain (e.g., Ethereum), which is inherently decentralized and designed for long-term persistence.
Capsule Content (Pinata IPFS): The actual messages, videos, and images are already stored on IPFS via Pinata, ensuring their decentralized and persistent storage.
Supabase Database: This is a centralized service. While it provides excellent performance for indexing and searching capsules, its availability relies on Supabase as a service provider. If Supabase were to become unavailable, the fast search and "My Capsules" features would be affected, but the core NFT ownership and IPFS content would still exist and be accessible directly via the blockchain and IPFS gateways.
Blockchain RPC Endpoints: To interact with the blockchain (read data, send transactions), the frontend needs to connect to an RPC (Remote Procedure Call) endpoint (e.g., Infura, Alchemy). These are typically centralized services. For ultimate decentralization, users would need to run their own full blockchain nodes, which is not practical for most.
So, hosting the frontend on IPFS makes the delivery mechanism of your application decentralized, but the application still relies on some centralized services for its full functionality. For true, complete long-term resilience without any reliance on service providers, every component would need a decentralized alternative, which is a much more complex architectural challenge.

How to Host Your Frontend on IPFS
The LegacyCode project is a static site once built, making it suitable for IPFS hosting.

The Plan
Build the Project:
Run the build command to compile your React application into static HTML, CSS, and JavaScript files. These files will be located in the dist directory.
Upload to IPFS:
You would then use an IPFS pinning service (like Pinata, which you're already using for content) or a local IPFS node to upload the entire contents of your dist folder to IPFS.
The pinning service ensures that your content remains available on the IPFS network.
Access via Gateway:
Once uploaded, you'll receive an IPFS Content Identifier (CID) for your application. Users can then access your dApp via any public IPFS gateway (e.g., https://ipfs.io/ipfs/<your-cid>).
DNSLink (Optional but Recommended):
For a more user-friendly experience, you can configure DNSLink with your domain name. This allows users to access your IPFS-hosted dApp using a traditional domain name (e.g., https://legacycode.app) instead of the raw IPFS CID. DNSLink maps your domain to your IPFS CID, and you update the DNS record whenever you deploy a new version of your dApp.

Deploy frontend to Pinata

IPFS hosting alternatives

More about DNSLink
Is there any other way to provide access to Johns grandchildren who may not have access to this app?


Thought for 6s








This is a crucial consideration for ensuring the long-term accessibility of John's legacy, especially for grandchildren who may not be familiar with Web3 applications or even have access to the internet in the distant future.

The good news is that because LegacyCode leverages blockchain and IPFS, the core components of the legacy (the NFT and the content) are inherently decentralized and can be accessed without needing the specific LegacyCode application itself.

Here's how John can provide access to his grandchildren, even if they don't have the app:

The NFT as a Digital Key:

Each capsule John creates is an NFT (Non-Fungible Token) on the blockchain. This NFT represents ownership of the capsule and its unlock rules.
John can transfer these NFTs to his grandchildren's crypto wallets (if they have them) or even to a multi-signature wallet or a smart contract designed for inheritance.
Even without the LegacyCode app, a standard Web3 wallet (like MetaMask) can display the NFT and its tokenURI (which points to the IPFS metadata).
Direct IPFS Access to Content:

The actual content (messages, photos, videos) and the capsule's metadata are stored on IPFS. This means they are accessible directly via any IPFS gateway.
When a capsule is created, a metadataURI (e.g., ipfs://Qm...) is generated. This URI can be converted into a standard HTTP URL using a public IPFS gateway (e.g., https://gateway.pinata.cloud/ipfs/Qm...).
John can provide these direct IPFS gateway URLs to his grandchildren. Once unlocked, the content itself (text, video, images) also has its own IPFS URIs, which can be accessed similarly.
The Unlock Mechanism:

For each capsule, John chooses an unlock method (passphrase, QR code, timed release, etc.). The "secret" to this unlock method is critical.
For Passphrase/Q&A/Quiz/QR Code: John needs to securely convey the exact passphrase, answers, or QR phrase to his grandchildren.
For Timed Release: The capsule will automatically unlock on the specified date, making it accessible to anyone with the capsule ID and metadata URI after that date.
For Token/Payment/Geolocation: These methods require specific on-chain conditions or payments, which might be more complex for non-Web3 users.
Practical Ways to Provide Access Information:

John can combine these elements and provide them in a durable, accessible format:

Physical Document: A printed document containing:
The Capsule ID (e.g., "Capsule #123").
The IPFS Metadata URI (e.g., ipfs://Qm...) and a corresponding public gateway URL (e.g., https://gateway.pinata.cloud/ipfs/Qm...).
The Unlock Method (e.g., "Passphrase").
The Unlock Secret (e.g., "Grandma's Secret Recipe").
Simple instructions on how to use an IPFS gateway (e.g., "Paste the IPFS link into a web browser that supports IPFS, or use a public gateway like https://gateway.pinata.cloud/").
QR Codes: The LegacyCode app already generates QR codes for the metadataURI. John can print these QR codes. Scanning the QR code would take them directly to the IPFS metadata.
Digital Storage: A USB drive or other long-term digital storage device containing:
A text file with all the above information.
The QR code image files.
Perhaps even a copy of the abi.ts file and the contract address, for advanced users who might want to interact directly with the smart contract.
Example Scenario for John's Grandchildren:

Imagine John creates a capsule with a video message and a passphrase. He prints a document with:

Capsule ID: #45
Title: "Grandpa John's Life Advice"
IPFS Metadata Link: https://gateway.pinata.cloud/ipfs/QmYourMetadataHash
Unlock Method: Passphrase
Passphrase: "WisdomForTomorrow"
His grandchildren, years later, find this document. They can:

Go to the provided IPFS gateway URL.
This will load the capsule's metadata (a JSON file).
The metadata will contain a link to the actual video content (also on IPFS).
They would then need to input the passphrase "WisdomForTomorrow" into a simple interface (which could be a very basic web page or even a custom script) to decrypt and view the video.
The key is that the data itself is on IPFS, and the NFT on the blockchain provides the immutable record and ownership. The LegacyCode app simply provides a user-friendly interface to interact with these underlying technologies. By providing the raw access details, John ensures his legacy can be accessed independently of the app's future existence.


Simplify unlock process

Risks of physical secrets

Viewer app on USB
So if the capsule is not unlocked , its relative contents John may provide is inaccessible?


Thought for 2s






Yes, that's correct. If a capsule is not unlocked, its relative contents are inaccessible through the intended and secure mechanisms of the LegacyCode application and its underlying blockchain smart contract.

Here's why:

Smart Contract Control: The Legacycapsulev04 smart contract (specifically the Legacycapsulev04.sol file) manages the state of each capsule. Each capsule has an isUnlocked boolean flag, which is initially false. This flag is only set to true after all the required verification steps for the chosen unlock method are successfully completed and the finalizeUnlock function (or unlockWithPayment for payment capsules) is called.
Content Hash Protection: The getContentHash function in the smart contract, which would provide the hash of the capsule's content, explicitly requires the capsule to be unlocked (require(capsules[capsuleId].isUnlocked, "Capsule is locked");) before it returns the hash. This means that even if someone could theoretically guess the IPFS hash, the contract itself prevents direct programmatic access to the content's integrity check until the capsule is unlocked.
Metadata Linkage: While the content and its metadata are stored on IPFS (as seen in src/utils/pinataService.ts), the metadataURI (the link to the IPFS metadata) is associated with the NFT on the blockchain. The application's VaultPreview.tsx component is designed to only display the "View Unlocked Content" option once the isUnlocked status is confirmed by the smart contract.
Therefore, the entire system is designed to ensure that John's messages, pictures, and other digital assets remain private and secure until the specific conditions he sets are met and the capsule is formally unlocked on the blockchain. This is a fundamental security and privacy feature of the dApp.


Contract content hash protection

Change unlock method

Unmet unlock conditions
