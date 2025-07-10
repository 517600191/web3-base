// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

// 管理地址权限的合约
contract NFTTDAO1V3 is
    Initializable,
    OwnableUpgradeable,
    ERC721Upgradeable
{
    uint256 private _tokenIdCounter; //tokenId 计数器

    event LogMessage(string data1, uint64 data2);

    // 初始化
    function initialize(string memory _name, string memory _symbol) public initializer {
        __Ownable_init(_msgSender());
        __ERC721_init(_name, _symbol);
        _tokenIdCounter = 0;
        safeMint(_msgSender());
        safeBatchMint(_msgSender(), 10);
    }

    // 新的初始化函数，用于升级时初始化新状态
    function reinitialize(uint256 _length) public onlyOwner reinitializer(4) {  // 版本号自加需要常量
        safeBatchMint(_msgSender(), _length);
    }

    // mint
    function safeMint(address to) public onlyOwner {
        console.log(111);
        _safeMint(to, _tokenIdCounter);
        _tokenIdCounter++;
        // emit LogMessage(to, _tokenIdCounter);
    }

    // batch mint
    function safeBatchMint(address to, uint256 length) public onlyOwner {
        for (uint256 i = 0; i < length; i++) {
            _safeMint(to, _tokenIdCounter);
            _tokenIdCounter++;
            // emit LogMessage(to, _tokenIdCounter);
        }
    }

    // 获取某个地址拥有的所有 NFT 的 tokenId
    // function getNFTsByOwner(address owner) external view returns (uint256[] memory) {
    //     uint256 balance = balanceOf(owner);
    //     uint256[] memory tokenIds = new uint256[](balance);
    //     for (uint256 i = 0; i < balance; i++) {
    //         tokenIds[i] = tokenOfOwnerByIndex(owner, i);
    //     }
    //     return tokenIds;
    // }

    // 获取合约中所有已铸造的 NFT 的 tokenId
    // function getAllMintedNFTs() external view returns (uint256[] memory) {
    //     uint256 totalSupply = totalSupply();
    //     uint256[] memory tokenIds = new uint256[](totalSupply);
    //     for (uint256 i = 0; i < totalSupply; i++) {
    //         tokenIds[i] = tokenByIndex(i);
    //     }
    //     return tokenIds;
    // }

    /**
     * @dev 转移单个 ERC721 NFT。
     * @param collection NFT 所在的合约地址。
     * @param from 发送 NFT 的地址。
     * @param to 接收 NFT 的地址。
     * @param tokenId NFT 的 Token ID。
     */
    function transferSingleNFT(
        address collection,
        address from,
        address to,
        uint256 tokenId
    ) external onlyOwner {
        IERC721(collection).safeTransferFrom(from, to, tokenId);
    }

    /**
     * @dev 批量转移 ERC721 NFT。
     * @param collection NFT 所在的合约地址。
     * @param from 发送 NFT 的地址。
     * @param to 接收 NFT 的地址。
     * @param tokenIds NFT 的 Token ID 数组。
     */
    function transferBatchNFTs(
        address collection,
        address from,
        address to,
        uint256[] memory tokenIds
    ) external onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            IERC721(collection).safeTransferFrom(from, to, tokenIds[i]);
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

    function testHello3() public pure returns (string memory) {
        return "hello3";
    }
}
