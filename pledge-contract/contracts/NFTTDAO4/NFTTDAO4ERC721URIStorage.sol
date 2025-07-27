// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

contract NFTTDAO4ERC721URIStorage is ERC721URIStorageUpgradeable {
    // 初始化函数
    function initialize(string memory name, string memory symbol) public initializer {
        __ERC721URIStorage_init();
        __ERC721_init(name, symbol);
    }
    // 添加公共方法，间接调用 _setTokenURI
    function setTokenURI(uint256 tokenId, string memory _tokenURI) external {
        _setTokenURI(tokenId, _tokenURI);
    }
}
