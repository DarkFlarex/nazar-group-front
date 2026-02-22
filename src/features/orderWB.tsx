import { Table, Tag, Button, Space, Popconfirm } from "antd";
import { useGetWBOrdersQuery } from "../store/api/wbOrdersApi";

const initialOrders = [
  {
    id: 13833711,
    article: "one-ring-7548",
    orderUid: "165918930_629fbc924b984618a44354475ca58675",
    price: 1014,
    finalPrice: 1014,
    deliveryType: "fbs",
    ddate: "17.05.2024",
    sellerDate: "02.06.2025",
    status: "new",
    comment: "Упакуйте в плёнку, пожалуйста",
    address:
      "Челябинская область, г. Челябинск, 51-я улица Арабкира, д. 10А, кв. 42",
    skus: ["6665956397512"],
    offices: ["Калуга"],
    isB2b: true,
  },
];

const statusTag: any = {
  new: <Tag color="blue">Новый</Tag>,
  processed: <Tag color="green">Обработан</Tag>,
  rejected: <Tag color="red">Отклонён</Tag>,
};

const OrdersPage = () => {
  const { data: orders = initialOrders } = useGetWBOrdersQuery();

  const changeStatus = (id: number, status: string) => {
    console.log(`Меняем статус заказа ${id} на ${status}`);
    // Тут будет вызов API для изменения статуса
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <b>#{id}</b>,
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: string) => statusTag[status],
    },
    {
      title: "Доставка",
      dataIndex: "deliveryType",
      key: "deliveryType",
      render: (type: string) => <Tag>{type.toUpperCase()}</Tag>,
    },
    {
      title: "B2B",
      dataIndex: "isB2b",
      key: "isB2b",
      render: (isB2b: boolean) =>
        isB2b ? <Tag color="purple">B2B</Tag> : null,
    },
    {
      title: "Артикул",
      dataIndex: "article",
      key: "article",
    },
    {
      title: "Цена",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (price: number) => `${price} ₽`,
    },
    {
      title: "Дата доставки",
      dataIndex: "ddate",
      key: "ddate",
    },
    {
      title: "SKU",
      dataIndex: "skus",
      key: "skus",
      render: (skus: string[]) => skus.join(", "),
    },
    {
      title: "Склад",
      dataIndex: "offices",
      key: "offices",
      render: (offices: string[]) => offices.join(", "),
    },
    {
      title: "Адрес / Комментарий",
      dataIndex: "address",
      key: "address",
      render: (_: any, record: any) => (
        <div style={{ fontSize: 12, color: "#555" }}>
          📍 {record.address}
          {record.comment && (
            <>
              <br />
              💬 {record.comment}
            </>
          )}
        </div>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Popconfirm
            title="Обработать заказ?"
            okText="Да"
            cancelText="Отмена"
            onConfirm={() => changeStatus(record.id, "processed")}
            disabled={record.status !== "new"}
          >
            <Button
              type="primary"
              size="small"
              disabled={record.status !== "new"}
            >
              Обработать
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Отклонить заказ?"
            okText="Отклонить"
            cancelText="Отмена"
            onConfirm={() => changeStatus(record.id, "rejected")}
            disabled={record.status !== "new"}
          >
            <Button danger size="small" disabled={record.status !== "new"}>
              Отклонить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <h2>📦 Заказы</h2>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 15 }}
      />
    </div>
  );
};

export default OrdersPage;
