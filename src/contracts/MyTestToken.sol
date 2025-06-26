// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyTestToken
 * @dev A simple ERC-20 token for testing the LegacyCapsule contract
 * This token can be used to test the token ownership verification features
 */
contract MyTestToken is ERC20, Ownable {
    uint8 private _decimals;
    
    /**
     * @dev Constructor that gives msg.sender all of existing tokens
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param decimals_ The number of decimals for the token
     * @param totalSupply_ The total supply of tokens (in smallest unit)
     */
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 totalSupply_
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = decimals_;
        _mint(msg.sender, totalSupply_);
    }

    /**
     * @dev Returns the number of decimals used to get its user representation
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint new tokens to a specific address
     * Only the owner can mint new tokens
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint (in smallest unit)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from the caller's account
     * @param amount The amount of tokens to burn (in smallest unit)
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from a specific account (requires allowance)
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn (in smallest unit)
     */
    function burnFrom(address from, uint256 amount) public {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }

    /**
     * @dev Airdrop tokens to multiple addresses
     * Only the owner can perform airdrops
     * @param recipients Array of addresses to receive tokens
     * @param amounts Array of amounts to send to each recipient
     */
    function airdrop(address[] memory recipients, uint256[] memory amounts) public onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Transfer ownership and mint tokens to the new owner
     * @param newOwner The address of the new owner
     * @param amount The amount of tokens to mint to the new owner
     */
    function transferOwnershipWithTokens(address newOwner, uint256 amount) public onlyOwner {
        _mint(newOwner, amount);
        transferOwnership(newOwner);
    }
}