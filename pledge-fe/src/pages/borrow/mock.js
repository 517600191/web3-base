export const tableColumns = [
    {
        title: 'Underlying Asset',
        dataIndex: 'Asset',
        key: 'Asset',
    },
    {
        title: 'Fixed Rate (%)',
        dataIndex: 'Fixed',
        key: 'Fixed',
        sorter: (a, b) => a.Fixed - b.Fixed,
    },
    {
        title: 'Available To Lend',
        dataIndex: 'Lend',
        key: 'Lend',
        sorter: (a, b) => a.Lend - b.Lend,
    },
    {
        title: 'Settlement Date',
        dataIndex: 'Settlement',
        key: 'Settlement',
        sorter: (a, b) => a.Settlement - b.Settlement,
    },
    {
        title: 'Length',
        dataIndex: 'Length',
        key: 'Length',
        sorter: (a, b) => a.Length - b.Length,
    },
    {
        title: 'Margin Ratio (%)',
        dataIndex: 'Margin',
        key: 'Margin',
        sorter: (a, b) => a.Margin - b.Margin,
    },
    {
        title: 'Collateralization Ratio (%)',
        dataIndex: 'Collateralization',
        key: 'Collateralization',
        sorter: (a, b) => a.Collateralization - b.Collateralization,
    },
];

export const tableData = [
    { Asset: 'BTC', Fixed: 10, Lend: 90, Settlement: "2025-10-01", Length: 25, Margin: 20, Collateralization: 10 },
    { Asset: 'ETH', Fixed: 20, Lend: 80, Settlement: "2025-10-01", Length: 25, Margin: 20, Collateralization: 10 },
    { Asset: 'sepolia', Fixed: 30, Lend: 70, Settlement: "2025-10-01", Length: 25, Margin: 20, Collateralization: 10 },
    { Asset: 'sepolia2', Fixed: 40, Lend: 60, Settlement: "2025-10-01", Length: 25, Margin: 20, Collateralization: 10 },
    { Asset: 'sepolia3', Fixed: 50, Lend: 50, Settlement: "2025-10-01", Length: 25, Margin: 20, Collateralization: 10 },
];