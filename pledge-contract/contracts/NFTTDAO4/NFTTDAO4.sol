// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./NFTTDAO4ERC721URIStorage.sol";

// 管理地址权限的合约
contract NFTTDAO4 is
    Initializable,
    OwnableUpgradeable,
    ERC721EnumerableUpgradeable,
    IERC721Receiver
{
    // 定义订单状态枚举
    enum OrderStatus {
        Pending, // 待处理
        Active, // 有效挂单
        Sold, // 已售出
        Cancelled // 已取消
    }

    struct NFTOrderInfo {
        uint256 orderId;
        address sellerWalletAddress; // 卖家钱包地址
        uint256 tokenId; // NFT tokenID
        uint256 selleNumber; // 卖出价格
        OrderStatus status; // 状态枚举
    }

    uint256 private _tokenIdCounter; // NFT id 自加
    NFTTDAO4ERC721URIStorage private _uriStorage;
    uint256 private _NFTOrderInfoId; // 订单 id 自加
    mapping(uint256 => NFTOrderInfo) public NFTOrderInfoMap; //钱包映射
    uint256[] public orderInfoIds; // 新增数组，记录所有有效的 _NFTOrderInfoId

    event LogMessage(address data1, uint256 data2);
    event LogMessage2(address data1);

    // 初始化
    function initialize(
        string memory _name,
        string memory _symbol,
        address _owner
    ) public initializer {
        __Ownable_init(_owner);
        __ERC721_init(_name, _symbol);
        __ERC721Enumerable_init();
        _tokenIdCounter = 1;
        _uriStorage = new NFTTDAO4ERC721URIStorage();
    }

    // 新的初始化函数，用于升级时初始化新状态
    // function reinitialize() public onlyOwner reinitializer(2) {
    //     // 版本号自加需要常量
    //     _NFTOrderInfoId = 10000;
    // }

    // mint
    function safeMint(address to, string memory _tokenURI) public onlyOwner {
        _safeMint(to, _tokenIdCounter);
        _uriStorage.setTokenURI(_tokenIdCounter, _tokenURI);
        _tokenIdCounter++;
        emit LogMessage(to, _tokenIdCounter);
    }

    // batch mint
    function safeBatchMint(
        address to,
        uint256 length,
        string memory _tokenURI
    ) public onlyOwner {
        for (uint256 i = 0; i < length; i++) {
            _safeMint(to, _tokenIdCounter);
            _uriStorage.setTokenURI(_tokenIdCounter, _tokenURI);
            _tokenIdCounter++;
            emit LogMessage(to, _tokenIdCounter);
        }
    }

    // 获取某个地址拥有的所有 NFT 的 tokenId
    function getNFTsByOwner(
        address owner
    ) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }

    // 获取合约中所有已铸造的 NFT 的 tokenId
    function getAllMintedNFTs() external view returns (uint256[] memory) {
        uint256 totalSupply = totalSupply();
        uint256[] memory tokenIds = new uint256[](totalSupply);
        for (uint256 i = 0; i < totalSupply; i++) {
            tokenIds[i] = tokenByIndex(i);
        }
        return tokenIds;
    }

    // 自定义转移 NFT 函数
    function transferNFT(address from, address to, uint256 tokenId) public {
        // 检查调用者是否是 NFT 所有者或被授权
        require(
            ownerOf(tokenId) == from,
            // || isApprovedForAll(from, msg.sender)
            // || getApproved(tokenId) == msg.sender,
            "Not authorized to transfer this NFT"
        );
        safeTransferFrom(from, to, tokenId);
    }

    // 自定义批量转移 NFT 函数
    function batchTransferNFT(
        address from,
        address to,
        uint256[] memory tokenIds
    ) public {
        // 检查调用者是否是 NFT 所有者或被授权
        uint256 length1 = tokenIds.length;
        for (uint256 i = 0; i < length1; i++) {
            require(
                ownerOf(tokenIds[i]) == from,
                // || isApprovedForAll(from, msg.sender)  //from 地址已将所有 NFT 的转移权限授予 msg.sender
                // || getApproved(tokenIds[i]) == msg.sender,  //检查 msg.sender 地址是否是该 NFT 被单独授权的操作者
                "Not authorized to transfer this NFT"
            );
            safeTransferFrom(from, to, tokenIds[i]);
        }
    }

    /**
     * @dev 实现 ERC721 标准的接收回调函数，表明本合约可以接收 ERC721 NFT。
     * @param operator 调用 transferFrom 或 safeTransferFrom 函数的地址。
     * @param from 发送 NFT 的地址。
     * @param tokenId NFT 的 Token ID。
     * @param data 额外数据。
     * @return 符合 ERC721 标准的回调选择器。
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /**
     * @dev 接收 ETH 的回调函数，允许合约接收 ETH。
     */
    receive() external payable {}
}
