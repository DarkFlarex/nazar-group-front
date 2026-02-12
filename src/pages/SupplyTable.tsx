import React from "react";
import { Table, Tag, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";

const suppliesData = {
  next: 13833711,
  supplies: [
    {
      id: "WB-GI-1234567",
      done: true,
      createdAt: "2022-05-04T07:56:29Z",
      closedAt: "2022-05-04T07:56:29Z",
      scanDt: "2022-05-04T07:56:29Z",
      name: "Тестовая поставка",
      cargoType: 0,
      crossBorderType: 1,
      destinationOfficeId: 123,
    },
  ],
};

const SupplyTable = () => {
  const navigate = useNavigate();
  const handleAddOrder = (record: any) => {
    navigate("/orders/orderWb", {
      state: record,
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Выполнено",
      dataIndex: "done",
      key: "done",
      render: (done: any) =>
        done ? <Tag color="green">Да</Tag> : <Tag color="red">Нет</Tag>,
    },
    {
      title: "Дата создания",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: any) => new Date(date).toLocaleString(),
    },
    {
      title: "Дата закрытия",
      dataIndex: "closedAt",
      key: "closedAt",
      render: (date: any) => new Date(date).toLocaleString(),
    },
    {
      title: "Дата сканирования",
      dataIndex: "scanDt",
      key: "scanDt",
      render: (date: any) => new Date(date).toLocaleString(),
    },
    {
      title: "Тип груза",
      dataIndex: "cargoType",
      key: "cargoType",
    },
    {
      title: "Тип пересечения границы",
      dataIndex: "crossBorderType",
      key: "crossBorderType",
    },
    {
      title: "ID офиса назначения",
      dataIndex: "destinationOfficeId",
      key: "destinationOfficeId",
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button type="primary" onClick={() => handleAddOrder(record)}>
            Добавить заказ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Список поставок</h2>
      <Table dataSource={suppliesData.supplies} columns={columns} rowKey="id" />
    </div>
  );
};

export default SupplyTable;
