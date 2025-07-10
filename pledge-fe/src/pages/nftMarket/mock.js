import { NFTTDAO2Abi, NFTTDAO2Address } from "../../contractAbi/NFTTDAO2Info.js";

export const tableColumns = [
    {
        title: 'COLLECTION',
        dataIndex: 'collection',
        key: 'collection',
    },
    {
        title: 'FLOOR PRICE',
        dataIndex: 'floorPrice',
        key: 'floorPrice',
        sorter: (a, b) => a.floorPrice - b.floorPrice,
        render: function (value, record, index) {
            return `${record.floorPrice} ${record.coinType}`;
        }
    },
    {
        title: 'CHANGES 24H',
        dataIndex: 'change',
        key: 'change',
        sorter: (a, b) => a.change - b.change,
    },
    {
        title: 'TOP OFFER',
        dataIndex: 'topOffer',
        key: 'topOffer',
        sorter: (a, b) => a.topOffer - b.topOffer,
    },
    {
        title: 'VOLUMES 24H',
        dataIndex: 'volumes',
        key: 'volumes',
        sorter: (a, b) => a.volumes - b.volumes,
    },
    {
        title: 'SALES 24H',
        dataIndex: 'sales',
        key: 'sales',
        sorter: (a, b) => a.sales - b.sales,
    },
    {
        title: 'OWNERS',
        dataIndex: 'owners',
        key: 'owners',
        sorter: (a, b) => a.owners - b.owners,
    },
    {
        title: 'SUPPLY',
        dataIndex: 'supply',
        key: 'supply',
        sorter: (a, b) => a.supply - b.supply,
    },
];

export const tableData = [
    {
        id: NFTTDAO2Address, collection: 'NFTTDAO2 (NFTTDAO2S)', floorPrice: "0.005", coinType: "ETH", change: "1%", topOffer: "-", volumes: "3.6M", sales: "7932", owners: "29687", supply: "NFTTDAO2",
        abi: NFTTDAO2Abi
    }
];