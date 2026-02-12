import { Button, Popconfirm, Table, Typography } from "antd";
import { useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  type CustomerOrders,
  mockCustomerOrders,
} from "../../../types/customerOrders";

interface TableOrder extends CustomerOrders {
  key: string;
}

const CustomerOrdersTable = () => {
  const [dataSource, setDataSource] = useState<TableOrder[]>(
    mockCustomerOrders.map((item) => ({
      ...item,
      key: item.guid,
    }))
  );

  const handleDelete = (key: string) => {
    setDataSource((prev) => prev.filter((item) => item.key !== key));
  };

  const columns: ColumnsType<TableOrder> = [
    { title: "Номер", dataIndex: "number" },
    { title: "Дата", dataIndex: "date" },
    { title: "Сумма", dataIndex: "amount" },
    { title: "Клиент", dataIndex: "client" },
    { title: "Текущее состояние", dataIndex: "currentState" },
    {
      title: "Действия",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Удалить заказ?"
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
        Заказы клиентов
      </Typography.Title>

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="key"
        pagination={{ pageSize: 100 }}
        bordered
      />
    </>
  );
};

export default CustomerOrdersTable;
