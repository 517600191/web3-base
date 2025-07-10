// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// 管理地址权限的合约
contract AddressPrivileges {
    address owner;
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private _minters;

    modifier onlyOwner() {
        require(msg.sender == owner, "no owner");
        _;
    }

    // 为资产添加一个铸币者地址
    function addMinter(address _addMinter) public onlyOwner returns (bool) {
        require(_addMinter != address(0), "Token: _addMinter is the zero address");
        return _minters.add(_addMinter);
    }

    // 删除一个铸币者地址。
    function delMinter(address _delMinter) public onlyOwner returns (bool) {
        require(_delMinter != address(0), "Token: _delMinter is the zero address");
        return _minters.remove(_delMinter);
    }

    // 获取铸币者列表的长度。
    function getMinterLength() public view returns (uint256) {
        return _minters.length();
    }

    // 判断指定地址是否为铸币者。
    function isMinter(address account) public view returns (bool) {
        return _minters.contains(account);
    }

    // 根据索引获取铸币者地址。
    function getMinter(uint256 _index) public view  returns (address){
        require(_index <= getMinterLength() - 1, "Token: index out of bounds");
        return _minters.at(_index);
    }

    // 修饰器，仅允许铸币者调用被修饰的函数。
    modifier onlyMinter() {
        require(isMinter(msg.sender), "Token: caller is not the minter");
        _;
    }
}
