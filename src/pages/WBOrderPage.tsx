import React, { useMemo, useState } from "react";
import {
  Table,
  Typography,
  Spin,
  Button,
  DatePicker,
  Tabs,
  Card,
  Row,
  Col,
  Segmented,
  Tag,
  Input,
  Space,
  Statistic,
  Empty,
  Modal,
  Divider,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
  InfoCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useGetWBOrderMetadataMutation,
  useGetWBOrdersNewQuery,
  useGetWBOrdersQuery,
  useGetWBOrdersStatusMutation,
} from "../store/api/wbOrdersApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type ViewMode = "table" | "cards";
type OrderStatus = "in_process" | "done" | "rejected";
type OrdersTab = "all" | "new";
type StatusFilter = "all" | OrderStatus;

interface Order {
  id: number;
  createdAt: string;
  skus: string[];
  finalPrice: number;
  status?: OrderStatus;
  supplierStatus?: string;
  wbStatus?: string;
}

const STATUS_LABELS: any = {
  in_process: "В обработке",
  done: "Выполнено",
  rejected: "Отклонено",
};

const STATUS_COLORS: any = {
  in_process: "orange",
  done: "green",
  rejected: "red",
};

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  border: "1px solid #f0f0f0",
};

const WbOrdersPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(14, "day"),
    dayjs(),
  ]);

  const [ordersTab, setOrdersTab] = useState<OrdersTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const [statusesMap, setStatusesMap] = useState<Record<number, OrderStatus>>(
    {}
  );

  const [metadataModal, setMetadataModal] = useState<{
    open: boolean;
    orderId?: number;
    data?: any;
  }>({
    open: false,
    orderId: undefined,
    data: undefined,
  });

  const ordersQueryParams = useMemo(() => {
    const [start, end] = dateRange;

    return {
      startDate: start.startOf("day").toISOString(),
      endDate: end.endOf("day").toISOString(),
      limit: 100,
    };
  }, [dateRange]);

  const [getStatuses, { isLoading: isStatusLoading }] =
    useGetWBOrdersStatusMutation();

  const [getOrderMetadata, { isLoading: isMetadataLoading }] =
    useGetWBOrderMetadataMutation();

  const {
    data = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetWBOrdersQuery(ordersQueryParams);

  const {
    data: newOrders = [],
    isLoading: isLoadingNew,
    isError: isErrorNew,
    refetch: refetchNew,
    isFetching: isFetchingNew,
  } = useGetWBOrdersNewQuery();

  const mapOrderStatus = (
    supplierStatus?: string,
    wbStatus?: string
  ): OrderStatus => {
    if (wbStatus === "declined_by_client") {
      return "rejected";
    }

    if (supplierStatus === "complete") {
      return "done";
    }

    return "in_process";
  };

  const handleCheckStatuses = async () => {
    try {
      const activeOrders = ordersTab === "all" ? data : newOrders;
      const orderIds = activeOrders.map((o: any) => o.id);

      if (!orderIds.length) return;

      const response = await getStatuses({
        orders: orderIds,
      }).unwrap();

      const newStatuses: Record<number, OrderStatus> = {};

      response.forEach((item: any) => {
        newStatuses[item.id] = mapOrderStatus(
          item.supplierStatus,
          item.wbStatus
        );
      });

      setStatusesMap((prev) => ({
        ...prev,
        ...newStatuses,
      }));
    } catch (error) {
      console.error("Ошибка при получении статусов", error);
    }
  };

  const handleGetMetadata = async (orderId: number) => {
    try {
      const metadata = await getOrderMetadata({ orderId }).unwrap();

      setMetadataModal({
        open: true,
        orderId,
        data: metadata,
      });
    } catch (error) {
      console.error("Ошибка при получении метаданных", error);
    }
  };

  const preparedOrders = useMemo(() => {
    const source = ordersTab === "all" ? data : newOrders;

    return source.map((order: Order) => {
      const resolvedStatus =
        statusesMap[order.id] ??
        order.status ??
        mapOrderStatus(order.supplierStatus, order.wbStatus);

      return {
        ...order,
        status: resolvedStatus,
        quantity: Array.isArray(order.skus) ? order.skus.length : 0,
        skusText: Array.isArray(order.skus)
          ? order.skus.join(", ").toLowerCase()
          : "",
      };
    });
  }, [data, newOrders, ordersTab, statusesMap]);

  const filteredOrders = useMemo(() => {
    const [start, end] = dateRange;

    let result = preparedOrders.filter((order: any) => {
      const orderDate = dayjs(order.createdAt);

      return (
        (orderDate.isAfter(start.startOf("day")) &&
          orderDate.isBefore(end.endOf("day"))) ||
        orderDate.isSame(start.startOf("day")) ||
        orderDate.isSame(end.endOf("day"))
      );
    });

    if (statusFilter !== "all") {
      result = result.filter((order: any) => order.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((order: any) => {
        return (
          String(order.id).includes(q) ||
          order.skusText.includes(q) ||
          String(order.finalPrice ?? "").includes(q)
        );
      });
    }

    return result.sort(
      (a: any, b: any) =>
        dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
    );
  }, [preparedOrders, dateRange, statusFilter, search]);

  const stats = useMemo(() => {
    const base = {
      total: filteredOrders.length,
      in_process: 0,
      done: 0,
      rejected: 0,
      totalAmount: 0,
    };

    filteredOrders.forEach((order: any) => {
      if (order.status === "in_process") base.in_process += 1;
      if (order.status === "done") base.done += 1;
      if (order.status === "rejected") base.rejected += 1;

      base.totalAmount += Number(order.finalPrice || 0);
    });

    return base;
  }, [filteredOrders]);

  const columns = [
    {
      title: "ID заказа",
      dataIndex: "id",
      key: "id",
      width: 120,
      fixed: "left" as const,
      render: (value: number) => <Text strong>{value}</Text>,
    },
    {
      title: "Дата",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      sorter: (a: any, b: any) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      defaultSortOrder: "descend" as const,
      render: (value: string) =>
        value ? dayjs(value).format("DD.MM.YYYY HH:mm") : "—",
    },
    {
      title: "SKU",
      dataIndex: "skus",
      key: "skus",
      width: 320,
      render: (skus: string[]) =>
        skus?.length ? (
          <div>
            {skus.map((sku, index) => (
              <Tag key={`${sku}-${index}`} style={{ marginBottom: 4 }}>
                {sku}
              </Tag>
            ))}
          </div>
        ) : (
          "—"
        ),
    },
    {
      title: "Количество SKU",
      dataIndex: "quantity",
      key: "quantity",
      width: 130,
    },
    {
      title: "Сумма",
      dataIndex: "finalPrice",
      key: "finalPrice",
      width: 140,
      render: (value: number) => `${Number(value || 0).toLocaleString()} ₽`,
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: 170,
      render: (status: OrderStatus) => (
        <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      width: 160,
      render: (_: any, order: Order) => (
        <Button
          icon={<InfoCircleOutlined />}
          size="small"
          loading={isMetadataLoading}
          onClick={() => handleGetMetadata(order.id)}
        >
          Метаданные
        </Button>
      ),
    },
  ];

  if (isLoading || isLoadingNew) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" tip="Загрузка заказов..." />
      </div>
    );
  }

  if (isError || isErrorNew) {
    return <Text type="danger">Ошибка при загрузке заказов</Text>;
  }

  return (
    <div>
      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
        style={{ marginBottom: 8 }}
      >
        <Col xs={24} lg={12}>
          <Title level={3} style={{ margin: 0 }}>
            Заказы Wildberries
          </Title>
          <Text type="secondary">
            Просмотр, фильтрация, проверка статусов и метаданных заказов
          </Text>
        </Col>

        <Col xs={24} lg={12} style={{ textAlign: "right" }}>
          <Space wrap>
            <Button
              icon={<SyncOutlined />}
              loading={isStatusLoading}
              onClick={handleCheckStatuses}
            >
              Проверить статусы
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={ordersTab === "all" ? refetch : refetchNew}
              loading={ordersTab === "all" ? isFetching : isFetchingNew}
            >
              Обновить
            </Button>

            <Segmented
              value={viewMode}
              onChange={(v) => setViewMode(v as ViewMode)}
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
          </Space>
        </Col>
      </Row>

      <Divider />

      <Tabs
        activeKey={ordersTab}
        onChange={(key) => setOrdersTab(key as OrdersTab)}
        items={[
          { label: "Все заказы", key: "all" },
          { label: "Новые заказы", key: "new" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="Всего" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="В обработке" value={stats.in_process} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="Выполнено" value={stats.done} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic
              title="Сумма"
              value={stats.totalAmount}
              formatter={(v) => `${Number(v || 0).toLocaleString()} ₽`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={24} md={12} lg={8}>
          <Input
            allowClear
            size="large"
            placeholder="Поиск по ID заказа, SKU, сумме..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>

        <Col xs={24} md={12} lg={8}>
          <RangePicker
            size="large"
            style={{ width: "100%" }}
            value={dateRange}
            onChange={(dates) => {
              if (dates?.[0] && dates?.[1]) {
                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
              }
            }}
          />
        </Col>
      </Row>

      <Tabs
        activeKey={statusFilter}
        onChange={(key) => setStatusFilter(key as StatusFilter)}
        style={{ marginBottom: 16 }}
        items={[
          { label: "Все", key: "all" },
          { label: "В обработке", key: "in_process" },
          { label: "Выполнено", key: "done" },
          { label: "Отклонено", key: "rejected" },
        ]}
      />

      {filteredOrders.length === 0 ? (
        <Empty description="Заказы не найдены" />
      ) : viewMode === "table" ? (
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          bordered
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: [20, 50, 100],
            showTotal: (total) => `Всего: ${total}`,
          }}
          scroll={{ x: 1200, y: "calc(100vh - 320px)" }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredOrders.map((order: any) => (
            <Col xs={24} sm={12} md={8} xl={6} key={order.id}>
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
                    <Text type="secondary">ID заказа</Text>
                    <div style={{ fontWeight: 700 }}>{order.id}</div>
                  </div>

                  <div>
                    <Text type="secondary">Дата</Text>
                    <div>
                      {order.createdAt
                        ? dayjs(order.createdAt).format("DD.MM.YYYY HH:mm")
                        : "—"}
                    </div>
                  </div>

                  <div>
                    <Text type="secondary">SKU</Text>
                    <div style={{ marginTop: 6 }}>
                      {order.skus?.length ? (
                        order.skus.map((sku: string, index: number) => (
                          <Tag
                            key={`${sku}-${index}`}
                            style={{ marginBottom: 4 }}
                          >
                            {sku}
                          </Tag>
                        ))
                      ) : (
                        <div>—</div>
                      )}
                    </div>
                  </div>

                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <Text type="secondary">Количество</Text>
                      <div style={{ fontWeight: 600 }}>{order.quantity}</div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Сумма</Text>
                      <div style={{ fontWeight: 600 }}>
                        {Number(order.finalPrice || 0).toLocaleString()} ₽
                      </div>
                    </Col>
                  </Row>

                  <div>
                    <Text type="secondary">Статус</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color={STATUS_COLORS[order.status]}>
                        {STATUS_LABELS[order.status]}
                      </Tag>
                    </div>
                  </div>

                  <Button
                    icon={<InfoCircleOutlined />}
                    loading={isMetadataLoading}
                    onClick={() => handleGetMetadata(order.id)}
                    block
                  >
                    Показать метаданные
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={
          metadataModal.orderId
            ? `Метаданные заказа #${metadataModal.orderId}`
            : "Метаданные заказа"
        }
        open={metadataModal.open}
        onCancel={() =>
          setMetadataModal({ open: false, orderId: undefined, data: undefined })
        }
        footer={null}
        width={800}
      >
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "#fafafa",
            padding: 12,
            borderRadius: 12,
            maxHeight: 500,
            overflow: "auto",
            margin: 0,
          }}
        >
          {JSON.stringify(metadataModal.data, null, 2)}
        </pre>
      </Modal>
    </div>
  );
};

export default WbOrdersPage;
