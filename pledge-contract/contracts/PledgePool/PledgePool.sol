// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../Common/Lend.sol";
import "../Common/Borrow.sol";
import "../Common/Fee.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// 管理地址权限的合约
contract PledgePool is ReentrancyGuard, Ownable {
    /// @notice 内部常量，默认小数位数
    uint256 internal constant calDecimal = 1e18;
    /// @notice 内部常量，基于佣金和利息的小数位数
    uint256 internal constant baseDecimal = 1e8;
    /// @notice 公共变量，最小存款金额
    uint256 public minAmount = 1e18;
    /// @notice 内部常量，一年的时间（以天为单位）
    // uint256 constant baseYear = 365 days;

    /// @notice 定义借贷池的状态枚举
    enum PoolState {
        MATCH,
        EXECUTION,
        FINISH,
        LIQUIDATION,
        UNDONE
    }
    /// @notice 内部常量，默认的池状态为MATCH
    PoolState constant defaultChoice = PoolState.MATCH;

    /// @notice 公共布尔变量，全局暂停标志
    bool public globalPaused = false;
    /// @notice 公共变量，PancakeSwap路由地址
    address public swapRouter;
    /// @notice 公共可支付地址，接收手续费的地址
    address payable public feeAddress;
    /// @notice 公共变量，预言机地址
    address public oracle;
    /// @notice 公共变量，出借手续费
    uint256 public lendFee;
    /// @notice 公共变量，借款手续费
    uint256 public borrowFee;

    struct PoolBaseInfo {
        uint256 settleTime; // 结算时间
        uint256 endTime; // 结束时间
        uint256 interestRate; // 池的固定利率，单位是1e8 (1e8)
        uint256 maxSupply; // 池的最大限额
        uint256 lendSupply; // 当前实际存款的借款
        uint256 borrowSupply; // 当前实际存款的借款
        uint256 martgageRate; // 池的抵押率，单位是1e8 (1e8)
        address lendToken; // 借款方代币地址 (比如 BUSD..)
        address borrowToken; // 借款方代币地址 (比如 BTC..)
        PoolState state; // 状态 'MATCH, EXECUTION, FINISH, LIQUIDATION, UNDONE'
        address spCoin; // sp_token的erc20地址 (比如 spBUSD_1..)
        address jpCoin; // jp_token的erc20地址 (比如 jpBTC_1..)
        uint256 autoLiquidateThreshold; // 自动清算阈值 (触发清算阈值)
    }
    // total base pool.
    PoolBaseInfo[] public poolBaseInfo;

    // 每个池的数据信息
    struct PoolDataInfo {
        uint256 settleAmountLend; // 结算时的实际出借金额
        uint256 settleAmountBorrow; // 结算时的实际借款金额
        uint256 finishAmountLend; // 完成时的实际出借金额
        uint256 finishAmountBorrow; // 完成时的实际借款金额
        uint256 liquidationAmounLend; // 清算时的实际出借金额
        uint256 liquidationAmounBorrow; // 清算时的实际借款金额
    }

    // total data pool
    PoolDataInfo[] public poolDataInfo;

    // 借款用户信息
    struct BorrowInfo {
        uint256 stakeAmount; // 当前借款的质押金额
        uint256 refundAmount; // 多余的退款金额
        bool hasNoRefund; // 默认为false，false = 未退款，true = 已退款
        bool hasNoClaim; // 默认为false，false = 未认领，true = 已认领
    }
    // Info of each user that stakes tokens.  {user.address : {pool.index : user.borrowInfo}}
    mapping(address => mapping(uint256 => BorrowInfo)) public userBorrowInfo;

    // 借款用户信息
    struct LendInfo {
        uint256 stakeAmount; // 当前借款的质押金额
        uint256 refundAmount; // 超额退款金额
        bool hasNoRefund; // 默认为false，false = 无退款，true = 已退款
        bool hasNoClaim; // 默认为false，false = 无索赔，true = 已索赔
    }

    // Info of each user that stakes tokens.  {user.address : {pool.index : user.lendInfo}}
    mapping(address => mapping(uint256 => LendInfo)) public userLendInfo;

    constructor(
        address _oracle,
        address _swapRouter,
        address payable _feeAddress
    ) Ownable(msg.sender) {
        require(_oracle != address(0), "Is zero address");
        require(_swapRouter != address(0), "Is zero address");
        require(_feeAddress != address(0), "Is zero address");

        oracle = _oracle;
        swapRouter = _swapRouter;
        feeAddress = _feeAddress;
        lendFee = 0;
        borrowFee = 0;
    }

    /**
     * @dev Set the lend fee and borrow fee
     * @notice Only allow administrators to operate
     */
    function setFee(uint256 _lendFee,uint256 _borrowFee) onlyOwner external{
        lendFee = _lendFee;
        borrowFee = _borrowFee;
    }

    /**
     * @dev Set swap router address, example pancakeswap or babyswap..
     * @notice Only allow administrators to operate
     */
    function setSwapRouterAddress(address _swapRouter) onlyOwner external{
        require(_swapRouter != address(0), "Is zero address");
        swapRouter = _swapRouter;
    }

    /**
     * @dev Set up the address to receive the handling fee
     * @notice Only allow administrators to operate
     */
    function setFeeAddress(address payable _feeAddress) onlyOwner external {
        require(_feeAddress != address(0), "Is zero address");
        feeAddress = _feeAddress;
    }

    /**
     * @dev 修改最小存款金额
     */
    function setMinAmount(uint256 _minAmount) onlyOwner external {
        minAmount = _minAmount;
    }


     /**
     * @dev Query pool length
     */
    function poolLength() external view returns (uint256) {
        return poolBaseInfo.length;
    }

    /**
     * @dev 创建一个新的借贷池。函数接收一系列参数，包括结算时间、结束时间、利率、最大供应量、抵押率、借款代币、借出代币、SP代币、JP代币和自动清算阈值。
     *  Can only be called by the owner.
     */
    function createPoolInfo(
        uint256 _settleTime,  uint256 _endTime, uint64 _interestRate,
        uint256 _maxSupply, uint256 _martgageRate, address _lendToken, address _borrowToken,
        address _spToken, address _jpToken, uint256 _autoLiquidateThreshold) public onlyOwner{
        // 检查是否已设置token ...
        // 需要结束时间大于结算时间
        require(_endTime > _settleTime, "createPool:end time grate than settle time");
        // 需要_jpToken不是零地址
        require(_jpToken != address(0), "createPool:is zero address");
        // 需要_spToken不是零地址
        require(_spToken != address(0), "createPool:is zero address");

        // 推入基础池信息
        poolBaseInfo.push(PoolBaseInfo({
            settleTime: _settleTime,
            endTime: _endTime,
            interestRate: _interestRate,
            maxSupply: _maxSupply,
            lendSupply:0,
            borrowSupply:0,
            martgageRate: _martgageRate,
            lendToken:_lendToken,
            borrowToken:_borrowToken,
            state: defaultChoice,
            spCoin: address(_spToken),
            jpCoin: address(_jpToken),
            autoLiquidateThreshold:_autoLiquidateThreshold
        }));
        // 推入池数据信息
        poolDataInfo.push(PoolDataInfo({
            settleAmountLend:0,
            settleAmountBorrow:0,
            finishAmountLend:0,
            finishAmountBorrow:0,
            liquidationAmounLend:0,
            liquidationAmounBorrow:0
        }));
    }

    /**
     * @dev Get pool state
     * @notice returned is an int integer
     */
    function getPoolState(uint256 _pid) public view returns (uint256) {
        PoolBaseInfo storage pool = poolBaseInfo[_pid];
        return uint256(pool.state);
    }

    //lend start
    // function modifyPoolPrice(uint256 _pid, uint256 amount) public {
    //     // PoolBaseInfo storage pool = poolBaseInfo[_pid];
    //     // pool.lendSupply = pool.lendSupply + amount;        
    //     (bool success, ) = payable(walletAddress).call{value: amount}(""); //这个bool 有时间检查一下
    //     require(success, "Call failed");
    // }

    function modifyPoolPrice(uint256 _pid, uint256 amount) public {
        // PoolBaseInfo storage pool = poolBaseInfo[_pid];
        // pool.lendSupply = pool.lendSupply + amount;        
        // (bool success, ) = payable(walletAddress).call{value: amount}(""); //这个bool 有时间检查一下
        // require(success, "Call failed");
    }

    // 添加一个 depositETH 函数，用于向合约地址存入 ETH
    function addLiquidity() public payable {
        require(msg.value > 0, "No Input ETH");

        // x * y : ETH * USDC
    }
    //lend end

    //borrow start
    // function modifyPoolState(uint256 _pid) public {
    //     PoolBaseInfo storage pool = poolBaseInfo[_pid];
    //     pool.state = uint256(2);
    // }
    //borrow end

    //fee start
    function addFee() public payable {
        require(msg.value > 0, "No Input ETH");
        // x * y : ETH * USDC
    }
    //fee end

    address public usdcAddress = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238; // USDC 代币合约地址
    //swap start
    function transferUSDC(address recipient, uint256 amount) external onlyOwner {
        IERC20 usdc = IERC20(usdcAddress); // 获取 USDC 代币合约实例
        require(usdc.transfer(recipient, amount), "USDC transfer failed"); // 执行转账操作
    }
    //swap end
}
