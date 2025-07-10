# DebtToken
# 合约信息：./cache
# deploy
npx hardhat run ./scripts/deploy/DebtToken/deploy.js --network localhost

npx hardhat run ./scripts/deploy/DebtToken/deploy.js --network sepolia

# verify
npx hardhat verify --network sepolia 0x9258AA209d7B8A2aDCDe2446705F3AFD3fB60c79 "Debt" "DebtToken"



