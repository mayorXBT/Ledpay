// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Transparent mock ERC-20 for Ledpay tests. Not USDC.
contract LedpayTestToken {
    string public name = "Ledpay Test Token";
    string public symbol = "LPTEST";
    uint8 public constant decimals = 6;

    mapping(address => uint256) public balanceOf;
    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor() {
        balanceOf[msg.sender] = 1_000_000 * 1_000_000;
    }

    function mintTo(address to, uint256 amount) external {
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "LedpayTestToken: balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
