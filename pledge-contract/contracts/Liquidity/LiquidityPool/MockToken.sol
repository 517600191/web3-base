// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // 铸造初始代币给部署者
        _mint(msg.sender, 100000);
        // _mint(msg.sender, 100 * 10 ** decimals());
    }
}