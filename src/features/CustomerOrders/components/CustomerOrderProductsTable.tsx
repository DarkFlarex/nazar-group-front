import { Button, Popconfirm, Table, Typography } from "antd";
import { useState } from "react";

interface ProductOrder {
    key: string;
    number: string;
    article: string;
    nomenclature: string;
    date: string;
    quantity: string;
    unit: string;
    price: string;
}

const mockProductOrders: ProductOrder[] = [
    {
        key: "1",
        number: "1",
        article: "125",
        nomenclature: "Зеркало боковое (электр. в сборе) MB Sprinter",
        date: "2025-01-20",
        quantity: "1",
        unit: "шт",
        price: "3 200",
    },
    {
        key: "2",
        number: "2",
        article: "234",
        nomenclature: "Фара передняя левая MB Sprinter",
        date: "2025-01-22",
        quantity: "2",
        unit: "шт",
        price: "5 500",
    },
    {
        key: "3",
        number: "3",
        article: "342",
        nomenclature: "Ручка двери внутренняя MB Sprinter",
        date: "2025-01-25",
        quantity: "4",
        unit: "шт",
        price: "850",
    },
];

const CustomerOrderProductsTable = () => {
    const [dataSource, setDataSource] = useState<ProductOrder[]>(mockProductOrders);

    const handleDelete = (key: string) => {
        setDataSource((prev) => prev.filter((item) => item.key !== key));
    };

    const columns = [
        { title: "Номер", dataIndex: "number" },
        { title: "Артикул", dataIndex: "article" },
        { title: "Номенклатура", dataIndex: "nomenclature" },
        { title: "Дата", dataIndex: "date" },
        { title: "Количество", dataIndex: "quantity" },
        { title: "Ед. изм.", dataIndex: "unit" },
        { title: "Цена", dataIndex: "price" },
        {
            title: "Действия",
            key: "action",
            render: (_value: unknown, record: ProductOrder) => (
                <Popconfirm
                    title="Удалить товар из заказа?"
                    onConfirm={() => handleDelete(record.key)}
                >
                    <Button type="link" danger>
                        Удалить
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <>
            <Typography.Title level={3} style={{ marginBottom: 24 }}>
                Товары
            </Typography.Title>

            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey="key"
                pagination={{ pageSize: 5 }}
                bordered
            />
        </>
    );
};

export default CustomerOrderProductsTable;
