// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract LiquidityPool is
    Initializable,
    OwnableUpgradeable,
    ERC20Upgradeable,
    ReentrancyGuardUpgradeable
{
    using Math for uint256;

    string[] public tokensArr; //用户代币 0 在流动性池中的当前储备量
    IERC20 public token0; //代币 0 的 ERC20 接口实例
    IERC20 public token1; //代币 1 的 ERC20 接口实例
    IERC20Metadata public tokenMetadata0; //代币 0 的 ERC20 接口实例
    IERC20Metadata public tokenMetadata1; //代币 1 的 ERC20 接口实例
    address public tokenAddress0; //代币 0 的 ERC20 地址
    address public tokenAddress1; //代币 1 的 ERC20 地址
    uint256 public reserve0; //代币 0 在流动性池中的当前储备量
    uint256 public reserve1; //代币 1 在流动性池中的当前储备量
    uint256 public reserveFee0; //代币 0 fee
    uint256 public reserveFee1; //代币 1 fee
    uint256 public FEE_DENOMINATOR; //手续费计算的分母常量
    uint256 public fee;
    uint256 public addLiquidity0Min; //可接受的代币0最小存入数量
    uint256 public addLiquidity0Max; //可接受的代币0最大存入数量
    uint256 public addLiquidity1Min; //可接受的代币1最小存入数量
    uint256 public addLiquidity1Max; //可接受的代币1最大存入数量
    uint256 public liquidityMin; //可接受的代币最小取出数量
    uint256 public liquidityMax; //可接受的代币最大取出数量
    uint256 public swapMin; //swap min
    uint256 public swapMax; //swap max

    // 定义返回结构体
    struct ContractBaseInfo {
        uint256 fee;
        uint256 FEE_DENOMINATOR;
        uint256 reserve0;
        uint256 reserve1;
        string[] tokensArr;
    }

    // 代币池的构造函数
    struct TokenNameInfo {
        string tokenName;
        uint256 tokenNum;
    }

    event Mint(address indexed sender, uint256 amount0);
    event Burn(
        address indexed sender,
        uint256 amount0,
        uint256 amount1,
        address indexed to
    );
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    event Sync(uint256 reserve0, uint256 reserve1);

    receive() external payable {}

    function initialize(
        address _token0,
        address _token1,
        string memory _tokenName0,
        string memory _tokenName1,
        address _owner
    ) public initializer {
        __Ownable_init(_owner);
        __ERC20_init("Liquidity Token", "LP");
        __ReentrancyGuard_init();
        tokensArr.push(string.concat(_tokenName0, "/", _tokenName1));
        // tokensArr.push(string.concat(_tokenName0, "/", _tokenName1));
        tokenAddress0 = _token0;
        tokenAddress1 = _token1;
        token0 = IERC20(_token0); //ETH
        token1 = IERC20(_token1); //USDC
        tokenMetadata0 = IERC20Metadata(_token0); //ETH
        tokenMetadata1 = IERC20Metadata(_token1); //USDC
        FEE_DENOMINATOR = 1000;
        fee = 3;
        addLiquidity0Min = 100;
        addLiquidity0Max = 100 * 10 ** 18;
        addLiquidity1Min = 100;
        addLiquidity1Max = 100 * 10 ** 18;
        liquidityMin = 1;
        liquidityMax = 100;
        swapMin = 100;
        swapMax = 100 * 10 ** 18;
    }

    // 新的初始化函数，用于升级时初始化新状态
    // function reinitialize() public onlyOwner reinitializer(2) {
    //     // 版本号自加需要常量
    //     _NFTOrderInfoId = 10000;
    // }

    /**
     * @notice 添加流动性
     * @param amount0Desired 期望存入的代币 0 数量
     * @param amount1Desired 期望存入的代币 1 数量
     * @return liquidity 获得的流动性代币数量
     */
    function addLiquidity(
        uint256 amount0Desired,
        uint256 amount1Desired
    ) external nonReentrant returns (uint256 liquidity) {
        require(amount0Desired > 0, "Amount0Desired must be greater than 0");
        require(amount1Desired > 0, "Amount1Desired must be greater than 0");
        require(
            amount0Desired >= addLiquidity0Min &&
                amount0Desired <= addLiquidity0Max,
            "Amount0Desired out of range"
        );
        require(
            amount1Desired >= addLiquidity1Min &&
                amount1Desired <= addLiquidity1Max,
            "Amount1Desired out of range"
        );

        // 获取当前总供应量
        uint256 currentTotalSupply = totalSupply();

        if (currentTotalSupply == 0) {
            require(
                amount1Desired >= 100 && amount1Desired >= 100,
                "Invalid Input"
            );
            liquidity = (amount0Desired * amount1Desired).sqrt();
        } else {
            liquidity = Math.min(
                amount0Desired.mulDiv(currentTotalSupply, reserve0),
                amount1Desired.mulDiv(currentTotalSupply, reserve1)
            );
        }

        _safeTransferFrom(token0, msg.sender, address(this), amount0Desired);
        _safeTransferFrom(token1, msg.sender, address(this), amount1Desired);
        reserve0 += amount0Desired;
        reserve1 += amount1Desired;
        _mint(msg.sender, liquidity);
        emit Mint(msg.sender, liquidity);
    }

    /**
     * @notice 移除流动性
     * @param liquidity 要移除的流动性代币数量
     * @param to 接收代币的地址
     * @return amount0 实际取出的代币 0 数量
     * @return amount1 实际取出的代币 1 数量
     */
    function removeLiquidity(
        uint256 liquidity,
        address to
    ) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        require(
            liquidity >= liquidityMin && liquidity <= liquidityMax,
            "Liquidity amount out of range"
        );
        require(to != address(0), "Invalid recipient address");

        // 查询用户拥有的当前合约代币数量
        uint256 userLPBalance = IERC20(address(this)).balanceOf(msg.sender);
        require(userLPBalance >= liquidity, "Insufficient LP tokens");

        uint256 balance0 = token0.balanceOf(address(this));
        uint256 balance1 = token1.balanceOf(address(this));
        uint _totalSupply = totalSupply();

        amount0 = (liquidity * balance0) / _totalSupply;
        amount1 = (liquidity * balance1) / _totalSupply;

        _burn(msg.sender, liquidity);
        _safeTransfer(token0, to, amount0);
        _safeTransfer(token1, to, amount1);
        reserve0 -= amount0;
        reserve1 -= amount1;
        emit Burn(msg.sender, amount0, amount1, to);
    }

    /**
     * @notice 交换代币
     * @param amountIn 输入的代币数量
     * @param amountOut 期望获得的最小输出代币数量
     * @param tokenIn 输入的代币地址
     * @param tokenOut 输出的代币地址
     * @param to 接收输出代币的地址
     */
    function swap(
        uint256 amountIn,
        uint256 amountOut,
        address tokenIn,
        address tokenOut,
        address to
    ) external nonReentrant {
        // 验证输入参数
        require(amountIn > 0, "Input amount must be greater than 0");
        require(amountOut > 0, "Input output amount must be greater than 0");
        require(to != address(0), "Invalid recipient address");
        require(
            amountIn >= swapMin && amountIn <= swapMax,
            "Input amount out of range"
        );

        // 转移输入代币到合约
        if (tokenAddress0 == tokenIn) {
            require(
                (reserve0 +
                    (amountIn * FEE_DENOMINATOR) /
                    (FEE_DENOMINATOR + fee)) *
                    (reserve1 - amountOut) >=
                    reserve0 * reserve1,
                "Invalid input"
            );

            reserve0 += amountIn;
            reserve1 -= amountOut;
            reserveFee0 += (amountIn * fee) / (fee + FEE_DENOMINATOR);

            if (((amountIn * fee) % (fee + FEE_DENOMINATOR)) > 0) {
                reserveFee0++;
            }

            _safeTransferFrom(token0, msg.sender, address(this), amountIn);
            _safeTransfer(token1, to, amountOut);
        } else {
            require(
                (reserve1 +
                    (amountIn * FEE_DENOMINATOR) /
                    (FEE_DENOMINATOR + fee)) *
                    (reserve0 - amountOut) >=
                    reserve0 * reserve1,
                "Invalid input"
            );

            reserve1 += amountIn;
            reserve0 -= amountOut;
            reserveFee1 += (amountIn * fee) / (fee + FEE_DENOMINATOR);

            if (((amountIn * fee) % (fee + FEE_DENOMINATOR)) > 0) {
                reserveFee1++;
            }

            _safeTransferFrom(token1, msg.sender, address(this), amountIn);
            _safeTransfer(token0, to, amountOut);
        }
    }

    // 安全转账
    function _safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value
    ) private {
        require(from != address(0), "From address cannot be zero");
        require(to != address(0), "To address cannot be zero");
        require(value > 0, "Transfer value must be greater than 0");
        bool success = token.transferFrom(from, to, value);
        require(success, "Transfer failed");
    }

    // 安全直接转账（从合约转出）
    function _safeTransfer(IERC20 token, address to, uint256 value) private {
        require(to != address(0), "To address cannot be zero");
        require(value > 0, "Transfer value must be greater than 0");
        bool success = token.transfer(to, value);
        require(success, "Transfer failed");
    }

    // 返回基本数据
    function getContractBase() external view returns (ContractBaseInfo memory) {
        return
            ContractBaseInfo(
                fee,
                FEE_DENOMINATOR,
                reserve0,
                reserve1,
                tokensArr
            );
    }

    // 获取自己的流动性份额
    function getLiquidityToken(
        address from
    ) external view returns (TokenNameInfo memory) {
        assert(from != address(0));
        uint256 tokenNum = IERC20(this).balanceOf(from);
        return TokenNameInfo(tokensArr[0], tokenNum);
    }

    // 设置费率
    function setFee(uint256 _fee) external onlyOwner returns (bool) {
        assert(_fee <= FEE_DENOMINATOR);
        assert(_fee >= 0);
        fee = _fee;
        return (true);
    }
}
