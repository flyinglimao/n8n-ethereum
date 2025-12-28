// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TestContract
 * @dev General purpose contract for testing n8n-ethereum basic operations
 */
contract TestContract {
    uint256 public value;
    string public message;
    address public owner;
    mapping(address => uint256) public balances;

    event ValueChanged(uint256 indexed oldValue, uint256 indexed newValue, address indexed changer);
    event MessageUpdated(string oldMessage, string newMessage);
    event BalanceSet(address indexed account, uint256 amount);
    event FundsReceived(address indexed sender, uint256 amount);

    constructor(uint256 initialValue, string memory initialMessage) {
        value = initialValue;
        message = initialMessage;
        owner = msg.sender;
        emit ValueChanged(0, initialValue, msg.sender);
        emit MessageUpdated("", initialMessage);
    }

    // Read functions (view/pure)
    function getValue() public view returns (uint256) {
        return value;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }

    function computeSum(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }

    function computeHash(string memory data) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(data));
    }

    // Write functions
    function setValue(uint256 newValue) public {
        uint256 oldValue = value;
        value = newValue;
        emit ValueChanged(oldValue, newValue, msg.sender);
    }

    function setMessage(string memory newMessage) public {
        string memory oldMessage = message;
        message = newMessage;
        emit MessageUpdated(oldMessage, newMessage);
    }

    function incrementValue() public returns (uint256) {
        uint256 oldValue = value;
        value++;
        emit ValueChanged(oldValue, value, msg.sender);
        return value;
    }

    function setBalance(address account, uint256 amount) public {
        balances[account] = amount;
        emit BalanceSet(account, amount);
    }

    function multipleUpdates(
        uint256 newValue,
        string memory newMessage,
        address account,
        uint256 balanceAmount
    ) public {
        setValue(newValue);
        setMessage(newMessage);
        setBalance(account, balanceAmount);
    }

    // Payable functions
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
