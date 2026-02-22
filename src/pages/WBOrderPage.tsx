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
  Radio,
  Tag,
  Alert,
} from "antd";
import moment from "moment";
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

interface Order {
  id: number;
  createdAt: string;
  skus: string[];
  finalPrice: number;
  status?: OrderStatus;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  in_process: "В обработке",
  done: "Выполнено",
  rejected: "Отклонено",
};

const WbOrdersPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<any>([
    moment().subtract(14, "days"),
    moment(),
  ]);

  const [ordersTab, setOrdersTab] = useState<OrdersTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("in_process");

  const [statusesMap, setStatusesMap] = useState<Record<number, OrderStatus>>(
    {}
  );

  const [getStatuses, { isLoading: isStatusLoading }] =
    useGetWBOrdersStatusMutation();
  const [getOrderMetadata, { isLoading: isMetadataLoading }] =
    useGetWBOrderMetadataMutation();
  const { data = [], isLoading, isError, refetch } = useGetWBOrdersQuery();
  const handleGetMetadata = async (orderId: number) => {
    try {
      const metadata = await getOrderMetadata({ orderId }).unwrap();
      alert(`Метаданные заказа ${orderId}: ` + JSON.stringify(metadata));
      // Можно показать через модалку, либо сохранить в state для отображения
    } catch (error) {
      console.error("Ошибка при получении метаданных", error);
    }
  };
  const {
    data: newOrders = [],
    isLoading: isLoadingNew,
    isError: isErrorNew,
    refetch: refetchNew,
  } = useGetWBOrdersNewQuery();

  /* =========================
     МАППИНГ СТАТУСОВ
  ========================== */
  const mapOrderStatus = (
    supplierStatus: string,
    wbStatus: string
  ): OrderStatus => {
    if (wbStatus === "declined_by_client") {
      return "rejected";
    }

    if (supplierStatus === "complete") {
      return "done";
    }

    return "in_process";
  };

  /* =========================
     ПРОВЕРКА АКТУАЛЬНЫХ СТАТУСОВ
  ========================== */
  const handleCheckStatuses = async () => {
    try {
      const activeOrders = ordersTab === "all" ? data : newOrders;

      const orderIds = activeOrders.map((o: any) => o.id);

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

  /* =========================
     ОБРАБОТКА ЗАКАЗОВ
  ========================== */
  const preparedOrders = useMemo(() => {
    const source = ordersTab === "all" ? data : newOrders;

    return source.map((order: Order) => ({
      ...order,
      status: statusesMap[order.id] ?? order.status ?? "in_process",
    }));
  }, [data, newOrders, ordersTab, statusesMap]);

  /* =========================
     ФИЛЬТР ПО ДАТЕ
  ========================== */
  const dateFilteredOrders = useMemo(() => {
    if (!dateRange) return preparedOrders;

    const [start, end] = dateRange;

    return preparedOrders.filter((order: any) =>
      moment(order.createdAt).isBetween(
        start.startOf("day"),
        end.endOf("day"),
        undefined,
        "[]"
      )
    );
  }, [preparedOrders, dateRange]);

  /* =========================
     ФИЛЬТР ПО СТАТУСУ
  ========================== */
  const filteredOrders = dateFilteredOrders.filter(
    (order: any) => order.status === statusFilter
  );

  /* =========================
     КОЛОНКИ
  ========================== */
  const columns = [
    {
      title: "ID заказа",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Дата",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => moment(value).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "SKU",
      dataIndex: "skus",
      key: "skus",
      render: (skus: string[]) => skus.join(", "),
    },
    {
      title: "Количество",
      key: "quantity",
      render: () => 1,
    },
    {
      title: "Сумма",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (value: number) => `${value} ₽`,
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: OrderStatus) => {
        const color =
          status === "done"
            ? "green"
            : status === "rejected"
            ? "red"
            : "orange";

        return <Tag color={color}>{STATUS_LABELS[status]}</Tag>;
      },
    },
    {
      title: "Метаданные",
      key: "metadata",
      render: (_: any, order: Order) => (
        <Button
          size="small"
          loading={isMetadataLoading}
          onClick={() => handleGetMetadata(order.id)}
        >
          Получить
        </Button>
      ),
    },
  ];

  if (isLoading || isLoadingNew) {
    return <Spin tip="Загрузка заказов..." />;
  }

  if (isError || isErrorNew) {
    return <Text type="danger">Ошибка при загрузке заказов</Text>;
  }

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>
        Заказы Wildberries{" "}
        <Button loading={isStatusLoading} onClick={handleCheckStatuses}>
          Проверить статусы
        </Button>
      </Title>

      {/* Верхние табы */}
      <Tabs
        activeKey={ordersTab}
        onChange={(key) => setOrdersTab(key as OrdersTab)}
        style={{ marginBottom: 24 }}
        items={[
          { label: "Все заказы", key: "all" },
          { label: "Новые заказы", key: "new" },
        ]}
      />

      {/* Панель управления */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as any)}
          />
        </Col>
        <Col>
          <Button onClick={ordersTab === "all" ? refetch : refetchNew}>
            Обновить
          </Button>
        </Col>
        <Col>
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <Radio.Button value="table">Таблица</Radio.Button>
            <Radio.Button value="cards">Карточки</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>

      {/* Фильтр по статусу */}
      <Tabs
        activeKey={statusFilter}
        onChange={(key) => setStatusFilter(key as OrderStatus)}
        style={{ marginBottom: 16 }}
        items={[
          {
            label: "В обработке",
            key: "in_process",
          },
          { label: "Выполнено", key: "done" },
          { label: "Отклонено", key: "rejected" },
        ]}
      />

      {/* Отображение */}
      {viewMode === "table" ? (
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{ pageSize: 100 }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredOrders.map((order: any) => (
            <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
              <Card title={`Заказ №${order.id}`} hoverable>
                <Text strong>Дата:</Text>{" "}
                {moment(order.createdAt).format("YYYY-MM-DD HH:mm")}
                <br />
                <Text strong>SKU:</Text> {order.skus.join(", ")}
                <br />
                <Text strong>Сумма:</Text> {order.finalPrice} ₽
                <br />
                <Text strong>Статус:</Text>{" "}
                <Tag>{STATUS_LABELS[order.status as OrderStatus]}</Tag>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default WbOrdersPage;
