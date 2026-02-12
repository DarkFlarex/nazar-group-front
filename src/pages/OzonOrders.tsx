import React, { useMemo, useState } from "react";
import {
  Card,
  Tabs,
  DatePicker,
  Table,
  Row,
  Col,
  Typography,
  Spin,
  Segmented,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useGetOzonOrdersQuery } from "../store/api/wbOrdersApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_TABS = [
  { key: "all", label: "Все" },
  { key: "processing", label: "В обработке" },
  { key: "delivered", label: "Выполнено" },
  { key: "cancelled", label: "Отклонено" },
];

const statusColor: Record<string, string> = {
  processing: "blue",
  delivered: "green",
  cancelled: "red",
};

const MOCK_ORDERS = [
  {
    order_id: "10001",
    order_number: "OZ-54321",
    created_at: "2026-02-01T10:30:00",
    sku: "5032779495645",
    quantity: 1,
    price: 2999,
    status: "processing",
  },
  {
    order_id: "10002",
    order_number: "OZ-54322",
    created_at: "2026-02-02T14:12:00",
    sku: "5032779495652",
    quantity: 2,
    price: 5490,
    status: "delivered",
  },
  {
    order_id: "10003",
    order_number: "OZ-54323",
    created_at: "2026-02-03T09:05:00",
    sku: "88005553533245",
    quantity: 1,
    price: 1990,
    status: "cancelled",
  },
  {
    order_id: "10004",
    order_number: "OZ-54324",
    created_at: "2026-02-04T18:40:00",
    sku: "5032781145187",
    quantity: 3,
    price: 8990,
    status: "processing",
  },
];

const OzonOrders = () => {
  const [view, setView] = useState<"table" | "cards">("table");
  const [status, setStatus] = useState("all");

  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(14, "day"),
    dayjs(),
  ]);

  const { data = MOCK_ORDERS, isLoading, error } = useGetOzonOrdersQuery();

  const orders = useMemo(() => data?.result || [], [data]);

  const columns = [
    {
      title: "№ заказа",
      dataIndex: "order_number",
      key: "order_number",
    },
    {
      title: "Дата",
      dataIndex: "created_at",
      render: (v: string) => dayjs(v).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "SKU",
      dataIndex: "sku",
    },
    {
      title: "Кол-во",
      dataIndex: "quantity",
    },
    {
      title: "Сумма",
      dataIndex: "price",
      render: (v: number) => `${v} ₽`,
    },
    {
      title: "Статус",
      dataIndex: "status",
      render: (v: string) => <Tag color={statusColor[v]}>{v}</Tag>,
    },
  ];

  if (error) {
    return <Text type="danger">Ошибка загрузки заказов</Text>;
  }

  return (
    <Card style={{ borderRadius: 12 }}>
      <Title level={4}>Заказы Ozon</Title>

      {/* Фильтры */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <RangePicker
            value={dates}
            onChange={(v) => v && setDates(v as any)}
          />
        </Col>

        <Col>
          <Segmented
            value={view}
            onChange={(v) => setView(v as any)}
            options={[
              { label: "Таблица", value: "table" },
              { label: "Карточки", value: "cards" },
            ]}
          />
        </Col>
      </Row>

      {/* Табы */}
      <Tabs activeKey={status} onChange={setStatus} items={STATUS_TABS} />

      {/* Контент */}
      {isLoading ? (
        <Spin tip="Загрузка заказов..." />
      ) : view === "table" ? (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="order_id"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1200 }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {orders.map((order: any) => (
            <Col xs={24} sm={12} md={8} lg={6} key={order.order_id}>
              <Card hoverable>
                <Text strong>№ заказа:</Text> {order.order_number}
                <br />
                <Text strong>Дата:</Text>{" "}
                {dayjs(order.created_at).format("DD.MM.YYYY")}
                <br />
                <Text strong>SKU:</Text> {order.sku}
                <br />
                <Text strong>Кол-во:</Text> {order.quantity}
                <br />
                <Text strong>Сумма:</Text> {order.price} ₽
                <br />
                <Tag color={statusColor[order.status]} style={{ marginTop: 8 }}>
                  {order.status}
                </Tag>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {orders.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text type="secondary">Всего заказов: {orders.length}</Text>
        </div>
      )}
    </Card>
  );
};

export default OzonOrders;
