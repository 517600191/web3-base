// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./NFTTDAO2ERC721URIStorage.sol";

// 管理地址权限的合约
contract NFTTDAO2V2 is
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
    NFTTDAO2ERC721URIStorage private _uriStorage;
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
        _uriStorage = new NFTTDAO2ERC721URIStorage();
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
            // || getApproved(tokenId) == msg.sender
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
                // ||getApproved(tokenId[i]) == msg.sender  //检查 msg.sender 地址是否是该 NFT 被单独授权的操作者
                "Not authorized to transfer this NFT"
            );
            safeTransferFrom(from, to, tokenIds[i]);
        }
    }

    // 自定义批量存入 NFT
    function batchDepositNFT(address from, uint256[] memory tokenIds) public {
        // 检查调用者是否是 NFT 所有者或被授权
        uint256 length1 = tokenIds.length;
        for (uint256 i = 0; i < length1; i++) {
            require(
                ownerOf(tokenIds[i]) == from,
                // || isApprovedForAll(from, msg.sender)  //from 地址已将所有 NFT 的转移权限授予 msg.sender
                // ||getApproved(tokenId[i]) == msg.sender  //检查 msg.sender 地址是否是该 NFT 被单独授权的操作者
                "Not authorized to transfer this NFT"
            );
            safeTransferFrom(from, address(this), tokenIds[i]);
        }
    }

    // 自定义批量取出 NFT
    function batchWithdrawNFT(address to, uint256[] memory tokenIds) public {
        // 检查调用者是否是 NFT 所有者或被授权
        // console.log(address(this));
        // emit LogMessage2(address(this));
        uint256 length1 = tokenIds.length;
        for (uint256 i = 0; i < length1; i++) {
            require(
                ownerOf(tokenIds[i]) == address(this),
                // || isApprovedForAll(from, msg.sender)  //from 地址已将所有 NFT 的转移权限授予 msg.sender
                // ||getApproved(tokenId[i]) == msg.sender  //检查 msg.sender 地址是否是该 NFT 被单独授权的操作者
                "Not authorized to transfer this NFT"
            );
            // setApprovalForAll(_msgSender(), true);
            approve(to, tokenIds[i]); // 授予 msg.sender 地址对该 NFT 的转移权限
            safeTransferFrom(address(this), to, tokenIds[i]);
        }
    }

    // 创建 NFT 订单
    function sellNFT(
        address walletAddress,
        uint256 tokenId,
        uint256 selleNumber
    ) public {
        // 断言调用者是 NFT 所有者
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        // 断言卖出价格大于 0
        require(selleNumber > 0, "Selling price must be greater than 0");
        // 断言钱包地址有效
        require(walletAddress != address(0), "Invalid wallet address");

        // 先进行授权操作并检查是否成功
        approve(address(this), tokenId);
        require(getApproved(tokenId) == address(this), "Approval failed");

        uint256 currentOrderId = _NFTOrderInfoId;
        NFTOrderInfoMap[_NFTOrderInfoId] = NFTOrderInfo({
            orderId: _NFTOrderInfoId,
            sellerWalletAddress: walletAddress,
            tokenId: tokenId,
            selleNumber: selleNumber,
            status: OrderStatus.Active
        });
        orderInfoIds.push(currentOrderId); // 将 _NFTOrderInfoId 添加到数组中
        _NFTOrderInfoId++;
    }

    // 获取所有自己的 NFT 订单
    function getAllNFT(
        address from,
        uint256 status // 1: 自己，2: 所有
    ) public view returns (NFTOrderInfo[] memory) {
        // OrderStatus status = OrderStatus(statusUint);
        // 断言订单信息数组不为空
        require(orderInfoIds.length > 0, "No order information available");

        uint256 length1 = orderInfoIds.length; //默认订单长度
        NFTOrderInfo[] memory NFTOrderInfoArr = new NFTOrderInfo[](length1); // 给个固定长度，用 memory 节省 gas

        for (uint256 i = 0; i < length1; i++) {
            if (status == 1) {
                if (
                    NFTOrderInfoMap[orderInfoIds[i]].sellerWalletAddress == from
                ) {
                    NFTOrderInfoArr[i] = NFTOrderInfoMap[orderInfoIds[i]];
                }
            } else if (status == 2) {
                NFTOrderInfoArr[i] = NFTOrderInfoMap[orderInfoIds[i]];
            }
        }

        return (NFTOrderInfoArr);
    }

    // 按状态获取所有自己的 NFT 订单
    function getAllStatusNFT(
        uint256 status,
        address from
    ) public view returns (NFTOrderInfo[] memory) {
        // OrderStatus status = OrderStatus(statusUint);
        // 断言订单信息数组不为空
        require(orderInfoIds.length > 0, "No order information available");

        uint256 length1 = orderInfoIds.length; //默认订单长度
        uint256 validOrderCount = 0; // 统计有效订单数量

        NFTOrderInfo[] memory NFTOrderInfoArr = new NFTOrderInfo[](length1); // 给个固定长度，用 memory 节省 gas
        for (uint256 i = 0; i < length1; i++) {
            if (
                NFTOrderInfoMap[orderInfoIds[i]].status ==
                OrderStatus(status) &&
                NFTOrderInfoMap[orderInfoIds[i]].sellerWalletAddress == from
            ) {
                NFTOrderInfoArr[i] = NFTOrderInfoMap[orderInfoIds[i]];
                validOrderCount++;
            }
        }

        //剔除空数据
        NFTOrderInfo[] memory NFTOrderInfoArr2 = new NFTOrderInfo[](
            validOrderCount
        );
        uint256 validOrderCount2 = 0;
        for (uint256 i = 0; i < length1; i++) {
            if (NFTOrderInfoArr[i].orderId != 0) {
                NFTOrderInfoArr2[validOrderCount2] = NFTOrderInfoArr[i];
                validOrderCount2++;
            }
        }

        return (NFTOrderInfoArr2);
    }

    // 修改 NFT 订单信息
    function modifyNFT(
        uint256 orderId,
        uint256 newSelleNumber
    ) public returns (NFTOrderInfo memory) {
        NFTOrderInfo storage NFTOrderInfoDetail = NFTOrderInfoMap[orderId];
        // 检查订单是否存在
        require(
            NFTOrderInfoDetail.sellerWalletAddress != address(0),
            "Order does not exist"
        );
        require(
            NFTOrderInfoDetail.status == OrderStatus.Active,
            "Order does not exist"
        );
        // 检查调用者是否是订单创建者或者合约所有者
        require(
            NFTOrderInfoDetail.sellerWalletAddress == msg.sender,
            "Not authorized to modify this order"
        );

        // 修改卖出价格
        NFTOrderInfoDetail.selleNumber = newSelleNumber;

        return (NFTOrderInfoDetail);
    }

    // 购买 NFT 订单
    function buyNFT(
        uint256 orderId,
        address to // 买家输入地址
    ) public payable {
        NFTOrderInfo storage NFTOrderInfoDetail = NFTOrderInfoMap[orderId];
        // 检查订单是否有效
        require(
            NFTOrderInfoDetail.status == OrderStatus.Active,
            "Order is not active"
        );
        // 检查买家支付的金额是否足够
        require(
            msg.value >=
                (NFTOrderInfoDetail.selleNumber +
                    (NFTOrderInfoDetail.selleNumber * 2) /
                    100),
            "Insufficient funds"
        );

        address seller = NFTOrderInfoDetail.sellerWalletAddress;
        uint256 tokenId = NFTOrderInfoDetail.tokenId;

        // 转移资金给卖家
        (bool success, ) = payable(seller).call{
            value: NFTOrderInfoDetail.selleNumber
        }("");
        require(success, "Transfer failed");

        // fee 2%
        (bool success2, ) = payable(address(this)).call{
            value: ((NFTOrderInfoDetail.selleNumber * 2) / 100)
        }("");
        require(success2, "Transfer failed2");

        // 更新订单状态为已售出
        NFTOrderInfoDetail.status = OrderStatus.Sold;

        // 检查授权
        require(
            getApproved(tokenId) == address(this),
            "Contract is not approved to transfer this NFT"
        );

        approve(msg.sender, tokenId); // 授予 msg.sender 地址对该 NFT 的转移权限
        // 转移 NFT 所有权给买家
        safeTransferFrom(seller, to, tokenId);
    }

    event OrderCancelled(NFTOrderInfo data1);
    // 取消 NFT 订单
    function cancelSellNFT(uint256 orderId) public {
        NFTOrderInfo storage NFTOrderInfoDetail = NFTOrderInfoMap[orderId];

        // 检查订单是否存在
        require(
            NFTOrderInfoDetail.sellerWalletAddress != address(0),
            "Order does not exist"
        );
        // 检查订单状态是否为有效挂单
        require(
            NFTOrderInfoDetail.status == OrderStatus.Active,
            "Order is not active"
        );
        // 检查调用者是否是订单创建者或者合约所有者
        require(
            NFTOrderInfoDetail.sellerWalletAddress == msg.sender,
            "Not authorized to cancel this order"
        );

        NFTOrderInfoDetail.status = OrderStatus.Cancelled;
        approve(
            NFTOrderInfoDetail.sellerWalletAddress,
            NFTOrderInfoDetail.tokenId
        ); // 返回授权

        // 触发订单取消事件
        emit OrderCancelled(NFTOrderInfoDetail);
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

    function testHello2() public pure returns (string memory) {
        return "hello2";
    }
}
