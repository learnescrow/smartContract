// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    address public buyer;
    address public seller;
    uint256 public amount;
    bool public isFunded;
    bool public isReleased;

    constructor(address _seller) {
        buyer = msg.sender;
        seller = _seller;
    }

    function fund() external payable {
        require(msg.sender == buyer, "Only buyer can fund");
        require(!isFunded, "Already funded");
        require(msg.value > 0, "Send some ETH");
        amount = msg.value;
        isFunded = true;
    }

    function releaseFunds() external {
        require(msg.sender == buyer, "Only buyer can release");
        require(isFunded, "Not funded");
        require(!isReleased, "Already released");
        isReleased = true;
        (bool sent, ) = seller.call{value: amount}("");
        require(sent, "Failed to send ETH");
    }

    function refund() external {
        require(msg.sender == seller, "Only seller can refund");
        require(isFunded, "Not funded");
        require(!isReleased, "Already released");
        isFunded = false;
        (bool sent, ) = buyer.call{value: amount}("");
        require(sent, "Failed to refund ETH");
    }
}
