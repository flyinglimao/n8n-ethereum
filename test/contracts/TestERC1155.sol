// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestERC1155
 * @dev ERC1155 multi-token for testing n8n-ethereum ERC1155 operations
 */
contract TestERC1155 is ERC1155, Ownable {
    mapping(uint256 => string) private _tokenURIs;

    event TokenMinted(address indexed to, uint256 indexed tokenId, uint256 amount);
    event BatchMinted(address indexed to, uint256[] tokenIds, uint256[] amounts);

    constructor(string memory baseURI) ERC1155(baseURI) Ownable(msg.sender) {}

    function mint(
        address to,
        uint256 tokenId,
        uint256 amount,
        string memory tokenURI_
    ) public onlyOwner {
        _mint(to, tokenId, amount, "");
        _tokenURIs[tokenId] = tokenURI_;
        emit TokenMinted(to, tokenId, amount);
    }

    function mintBatch(
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        string[] memory tokenURIs_
    ) public onlyOwner {
        require(tokenIds.length == tokenURIs_.length, "Arrays length mismatch");
        _mintBatch(to, tokenIds, amounts, "");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _tokenURIs[tokenIds[i]] = tokenURIs_[i];
        }
        emit BatchMinted(to, tokenIds, amounts);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI_ = _tokenURIs[tokenId];
        if (bytes(tokenURI_).length > 0) {
            return tokenURI_;
        }
        return super.uri(tokenId);
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }
}
