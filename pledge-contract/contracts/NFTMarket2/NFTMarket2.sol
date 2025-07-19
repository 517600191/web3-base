// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// 管理地址权限的合约
contract NFTMarket2 is
    Initializable,
    OwnableUpgradeable,
    // ERC721EnumerableUpgradeable,
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
        address sellerNFTaddress; // 卖家NFT合约地址
        uint256 tokenId; // NFT tokenID
        uint256 selleNumber; // 卖出价格
        OrderStatus status; // 状态枚举
    }

    struct NFTERC721Info {
        IERC721 NFT;
        uint256 FLOORPRICE;
        uint256 CHANGES; //
        uint256 TOPOFFER; //
        uint256 VOLUMES; //
        uint256 SALES; // 
        uint256 OWNERS; // 
        string SUPPLY; // 
    }

    uint256 private _NFTOrderInfoId; // 订单 id 自加
    mapping(uint256 => NFTOrderInfo) public NFTOrderInfoMap; //钱包映射
    uint256[] public orderInfoIds; // 新增数组，记录所有有效的 _NFTOrderInfoId
    mapping(address => NFTERC721Info) public NFTIERC721Map;
    uint256 public FEE_DENOMINATOR; //手续费计算的分母常量
    uint256 public fee;

    event LogMessage(address data1, uint256 data2);
    event LogMessage2(address data1);

    // 初始化
    function initialize(
        // string memory _name,
        // string memory _symbol,
        address _owner
    ) public initializer {
        __Ownable_init(_owner);
        _NFTOrderInfoId = 10000;
        FEE_DENOMINATOR = 1000;
        fee = 25;
        // __ERC721_init(_name, _symbol);
        // __ERC721Enumerable_init();
    }

    // 新的初始化函数，用于升级时初始化新状态
    // function reinitialize() public onlyOwner reinitializer(2) {
    //     // 版本号自加需要常量
    //     _NFTOrderInfoId = 10000;
    // }

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

    // 创建 NFT 订单
    function sellNFT(
        address walletAddress,
        address NFTaddress,
        uint256 tokenId,
        uint256 selleNumber
    ) public {
        require(NFTaddress != address(0), "error address");

        if (address(NFTIERC721Map[NFTaddress].NFT) == address(0)) {
            NFTIERC721Map[NFTaddress].NFT = IERC721(NFTaddress);
        }

        // 断言调用者是 NFT 所有者
        require(NFTIERC721Map[NFTaddress].NFT.ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        // 断言卖出价格大于 0
        require(selleNumber > 0, "Selling price must be greater than 0");
        // 断言钱包地址有效
        require(walletAddress != address(0), "Invalid wallet address");

        // 先进行授权操作并检查是否成功
        // IERC721(NFTaddress).approve(address(this), tokenId);
        NFTIERC721Map[NFTaddress].NFT.safeTransferFrom(msg.sender, address(this), tokenId);

        NFTOrderInfoMap[_NFTOrderInfoId] = NFTOrderInfo({
            orderId: _NFTOrderInfoId,
            sellerWalletAddress: walletAddress,
            sellerNFTaddress: NFTaddress,
            tokenId: tokenId,
            selleNumber: selleNumber,
            status: OrderStatus.Active
        });
        orderInfoIds.push(_NFTOrderInfoId); // 将 _NFTOrderInfoId 添加到数组中
        _NFTOrderInfoId++;
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
                    (NFTOrderInfoDetail.selleNumber * fee) /
                    FEE_DENOMINATOR),
            "Insufficient funds"
        );

        address seller = NFTOrderInfoDetail.sellerWalletAddress;
        uint256 tokenId = NFTOrderInfoDetail.tokenId;

        // 转移资金给卖家
        (bool success, ) = payable(seller).call{
            value: NFTOrderInfoDetail.selleNumber
        }("");
        require(success, "Transfer failed");

        // 更新订单状态为已售出
        NFTOrderInfoDetail.status = OrderStatus.Sold;

        // 转移 NFT 所有权给买家
        NFTIERC721Map[NFTOrderInfoDetail.sellerNFTaddress].NFT.safeTransferFrom(address(this), to, tokenId);
    }

    event OrderCancelled(NFTOrderInfo data1);
    // 取消 NFT 订单
    function cancelSellNFT(uint256 orderId, address NFTaddress) public {
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
        NFTIERC721Map[NFTaddress].NFT.safeTransferFrom(address(this), NFTOrderInfoDetail.sellerWalletAddress, NFTOrderInfoDetail.tokenId);

        // 触发订单取消事件
        emit OrderCancelled(NFTOrderInfoDetail);
    }

    // 设置费率
    function setFee(uint256 _fee) external onlyOwner {
        assert(_fee <= FEE_DENOMINATOR);
        assert(_fee >= 0);
        fee = _fee;
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
