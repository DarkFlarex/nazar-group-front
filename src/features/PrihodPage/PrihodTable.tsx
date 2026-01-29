import type { ColumnsType } from "antd/es/table";
import { Table } from "antd";

interface PrihodItem {
    key: string;
    product: string;
    quantity: number;
    price: number;
    total: number;
    priceKgs: number;
    totalKgs: number;
}

interface Props {
    data: PrihodItem[];
}

const columns: ColumnsType<PrihodItem> = [
    {
        title: "Товар",
        dataIndex: "product",
    },
    {
        title: "Количество",
        dataIndex: "quantity",
    },
    {
        title: "Цена",
        dataIndex: "price",
        render: (value) => `${value.toLocaleString()} ₽`,
    },
    {
        title: "Сумма",
        dataIndex: "total",
        render: (value) => `${value.toLocaleString()} ₽`,
    },
    {
        title: "Цена, сом",
        dataIndex: "priceKgs",
        render: (value) => `${value.toLocaleString()} сом`,
    },
    {
        title: "Сумма, сом",
        dataIndex: "totalKgs",
        render: (value) => `${value.toLocaleString()} сом`,
    },
];

const PrihodTable: React.FC<Props> = ({ data }) => {
    return (
        <Table
            dataSource={data}
            columns={columns}
            rowKey="key"
            pagination={false}
            bordered
        />
    );
};

export default PrihodTable;
