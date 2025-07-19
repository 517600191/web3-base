import { NFTTDAO2Abi, NFTTDAO2Address } from "../../contractAbi/NFTTDAO2Info.js";

export const tableColumns = [
    {
        title: 'COLLECTION',
        dataIndex: 'name',
        key: 'name',
        render: function (value, record, index) {
        return (
          <span>
            <span>{record.name}</span>
            <span>({record.symbol})</span>
          </span>    
        )
      }
    },
    {
        title: 'FLOOR PRICE',
        dataIndex: 'FLOORPRICE',
        key: 'FLOORPRICE',
        sorter: (a, b) => a.floorPrice - b.floorPrice,
    },
    {
        title: 'CHANGES 24H',
        dataIndex: 'CHANGES',
        key: 'CHANGES',
        sorter: (a, b) => a.change - b.change,
    },
    {
        title: 'TOP OFFER',
        dataIndex: 'TOPOFFER',
        key: 'TOPOFFER',
        sorter: (a, b) => a.topOffer - b.topOffer,
    },
    {
        title: 'VOLUMES 24H',
        dataIndex: 'VOLUMES',
        key: 'VOLUMES',
        sorter: (a, b) => a.volumes - b.volumes,
    },
    {
        title: 'SALES 24H',
        dataIndex: 'SALES',
        key: 'SALES',
        sorter: (a, b) => a.sales - b.sales,
    },
    {
        title: 'OWNERS',
        dataIndex: 'OWNERS',
        key: 'OWNERS',
        sorter: (a, b) => a.owners - b.owners,
    },
    {
        title: 'SUPPLY',
        dataIndex: 'SUPPLY',
        key: 'SUPPLY',
        sorter: (a, b) => a.supply - b.supply,
    },
    {
        title: 'address',
        dataIndex: 'NFT',
        key: 'NFT',
    },
];

export const tableData = [
    {
        id: NFTTDAO2Address, collection: 'NFTTDAO2 (NFTTDAO2S)', floorPrice: "0.005", coinType: "ETH", change: "1%", topOffer: "-", volumes: "3.6M", sales: "7932", owners: "29687", supply: "NFTTDAO2",
        abi: NFTTDAO2Abi
    }
];