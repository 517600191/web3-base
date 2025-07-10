const hardhat = require('hardhat');
const { expect } = require('chai');
const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('PledgeChainLink Test', async function () {
    //初始化只能放变量
    const { ethers } = hardhat;

    //不需要清数据用
    beforeEach(async () => {

    })

    //需要清数据用 await loadFixture(init)
    const init = async () => {
        const [account1, account2] = await ethers.getSigners();  //获取账户
        const MTK = await ethers.getContractFactory('PledgeChainLink');     //获取合约
        const MTKContract = await MTK.deploy(); //部署合约
        await MTKContract.waitForDeployment(); //等待合约部署完成
        const MTKContractAddress = await MTKContract.getAddress(); //获取合约地址
        const ZeroAddress = ethers.ZeroAddress;  //0地址
        return { account1, account2, MTKContract, MTKContractAddress, ZeroAddress };
    }

    it('测试', async function () {
        var { MTKContract, account1, MTKContractAddress, ZeroAddress } = await loadFixture(init);

        console.log(account1, 333);

        // 执行存入操作
        const tx = await MTKContract.connect(account1).setPriceETHFeed("ETH / USD", "0x694AA1769357215DE4FAC081bf1f309aDC325306");
        await tx.wait();

        // console.log(11111, tx);

        const tx2 = await MTKContract.connect(account1).getChainlinkDataFeedLatestAnswer("ETH / USD");
        await tx2.wait();

        // console.log(tx2);
    });
})