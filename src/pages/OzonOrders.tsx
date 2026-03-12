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
  Input,
  Select,
  Space,
  Statistic,
  Empty,
  Button,
  Divider,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetOzonOrdersQuery } from "../store/api/wbOrdersApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_TABS = [
  { key: "all", label: "Все" },
  { key: "awaiting_packaging", label: "Ожидает упаковки" },
  { key: "awaiting_deliver", label: "Ожидает отгрузки" },
  { key: "delivering", label: "Доставляется" },
  { key: "delivered", label: "Доставлен" },
  { key: "cancelled", label: "Отменён" },
];

const statusColor: Record<string, string> = {
  awaiting_packaging: "orange",
  awaiting_deliver: "gold",
  delivering: "blue",
  delivered: "green",
  cancelled: "red",
};

const statusLabel: Record<string, string> = {
  awaiting_packaging: "Ожидает упаковки",
  awaiting_deliver: "Ожидает отгрузки",
  delivering: "Доставляется",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  border: "1px solid #f0f0f0",
};

const OzonOrders = () => {
  const [view, setView] = useState<"table" | "cards">("table");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string | undefined>();
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<
    string | undefined
  >();

  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(14, "day"),
    dayjs(),
  ]);

  const queryParams = useMemo(
    () => ({
      from: dates?.[0]?.startOf("day").toISOString(),
      to: dates?.[1]?.endOf("day").toISOString(),
      limit: 200,
      offset: 0,
      sort_by: "created_at",
      dir: "DESC" as const,
    }),
    [dates]
  );

  const { data, isLoading, error, refetch, isFetching } =
    useGetOzonOrdersQuery(queryParams);

  const orders = useMemo(() => {
    const postings = data?.postings || [];

    const mapped = postings.map((p: any) => {
      const financialProducts = p.financial_data?.products || [];
      const totalPrice = financialProducts.reduce(
        (sum: number, item: any) => sum + Number(item.price || 0),
        0
      );
      const totalCustomerPrice = financialProducts.reduce(
        (sum: number, item: any) => sum + Number(item.customer_price || 0),
        0
      );
      const totalQuantity = (p.products || []).reduce(
        (sum: number, item: any) => sum + Number(item.quantity || 0),
        0
      );

      return {
        ...p,
        key: p.posting_number,
        created_at: p.in_process_at || p.created_at,
        warehouse:
          p.delivery_method?.warehouse ||
          p.delivery_method?.warehouse_id ||
          "—",
        delivery_type: p.analytics_data?.delivery_type || "—",
        total_price: totalPrice,
        total_customer_price: totalCustomerPrice,
        total_quantity: totalQuantity,
        products_text: (p.products || [])
          .map((prod: any) => `${prod.name || ""} ${prod.sku || ""}`)
          .join(" ")
          .toLowerCase(),
      };
    });

    let result = mapped;

    if (status !== "all") {
      result = result.filter((o: any) => o.status === status);
    }

    if (warehouseFilter) {
      result = result.filter((o: any) => o.warehouse === warehouseFilter);
    }

    if (deliveryTypeFilter) {
      result = result.filter(
        (o: any) => o.delivery_type === deliveryTypeFilter
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((o: any) => {
        return (
          o.posting_number?.toLowerCase().includes(q) ||
          o.order_number?.toLowerCase().includes(q) ||
          o.warehouse?.toLowerCase().includes(q) ||
          o.products_text?.includes(q) ||
          (o.products || []).some(
            (prod: any) =>
              prod.name?.toLowerCase().includes(q) ||
              String(prod.sku || "")
                .toLowerCase()
                .includes(q) ||
              String(prod.offer_id || "")
                .toLowerCase()
                .includes(q)
          )
        );
      });
    }

    return result.sort(
      (a: any, b: any) =>
        dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf()
    );
  }, [data, status, warehouseFilter, deliveryTypeFilter, search]);

  const warehouseOptions = useMemo(() => {
    const postings = data?.postings || [];
    const list = Array.from(
      new Set(
        postings
          .map(
            (p: any) =>
              p.delivery_method?.warehouse || p.delivery_method?.warehouse_id
          )
          .filter(Boolean)
      )
    );
    return list.map((item) => ({ label: item, value: item }));
  }, [data]);

  const deliveryTypeOptions = useMemo(() => {
    const postings = data?.postings || [];
    const list = Array.from(
      new Set(
        postings
          .map((p: any) => p.analytics_data?.delivery_type)
          .filter(Boolean)
      )
    );
    return list.map((item) => ({ label: item, value: item }));
  }, [data]);

  const stats = useMemo(() => {
    const base = {
      total: orders.length,
      awaiting_packaging: 0,
      awaiting_deliver: 0,
      delivering: 0,
      delivered: 0,
      cancelled: 0,
      revenue: 0,
    };

    for (const item of orders) {
      if (item.status in base) {
        (base as any)[item.status] += 1;
      }
      base.revenue += Number(item.total_customer_price || 0);
    }

    return base;
  }, [orders]);

  const columns = [
    {
      title: "Отправление",
      dataIndex: "posting_number",
      key: "posting_number",
      width: 170,
      fixed: "left" as const,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: "Заказ",
      dataIndex: "order_number",
      key: "order_number",
      width: 140,
    },
    {
      title: "Дата",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      sorter: (a: any, b: any) =>
        dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf(),
      defaultSortOrder: "descend" as const,
      render: (v: string) => (v ? dayjs(v).format("DD.MM.YYYY HH:mm") : "—"),
    },
    {
      title: "Склад",
      dataIndex: "warehouse",
      key: "warehouse",
      width: 180,
      ellipsis: true,
    },
    {
      title: "Товары",
      key: "products",
      width: 380,
      render: (_: unknown, record: any) => (
        <div>
          {(record.products || []).map((prod: any, index: number) => (
            <div
              key={`${prod.sku}-${index}`}
              style={{
                padding: "4px 0",
                borderBottom:
                  index !== record.products.length - 1
                    ? "1px dashed #f0f0f0"
                    : "none",
              }}
            >
              <div style={{ fontWeight: 500 }}>
                {prod.name || "Без названия"}
              </div>
              <div style={{ color: "#888", fontSize: 12 }}>
                SKU: {prod.sku || "—"} • {prod.quantity || 0} шт.
                {prod.offer_id ? ` • Offer ID: ${prod.offer_id}` : ""}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Кол-во",
      dataIndex: "total_quantity",
      key: "total_quantity",
      width: 90,
    },
    {
      title: "Сумма",
      dataIndex: "total_price",
      key: "total_price",
      width: 120,
      render: (v: number) => `${Number(v || 0).toLocaleString()} ₽`,
    },
    {
      title: "Оплатил клиент",
      dataIndex: "total_customer_price",
      key: "total_customer_price",
      width: 150,
      render: (v: number) => `${Number(v || 0).toLocaleString()} ₽`,
    },
    {
      title: "Тип доставки",
      dataIndex: "delivery_type",
      key: "delivery_type",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: 170,
      render: (v: string) => (
        <Tag color={statusColor[v] || "default"}>
          {statusLabel[v] || v || "—"}
        </Tag>
      ),
    },
  ];

  if (error) {
    return (
      <Card style={cardStyle}>
        <Text type="danger">Ошибка загрузки заказов Ozon</Text>
      </Card>
    );
  }

  return (
    <div>
      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
        style={{ marginBottom: 8 }}
      >
        <Col xs={24} md={12}>
          <Title level={3} style={{ margin: 0 }}>
            Заказы Ozon
          </Title>
          <Text type="secondary">
            Управление FBS-отправлениями, фильтрация и просмотр деталей
          </Text>
        </Col>

        <Col xs={24} md={12} style={{ textAlign: "right" }}>
          <Space wrap>
            <Segmented
              value={view}
              onChange={(v) => setView(v as "table" | "cards")}
              options={[
                {
                  label: (
                    <Space size={4}>
                      <BarsOutlined />
                      Таблица
                    </Space>
                  ),
                  value: "table",
                },
                {
                  label: (
                    <Space size={4}>
                      <AppstoreOutlined />
                      Карточки
                    </Space>
                  ),
                  value: "cards",
                },
              ]}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isFetching}
            >
              Обновить
            </Button>
          </Space>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="Всего" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="Упаковка" value={stats.awaiting_packaging} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="Отгрузка" value={stats.awaiting_deliver} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="В пути" value={stats.delivering} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="Доставлено" value={stats.delivered} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic
              title="Оплачено"
              value={stats.revenue}
              formatter={(v) => `${Number(v || 0).toLocaleString()} ₽`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12} lg={8}>
          <Input
            allowClear
            size="large"
            placeholder="Поиск по отправлению, заказу, SKU, товару..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <RangePicker
            size="large"
            style={{ width: "100%" }}
            value={dates}
            onChange={(v) => v && setDates(v as [dayjs.Dayjs, dayjs.Dayjs])}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={5}>
          <Select
            allowClear
            size="large"
            style={{ width: "100%" }}
            placeholder="Склад"
            value={warehouseFilter}
            onChange={setWarehouseFilter}
            options={warehouseOptions}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={5}>
          <Select
            allowClear
            size="large"
            style={{ width: "100%" }}
            placeholder="Тип доставки"
            value={deliveryTypeFilter}
            onChange={setDeliveryTypeFilter}
            options={deliveryTypeOptions}
          />
        </Col>
      </Row>

      <Tabs activeKey={status} onChange={setStatus} items={STATUS_TABS} />

      {isLoading ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <Spin size="large" tip="Загрузка заказов..." />
        </div>
      ) : orders.length === 0 ? (
        <Empty description="Заказы не найдены" />
      ) : view === "table" ? (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="posting_number"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: [20, 50, 100],
            showTotal: (total) => `Всего: ${total}`,
          }}
          scroll={{ x: 1700 }}
          bordered
          size="middle"
        />
      ) : (
        <Row gutter={[16, 16]}>
          {orders.map((order: any) => (
            <Col
              xs={24}
              sm={12}
              md={12}
              lg={8}
              xl={6}
              key={order.posting_number}
            >
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  height: "100%",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
                }}
              >
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary">Отправление</Text>
                    <div style={{ fontWeight: 700 }}>
                      {order.posting_number}
                    </div>
                  </div>

                  <div>
                    <Text type="secondary">Заказ</Text>
                    <div>{order.order_number || "—"}</div>
                  </div>

                  <div>
                    <Text type="secondary">Дата</Text>
                    <div>
                      {order.created_at
                        ? dayjs(order.created_at).format("DD.MM.YYYY HH:mm")
                        : "—"}
                    </div>
                  </div>

                  <div>
                    <Text type="secondary">Склад</Text>
                    <div>{order.warehouse || "—"}</div>
                  </div>

                  <div>
                    <Text type="secondary">Товары</Text>
                    <div style={{ marginTop: 6 }}>
                      {(order.products || []).map(
                        (prod: any, index: number) => (
                          <div
                            key={`${prod.sku}-${index}`}
                            style={{
                              padding: "6px 0",
                              borderBottom:
                                index !== order.products.length - 1
                                  ? "1px dashed #f0f0f0"
                                  : "none",
                            }}
                          >
                            <div style={{ fontWeight: 500 }}>
                              {prod.name || "Без названия"}
                            </div>
                            <div style={{ color: "#888", fontSize: 12 }}>
                              SKU: {prod.sku || "—"} • {prod.quantity || 0} шт.
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <Divider style={{ margin: "8px 0" }} />

                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <Text type="secondary">Сумма</Text>
                      <div style={{ fontWeight: 600 }}>
                        {Number(order.total_price || 0).toLocaleString()} ₽
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Оплатил</Text>
                      <div style={{ fontWeight: 600 }}>
                        {Number(
                          order.total_customer_price || 0
                        ).toLocaleString()}{" "}
                        ₽
                      </div>
                    </Col>
                  </Row>

                  <div>
                    <Text type="secondary">Тип доставки</Text>
                    <div>{order.delivery_type || "—"}</div>
                  </div>

                  <div style={{ marginTop: 6 }}>
                    <Tag color={statusColor[order.status] || "default"}>
                      {statusLabel[order.status] || order.status || "—"}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {orders.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            Всего отправлений после фильтрации: {orders.length}
          </Text>
        </div>
      )}
    </div>
  );
};

export default OzonOrders;
