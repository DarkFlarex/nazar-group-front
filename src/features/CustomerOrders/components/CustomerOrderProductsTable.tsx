import { Button, Popconfirm, Table, Typography } from "antd";
import CustomerOrderProductsForm from "./CustomerOrderProductsForm";
import { useGetgoodsQuery } from "../../../store/api/goodsApi";

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

const CustomerOrderProductsTable = () => {
  const { data: dataSource } = useGetgoodsQuery();

  const handleDelete = (data: any) => {
    console.log(data);
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
          onConfirm={() => handleDelete(record)}
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
      <CustomerOrderProductsForm />
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
