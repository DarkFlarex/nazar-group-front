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
} from "antd";
import moment from "moment";
import { useGetWBOrdersQuery } from "../store/api/wbOrdersApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type ViewMode = "table" | "cards";
type OrderStatus = "in_process" | "done" | "rejected";

const STATUS_LABELS: any = {
  in_process: "В обработке",
  done: "Выполнено",
  rejected: "Отклонено",
};

const WbOrdersPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<any>([
    moment().subtract(14, "days"),
    moment(),
  ]);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("in_process");

  const { data, isLoading, isError, refetch } = useGetWBOrdersQuery();

  /** 👉 добавляем статус по умолчанию */
  const orders = useMemo(() => {
    return (
      data?.data.orders.map((order: any) => ({
        ...order,
        status: order.status ?? "in_process",
      })) || []
    );
  }, [data]);

  const filteredOrders = orders.filter(
    (order: any) => order.status === statusFilter
  );

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
      render: (status: OrderStatus) => STATUS_LABELS[status],
    },
  ];

  if (isLoading) {
    return <Spin tip="Загрузка заказов Wildberries..." />;
  }

  if (isError) {
    return <Text type="danger">Ошибка при загрузке заказов</Text>;
  }

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>Заказы Wildberries</Title>

      {/* Панель управления */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <RangePicker
            value={dateRange as any}
            onChange={setDateRange as any}
          />
        </Col>
        <Col>
          <Button onClick={refetch}>Обновить</Button>
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
      >
        <Tabs.TabPane tab="В обработке" key="in_process" />
        <Tabs.TabPane tab="Выполнено" key="done" />
        <Tabs.TabPane tab="Отклонено" key="rejected" />
      </Tabs>

      {/* Отображение */}
      {viewMode === "table" ? (
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey={(record: any) => record.id}
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
                <Text strong>Статус:</Text> {STATUS_LABELS[order.status]}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default WbOrdersPage;
