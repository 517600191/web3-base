# PledgePool
# 合约信息：./cache
# deploy
npx hardhat run ./scripts/deploy/PledgePool/deploy.js --network localhost

npx hardhat run ./scripts/deploy/PledgePool/deploy.js --network sepolia

# verify
npx hardhat verify --network sepolia 0x6D3dFeAa1bD18e0f4B7593Db4FF6E7F595B283d9 "0x937d86847fFD2C295f56B64117bBc29DC71C8Ec3" "0x937d86847fFD2C295f56B64117bBc29DC71C8Ec3" "0x937d86847fFD2C295f56B64117bBc29DC71C8Ec3"



