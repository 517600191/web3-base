// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 管理地址权限的合约
contract PledgeChainLink is Initializable {
    address owner;
    mapping(address => AggregatorV3Interface) public assetsMap; //映射资产 ID 到对应的 Chainlink 价格聚合器接口
    mapping(address => uint256) internal decimalsMap; // 映射资产 ID 到对应的小数位数。
    mapping(address => uint256) internal priceMap; // 映射资产 ID 到手动设置的价格。
    uint256 internal decimals; // 价格计算的精度，默认为 1。

    modifier onlyOwner() {
        require(msg.sender == owner, "no owner");
        _;
    }

    function initialize() public initializer {
        decimals = 1;
    }

    // 设置价格计算的精度，该函数用于更新价格计算的精度，需要有效的多签名调用。
    function setDecimals(uint256 newDecimals) public onlyOwner {
        decimals = newDecimals;
    }

    /**
     * @notice 批量设置资产价格
     * @dev 该函数用于批量更新资产价格，需要有效的多签名调用。
     * @param assets 资产 ID 数组，与价格数组一一对应。
     * @param prices 资产价格数组，与资产 ID 数组一一对应。
     */
    function setPrices(
        address[] memory assets,
        uint256[] memory prices
    ) external onlyOwner {
        require(
            assets.length == prices.length,
            "input arrays' length are not equal"
        );
        uint256 len = assets.length;
        for (uint i = 0; i < len; i++) {
            priceMap[assets[i]] = prices[i];
        }
    }

    /**
     * @notice 设置单个资产的价格
     * @dev 该函数用于手动设置单个资产的价格，需要有效的多签名调用。
     * @param asset 资产地址，用于设置对应资产的价格。
     * @param price 资产价格，用于更新对应资产的价格。
     */
    function setPrice(address asset, uint256 price) public onlyOwner {
        priceMap[asset] = price;
    }

    /**
     * @notice 批量获取资产价格
     * @dev 该函数用于批量获取资产价格。
     * @param  assets 资产 ID 数组，用于获取对应资产的价格。
     * @return uint[] 资产价格数组，与输入的资产 ID 数组一一对应，价格以 1e8 为单位，若未设置或合约暂停则返回 0。
     */
    function getPrices(
        address[] memory assets
    ) public view returns (uint256[] memory) {
        uint256 len = assets.length;
        uint256[] memory prices = new uint256[](len);
        for (uint i = 0; i < len; i++) {
            prices[i] = getUnderlyingPrice(assets[i]);
        }
        return prices;
    }

    /**
     * @notice 获取单个资产的价格
     * @dev 该函数用于获取单个资产的价格。
     * @param asset 资产地址，用于获取对应资产的价格。
     * @return uint 资产价格，以 1e8 为单位，若未设置或合约暂停则返回 0。
     */
    function getPrice(address asset) public view returns (uint256) {
        return getUnderlyingPrice(asset);
    }

    /**
     * @notice 根据资产 ID 获取资产价格
     * @dev 该函数用于根据资产 ID 获取资产价格，优先从 Chainlink 预言机获取，若未设置则返回手动设置的价格。
     * @param underlying 资产 ID，用于获取对应资产的价格。
     * @return uint 资产价格，以 1e8 为单位，若未设置或合约暂停则返回 0。
     */
    function getUnderlyingPrice(
        address underlying
    ) public view returns (uint256) {
        AggregatorV3Interface assetsPrice = assetsMap[underlying];
        if (address(assetsPrice) != address(0)) {
            (, int price, , , ) = assetsPrice.latestRoundData();
            uint256 tokenDecimals = decimalsMap[underlying];
            if (tokenDecimals < 18) {
                return
                    (uint256(price) / decimals) * (10 ** (18 - tokenDecimals));
            } else if (tokenDecimals > 18) {
                return uint256(price) / decimals / (10 ** (18 - tokenDecimals));
            } else {
                return uint256(price) / decimals;
            }
        } else {
            return priceMap[underlying];
        }
    }

    /**
     * @notice 设置资产的价格聚合器和小数位数
     * @dev 该函数用于设置资产的 Chainlink 价格聚合器地址和小数位数，需要有效的多签名调用。
     * @param asset 资产地址，用于设置对应资产的价格聚合器和小数位数。
     * @param aggergator 价格聚合器地址，用于获取对应资产的实时价格。
     * @param _decimals 资产的小数位数，用于价格计算。
     */
    function setAssetsAggregator(
        address asset,
        address aggergator,
        uint256 _decimals
    ) public onlyOwner {
        assetsMap[asset] = AggregatorV3Interface(aggergator);
        decimalsMap[asset] = _decimals;
    }

    /**
     * @notice 根据资产 ID 设置资产的价格聚合器和小数位数
     * @dev 该函数用于根据资产 ID 设置资产的 Chainlink 价格聚合器地址和小数位数，需要有效的多签名调用。
     * @param underlying 资产 ID，用于设置对应资产的价格聚合器和小数位数。
     * @param aggergator 价格聚合器地址，用于获取对应资产的实时价格。
     * @param _decimals 资产的小数位数，用于价格计算。
     */
    function setUnderlyingAggregator(
        address underlying,
        address aggergator,
        uint256 _decimals
    ) public onlyOwner {
        require(underlying != address(0), "underlying cannot be zero");
        assetsMap[underlying] = AggregatorV3Interface(aggergator);
        decimalsMap[underlying] = _decimals;
    }

    /**
     * @notice 根据资产地址获取资产的价格聚合器和小数位数
     * @dev 该函数用于根据资产地址获取资产的 Chainlink 价格聚合器地址和小数位数。
     * @param asset 资产地址，用于获取对应资产的价格聚合器和小数位数。
     * @return address 资产的价格聚合器地址。
     * @return uint256 资产的小数位数。
     */
    function getAssetsAggregator(
        address asset
    ) public view returns (AggregatorV3Interface, uint256) {
        return (assetsMap[asset], decimalsMap[asset]);
    }

    /**
     * @notice 根据资产 ID 获取资产的价格聚合器和小数位数
     * @dev 该函数用于根据资产 ID 获取资产的 Chainlink 价格聚合器地址和小数位数。
     * @param underlying 资产 ID，用于获取对应资产的价格聚合器和小数位���。
     * @return address 资产的价格聚合器地址。
     * @return uint256 资产的小数位数。
     */
    function getUnderlyingAggregator(
        address underlying
    ) public view returns (AggregatorV3Interface, uint256) {
        return (assetsMap[underlying], decimalsMap[underlying]);
    }

    mapping(string => AggregatorV3Interface) internal DataFeed;

    event LogMessage(int256 data1, uint8 data2, uint256 data3);

    function setPriceETHFeed(
        string memory tokenRadio,
        address _dataFeed
    ) public {
        // dataFeed = AggregatorV3Interface(_dataFeed);
        DataFeed[tokenRadio] = AggregatorV3Interface(_dataFeed);
    }

    // 获取Chainlink ETH -> USDC  265147577820  2651.47577820
    function getChainlinkDataFeedLatestAnswer(
        string memory tokenRadio
    ) public returns(int256, uint8){
        AggregatorV3Interface dataFeed = DataFeed[tokenRadio];
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        uint8 decimalsTemp = dataFeed.decimals();
        emit LogMessage(answer, decimalsTemp, 2222);
        return (answer, decimalsTemp);
    }
}
