// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// 提供管理白名单地址的功能，包括添加、移除和检查地址是否在白名单中。
library whiteListAddress {
    // 添加白名单
    function addWhiteListAddress(
        address[] storage whiteList,
        address temp
    ) internal validAddress(temp) {
        uint256 len = whiteList.length;
        bool isAddressPresent = false;
        for (uint256 i = 0; i < len; i++) {
            if (whiteList[i] == temp) {
                isAddressPresent = true;
            }
        }

        if (!isAddressPresent) {
            whiteList.push(temp);
        }
    }

    // 删除白名单
    function removeWhiteListAddress(
        address[] storage whiteList,
        address temp
    ) internal validAddress(temp) {
        uint256 len = whiteList.length;
        for (uint256 i = 0; i < len; i++) {
            if (whiteList[i] == temp) {
                whiteList[i] = whiteList[whiteList.length - 1];
                whiteList.pop();
                break;
            }
        }
    }

    modifier validAddress(address temp) {
        require(temp != address(0), "Invalid address");
        _; // 函数体在这里执行
    }
}

// 多签合约
contract MultiSignature is Initializable {
    uint256 private constant multiSignaturePositon =
        uint256(keccak256("org.multiSignature.storage")); // 多签名存储位置的常量，通过 keccak256 哈希生成
    uint256 private constant defaultIndex = 0; // 默认索引值
    using whiteListAddress for address[];
    address[] public signatureOwners; // 多签名所有者地址数组
    uint256 public threshold; // 签名阈值，达到该数量签名申请才有效。默认2
    address owner;

    // 签名申请信息结构体
    struct signatureInfo {
        address applicant; //申请发起者地址
        address[] signatures; //签名者地址数组
    }

    mapping(bytes32 => signatureInfo[]) public signatureMap; // 消息哈希到签名申请信息数组的映射

    modifier validCall() {
        checkMultiSignature();
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "no owner");
        _;
    }

    /**
     * @dev 修饰器，验证申请索引是否有效。
     * @param msghash 申请消息哈希。
     * @param index 申请索引。
     * @notice 如果索引超出范围，抛出错误。
     */
    modifier validIndex(bytes32 msghash, uint256 index) {
        require(
            index < signatureMap[msghash].length,
            "Multiple Signature : Message index is overflow!"
        );
        _;
    }

    // 将值保存到指定存储位置
    function saveValue(uint256 position, address value) internal {
        assembly {
            // assembly 代码块，用于直接与底层 EVM 交互
            sstore(position, value)
        }
    }

    // 从指定存储位置获取值
    function getValue(uint256 position) internal view returns (uint256 value) {
        assembly {
            value := sload(position)
        }
    }

    // 检查多签名是否有效
    function checkMultiSignature() internal view {
        require(
            getValue(multiSignaturePositon) != 0,
            "Multiple Signature : Message index is overflow!"
        );
    }

    // 初始化，确保只能执行一次
    function initialize(
        address[] memory owners,
        uint256 limitedSignNum
    ) public initializer {
        require(
            owners.length >= limitedSignNum,
            "Multiple Signature : Signature threshold is greater than owners' length!"
        );
        signatureOwners = owners;
        threshold = limitedSignNum;
        owner = msg.sender;
    }

    /**
     * @dev 修改所有者地址。
     * @param index 要转移的所有者在数组中的索引。
     * @param newOwner 新的所有者地址。
     * @notice 只有多签名所有者可以调用，且索引必须在有效范围内。
     */
    function modifyOwner(
        uint256 index,
        address newOwner
    ) public onlyOwner validCall {
        require(
            index < signatureOwners.length,
            "Multiple Signature : Owner index is overflow!"
        );
        signatureOwners[index] = newOwner;
    }

    /**
     * @dev 创建签名申请。
     * @param to 申请目标地址。
     * @return uint256 申请在对应消息哈希下的索引。
     */
    function createApplication(address to) external returns (uint256) {
        bytes32 msghash = keccak256(abi.encodePacked(msg.sender, to));
        uint256 length = signatureMap[msghash].length;
        signatureMap[msghash].push(signatureInfo(msg.sender, new address[](0)));
        return length;
    }

    /**
     * @dev 对签名申请进行签名。
     * @param msghash 申请消息哈希。
     * @notice 只有多签名所有者可以调用，且索引必须有效。
     */
    function signApplication(
        bytes32 msghash
    ) external onlyOwner validIndex(msghash, defaultIndex) {
        signatureMap[msghash][defaultIndex].signatures.addWhiteListAddress(
            msg.sender
        );
    }

    /**
     * @dev 撤销对签名申请的签名。
     * @param msghash 申请消息哈希。
     * @notice 只有多签名所有者可以调用，且索引必须有效。
     */
    function removeSignApplication(
        bytes32 msghash
    ) external onlyOwner validIndex(msghash, defaultIndex) {
        signatureMap[msghash][defaultIndex].signatures.removeWhiteListAddress(
            msg.sender
        );
    }
}
