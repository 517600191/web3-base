# NFTTDAO2
# 合约信息：./cache
# deploy
npx hardhat run ./scripts/deploy/NFTTDAO2/proxy.js --network localhost
npx hardhat run ./scripts/deploy/NFTTDAO2/upgrade.js --network localhost

npx hardhat run ./scripts/deploy/NFTTDAO2/proxy.js --network sepolia
npx hardhat run ./scripts/deploy/NFTTDAO2/upgrade.js --network sepolia
# verify
npx hardhat verify --network sepolia 0x9ac50c71B5e6F3E2976d04Ca9E5b66E36860Ef5D


