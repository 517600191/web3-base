// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

// 管理地址权限的合约
contract NFTTDAO1V2 is
    Initializable,
    OwnableUpgradeable,
    ERC721Upgradeable
{
    uint256 private _tokenIdCounter;

    event LogMessage(address data1, uint256 data2);

    // 初始化
    function initialize(string memory _name, string memory _symbol) public initializer {
        __Ownable_init(_msgSender());
        __ERC721_init(_name, _symbol);
        _tokenIdCounter = 0;
    }

    // mint
    function safeMint(address to) public onlyOwner {
        console.log(111);
        _safeMint(to, _tokenIdCounter);
        _tokenIdCounter++;
        emit LogMessage(to, _tokenIdCounter);
    }

    // batch mint
    function safeBatchMint(address to, uint256 length) public onlyOwner {
        for (uint256 i = 0; i < length; i++) {
            _safeMint(to, _tokenIdCounter);
            _tokenIdCounter++;
            emit LogMessage(to, _tokenIdCounter);
        }
    }

    // /**
    //  * @notice 为指定订单键存入 NFT。
    //  * @dev 调用者必须为易交换订单簿合约，会将 NFT 从 from 地址转移到本合约。
    //  * @param orderKey 订单的唯一标识符。
    //  * @param from 发送 NFT 的地址。
    //  * @param collection NFT 所在的合约地址。
    //  * @param tokenId NFT 的 Token ID。
    //  */
    // function depositNFT(
    //     OrderKey orderKey,
    //     address from,
    //     address collection,
    //     uint256 tokenId
    // ) external onlyEasySwapOrderBook {
    //     IERC721(collection).safeTransferNFT(from, address(this), tokenId);
    //     NFTBalance[orderKey] = tokenId;
    // }

    // /**
    //  * @notice 从指定订单键提取 NFT 到指定地址。
    //  * @dev 调用者必须为易交换订单簿合约，订单键对应的 NFT Token ID 需匹配。
    //  * @param orderKey 订单的唯一标识符。
    //  * @param to 接收 NFT 的地址。
    //  * @param collection NFT 所在的合约地址。
    //  * @param tokenId NFT 的 Token ID。
    //  */
    // function withdrawNFT(
    //     OrderKey orderKey,
    //     address to,
    //     address collection,
    //     uint256 tokenId
    // ) external onlyEasySwapOrderBook {
    //     require(NFTBalance[orderKey] == tokenId, "HV: not match tokenId");
    //     delete NFTBalance[orderKey];
    //     IERC721(collection).safeTransferNFT(address(this), to, tokenId);
    // }

    // /**
    //  * @notice 转移 ERC721 NFT。
    //  * @dev 调用者必须为易交换订单簿合约，将指定 NFT 从 from 地址转移到 to 地址。
    //  * @param from 发送 NFT 的地址。
    //  * @param to 接收 NFT 的地址。
    //  * @param assets 要转移的 NFT 资产信息。
    //  */
    // function transferERC721(
    //     address from,
    //     address to,
    //     LibOrder.Asset calldata assets
    // ) external onlyEasySwapOrderBook {
    //     IERC721(assets.collection).safeTransferNFT(from, to, assets.tokenId);
    // }

    // /**
    //  * @notice 批量转移 ERC721 NFT。
    //  * @dev 将多个 NFT 从调用者地址转移到指定地址。
    //  * @param to 接收 NFT 的地址。
    //  * @param assets 要转移的 NFT 信息数组。
    //  */
    // function batchTransferERC721(
    //     address to,
    //     LibOrder.NFTInfo[] calldata assets
    // ) external {
    //     for (uint256 i = 0; i < assets.length; ++i) {
    //         IERC721(assets[i].collection).safeTransferNFT(
    //             _msgSender(),
    //             to,
    //             assets[i].tokenId
    //         );
    //     }
    // }

    /**
     * @dev 实现 ERC721 标准的接收回调函数，表明本合约可以接收 ERC721 NFT。
     * @param  发送者地址，此处未使用。
     * @param  原始发送者地址，此处未使用。
     * @param  / NFT 的 Token ID，此处未使用。
     * @param  额外数据，此处未使用。
     * @return 符合 ERC721 标准的回调选择器。
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /**
     * @dev 接收 ETH 的回调函数，允许合约接收 ETH。
     */
    receive() external payable {}

    function testHello2() public pure returns (string memory) {
        return "hello2";
    }
}
