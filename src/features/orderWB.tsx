import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Card,
  Form,
  DatePicker,
  Select,
  Input,
} from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

// Mock API (пока данные для примера)
const mockOrders = [
  {
    key: 1,
    orderId: "WB12345",
    date: "2026-01-30",
    customer: "ООО Ромашка",
    status: "Новый",
    amount: 4500,
  },
  {
    key: 2,
    orderId: "WB12346",
    date: "2026-01-29",
    customer: "ИП Иванов",
    status: "Отгружен",
    amount: 2500,
  },
  {
    key: 3,
    orderId: "WB12347",
    date: "2026-01-28",
    customer: "ООО Лилия",
    status: "Отменен",
    amount: 3200,
  },
];

const OrdersWBPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchOrders = async (filters = {}) => {
    setLoading(true);
    try {
      // Здесь можно вызывать реальный API Wildberries
      // const res = await fetch("http://localhost:5000/wb/orders", { ... });
      // const data = await res.json();
      // setOrders(data.orders);

      // Для примера используем mock
      setTimeout(() => {
        let filtered = mockOrders;
        if (filters.status) {
          filtered = filtered.filter((o) => o.status === filters.status);
        }
        if (filters.orderId) {
          filtered = filtered.filter((o) =>
            o.orderId.includes(filters.orderId)
          );
        }
        if (filters.dateRange) {
          const [start, end] = filters.dateRange;
          filtered = filtered.filter((o) => {
            const orderDate = dayjs(o.date);
            return (
              orderDate.isAfter(start.subtract(1, "day")) &&
              orderDate.isBefore(end.add(1, "day"))
            );
          });
        }
        setOrders(filtered);
        setLoading(false);
      }, 500);
    } catch (e) {
      console.error(e);
      message.error("Ошибка загрузки заказов");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns = [
    { title: "Номер заказа", dataIndex: "orderId", key: "orderId" },
    { title: "Дата", dataIndex: "date", key: "date" },
    { title: "Клиент", dataIndex: "customer", key: "customer" },
    { title: "Статус", dataIndex: "status", key: "status" },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      render: (val) => `${val} ₽`,
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => message.info(`Детали ${record.orderId}`)}
          >
            Детали
          </Button>
          <Button
            type="link"
            onClick={() => message.success(`Печать ${record.orderId}`)}
          >
            Печать
          </Button>
          {record.status !== "Отменен" && (
            <Button
              type="link"
              danger
              onClick={() => handleCancelOrder(record)}
            >
              Отменить
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleCancelOrder = (record) => {
    message.success(`Заказ ${record.orderId} отменен`);
    setOrders((prev) =>
      prev.map((o) => (o.key === record.key ? { ...o, status: "Отменен" } : o))
    );
  };

  const handleFilter = (values) => {
    const filters = {
      orderId: values.orderId || "",
      status: values.status || "",
      dateRange: values.dateRange || null,
    };
    fetchOrders(filters);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Заказы Wildberries</h1>

      <Card style={{ marginBottom: 24 }}>
        <Form layout="inline" form={form} onFinish={handleFilter}>
          <Form.Item name="orderId" label="Номер заказа">
            <Input placeholder="Введите номер заказа" />
          </Form.Item>

          <Form.Item name="status" label="Статус">
            <Select
              placeholder="Выберите статус"
              style={{ width: 150 }}
              allowClear
            >
              <Option value="Новый">Новый</Option>
              <Option value="Отгружен">Отгружен</Option>
              <Option value="Отменен">Отменен</Option>
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="Период">
            <RangePicker />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Фильтровать
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              onClick={() => {
                form.resetFields();
                fetchOrders();
              }}
            >
              Сброс
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table
          rowKey="key"
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default OrdersWBPage;
