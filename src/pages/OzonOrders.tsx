import { useMemo, useState } from "react";
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
  { key: "awaiting_packaging", label: "Ожидает упаковки" },
  { key: "delivering", label: "Доставляется" },
  { key: "delivered", label: "Доставлен" },
  { key: "cancelled", label: "Отменён" },
];

const statusColor: Record<string, string> = {
  awaiting_packaging: "orange",
  delivering: "blue",
  delivered: "green",
  cancelled: "red",
};

const OzonOrders = () => {
  const [view, setView] = useState<"table" | "cards">("table");
  const [status, setStatus] = useState("all");

  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(14, "day"),
    dayjs(),
  ]);

  const { data, isLoading, error } = useGetOzonOrdersQuery();

  // ✅ Нормализация данных
  const orders = useMemo(() => {
    const postings = data?.postings || [];

    const mapped = postings.map((p: any) => {
      const firstProduct = p.products?.[0];
      const firstFinancial = p.financial_data?.products?.[0];

      return {
        ...p,
        key: p.posting_number,
        created_at: p.in_process_at,
        sku: firstProduct?.sku,
        product_name: firstProduct?.name,
        quantity: firstProduct?.quantity,
        price: firstFinancial?.price,
        customer_price: firstFinancial?.customer_price,
        warehouse: p.delivery_method?.warehouse,
        delivery_type: p.analytics_data?.delivery_type,
      };
    });

    if (status === "all") return mapped;

    return mapped.filter((o: any) => o.status === status);
  }, [data, status]);

  const columns = [
    {
      title: "Отправление",
      dataIndex: "posting_number",
      key: "posting_number",
    },
    {
      title: "Заказ",
      dataIndex: "order_number",
      key: "order_number",
    },
    {
      title: "Дата обработки",
      dataIndex: "created_at",
      render: (v: string) => dayjs(v).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Склад",
      dataIndex: "warehouse",
    },
    {
      title: "Проданные товары",
      key: "products",
      ellipsis: true,
      render: (_: unknown, record: any) => (
        <div>
          {(record.products || []).map((prod: any) => (
            <div key={prod.sku}>
              {prod.name} — {prod.quantity} шт.
              {prod.sku ? ` (SKU: ${prod.sku})` : ""}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Цена",
      dataIndex: "price",
      render: (v: number) => `${v} ₽`,
    },
    {
      title: "Оплатил клиент",
      dataIndex: "customer_price",
      render: (v: number) => `${v} ₽`,
    },
    {
      title: "Тип доставки",
      dataIndex: "delivery_type",
    },
    {
      title: "Статус",
      dataIndex: "status",
      render: (v: string) => <Tag color={statusColor[v] || "default"}>{v}</Tag>,
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

      {/* Табы статусов */}
      <Tabs activeKey={status} onChange={setStatus} items={STATUS_TABS} />

      {/* Контент */}
      {isLoading ? (
        <Spin tip="Загрузка заказов..." />
      ) : view === "table" ? (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="posting_number"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1400 }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {orders.map((order: any) => (
            <Col xs={24} sm={12} md={8} lg={6} key={order.posting_number}>
              <Card hoverable>
                <Text strong>Отправление:</Text> {order.posting_number}
                <br />
                <Text strong>Заказ:</Text> {order.order_number}
                <br />
                <Text strong>Дата:</Text>{" "}
                {dayjs(order.created_at).format("DD.MM.YYYY HH:mm")}
                <br />
                <Text strong>Проданные товары:</Text>
                <div style={{ marginTop: 4, marginBottom: 8 }}>
                  {(order.products || []).map((prod: any) => (
                    <div key={prod.sku}>
                      {prod.name} — {prod.quantity} шт.
                      {prod.sku ? ` (SKU: ${prod.sku})` : ""}
                    </div>
                  ))}
                </div>
                <Text strong>Цена:</Text> {order.price} ₽
                <br />
                <Text strong>Клиент оплатил:</Text> {order.customer_price} ₽
                <br />
                <Tag
                  color={statusColor[order.status] || "default"}
                  style={{ marginTop: 8 }}
                >
                  {order.status}
                </Tag>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {orders.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text type="secondary">Всего отправлений: {orders.length}</Text>
        </div>
      )}
    </Card>
  );
};

export default OzonOrders;
