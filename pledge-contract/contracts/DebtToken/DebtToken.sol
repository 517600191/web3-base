// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// 管理地址权限的合约
contract DebtToken is ERC20, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    mapping(address => mapping(address => uint256)) public balances; // 代币地址 => 持有者地址 => 余额

    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, 100 * 10 ** 18);
    }

    // 为指定地址铸造代币
    function mint(address _to, uint256 _amount) public onlyOwner returns (bool) {
        _mint(_to, _amount);
        return true;
    }

    // 从指定地址销毁代币
    function burn(address _from,uint256 _amount) public onlyOwner returns (bool) {
        _burn(_from, _amount);
        return true;
    }

    event TokenReceived(address indexed token, address indexed sender, address indexed receiver, uint256 amount);

    // fallback函数处理代币接收
    fallback() external payable virtual nonReentrant {
        if (msg.sender == address(0)) {
            // 接收ETH
            emit TokenReceived(address(0), msg.sender, address(this), msg.value);
        } else {
            // 接收ERC-20代币
            IERC20 token = IERC20(msg.sender);
            uint256 amount = token.balanceOf(address(this));
            require(amount > 0, "No tokens received");
            emit TokenReceived(msg.sender, tx.origin, address(this), amount);
        }
    }

    // 安全接收代币函数，防止重入攻击
    function safeReceiveTokens(address tokenAddress, uint256 amount) external nonReentrant {
        IERC20 token = IERC20(tokenAddress);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit TokenReceived(tokenAddress, msg.sender, address(this), amount);
    }

    // 允许合约提取ERC-20代币
    function withdrawTokens(address tokenAddress, uint256 amount, address to) external onlyOwner nonReentrant {
        IERC20 token = IERC20(tokenAddress);
        require(token.transfer(to, amount), "Withdrawal failed");
    }

    // 允许合约提取ETH
    function withdrawETH(uint256 amount, address payable to) external onlyOwner nonReentrant {
        payable(to).transfer(amount);
    }
}
