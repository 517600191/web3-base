// SPDX-License-Identifier: MIT 
pragma solidity ^0.8;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract NFTAuctionV2 is Initializable {
    struct NFTAuctionStruct {
        address seller; //卖家地址
        uint256 auctionDurationTime; //竞拍持续时间
        uint256 startPrice; //起拍价
        bool isEnded; //是否结束
        address maxBidder; //最高出价者
        uint256 maxPrice; //最高价
        uint256 startTime; //开始时间
        address nftContractAddress; //NFT合约地址
        uint256 tokenID; //NFTID
    }

    mapping(uint256 => NFTAuctionStruct) public NFTAuctionStructMap; //拍卖映射
    uint256 public selectedAuctionId; //当前下一个拍卖ID
    address public admin; //管理员地址

    //初始化，确保只能执行一次
    function initialize() public initializer {
        admin = msg.sender;
    }

    //创建拍卖
    function createAuction (
        uint256 _auctionDurationTime,
        uint256 _startPrice,
        address _nftContractAddress,
        uint256 _tokenID
    ) public {
        require(msg.sender == admin, "Only admin can create auction"); //只有管理员可以创建拍卖
        require(_auctionDurationTime >= 60, "Duration must be at least 1 minute"); //持续时间必须至少为1分钟
        require(_startPrice >= 1000000000, "Start price must be at least 1000000000 wei"); //起拍价

        NFTAuctionStructMap[selectedAuctionId] = NFTAuctionStruct({
            seller: msg.sender,
            auctionDurationTime: _auctionDurationTime,
            startPrice: _startPrice,
            isEnded: false,
            maxBidder: address(0),
            maxPrice: 0,
            startTime: block.timestamp,
            nftContractAddress: _nftContractAddress,
            tokenID: _tokenID
        });
    }

    function bid(uint256 auctionId) public payable {
        NFTAuctionStruct storage auction = NFTAuctionStructMap[auctionId];

        require(!auction.isEnded && (auction.startTime + auction.auctionDurationTime > block.timestamp), "ended"); //判断当前拍卖是否结束
        require(msg.value > auction.startPrice && msg.value > auction.maxPrice, "Bid must be higher than current max bid"); //判断出价是否大于当前最高出价

        //退回之前的最高出价者
        if (msg.value > auction.startPrice && msg.value > auction.maxPrice) {
            payable(auction.maxBidder).transfer(auction.maxPrice);
        }

        auction.maxBidder = msg.sender;
        auction.maxPrice = msg.value;
    }

    //测试打印
    event LogMessage(uint256 data1, uint256 data2);
    function printMessage() public {
        NFTAuctionStruct storage auction = NFTAuctionStructMap[0];
        emit LogMessage(auction.startTime, block.timestamp);
    }

    function testHello() public pure returns (string memory) {
        return "hello";
    }

    function testHello2() public pure returns (string memory) {
        return "hello2";
    }
}