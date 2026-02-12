import React from "react";
import { Table, Tag, Collapse } from "antd";
import { useGetOzonPostQuery } from "../store/api/wbOrdersApi";

const initPostingsData = {
  result: {
    postings: [
      {
        posting_number: "05708065-0029-1",
        order_id: 680420041,
        order_number: "05708065-0029",
        pickup_code_verified_at: "2025-01-17T10:59:26.614Z",
        status: "awaiting_deliver",
        substatus: "posting_awaiting_passport_data",
        delivery_method: {
          id: 21321684811000,
          name: "Ozon Логистика самостоятельно, Красногорск",
          warehouse_id: 21321684811000,
          warehouse: "Стим Тойс Нахабино",
          tpl_provider_id: 24,
          tpl_provider: "Ozon Логистика",
        },
        tracking_number: "",
        tpl_integration_type: "ozon",
        in_process_at: "2022-05-13T07:07:32Z",
        shipment_date: "2022-05-13T10:00:00Z",
        shipment_date_without_delay: "2022-05-13T10:00:00Z",
        delivering_date: null,
        products: [
          {
            price: "1390.000000",
            currency_code: "RUB",
            name: " Электронный конструктор PinLab Позитроник",
            sku: 358924380,
            quantity: 1,
          },
        ],
      },
    ],
    has_next: true,
  },
};

const { Panel } = Collapse;

const PostingsTable = () => {
  const columns = [
    {
      title: "Номер постинга",
      dataIndex: "posting_number",
      key: "posting_number",
    },
    {
      title: "Номер заказа",
      dataIndex: "order_number",
      key: "order_number",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: any) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: "Подстатус",
      dataIndex: "substatus",
      key: "substatus",
    },
    {
      title: "Метод доставки",
      dataIndex: ["delivery_method", "name"],
      key: "delivery_method",
    },
    {
      title: "Дата в процессе",
      dataIndex: "in_process_at",
      key: "in_process_at",
      render: (date: any) => new Date(date).toLocaleString(),
    },
    {
      title: "Дата отгрузки",
      dataIndex: "shipment_date",
      key: "shipment_date",
      render: (date: any) => new Date(date).toLocaleString(),
    },
  ];

  const { data: postingsData = initPostingsData } = useGetOzonPostQuery();

  const expandedRowRender = (record: any) => (
    <Collapse>
      <Panel header="Продукты" key="1">
        {record.products.map((product: any, idx: any) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <b>{product.name}</b> - {product.quantity} шт. по {product.price}{" "}
            {product.currency_code}
          </div>
        ))}
      </Panel>
    </Collapse>
  );

  return (
    <div style={{ padding: 24 }}>
      <h2>Список поставок 2</h2>
      <Table
        dataSource={postingsData.result.postings}
        columns={columns}
        pagination={{ pageSize: 100 }}
        expandable={{ expandedRowRender }}
      />
    </div>
  );
};

export default PostingsTable;
