import { useState } from "react";
import {
  Card,
  Table,
  Input,
  Button,
  Form,
  Select,
  DatePicker,
  InputNumber,
  message,
} from "antd";

const { Option } = Select;
const { RangePicker } = DatePicker;

const SupplierOrdersPage = () => {
  const [orders, setOrders] = useState<any>([]); // Таблица заказов
  const [supplier, setSupplier] = useState(null);

  const handleAddRow = () => {
    setOrders([
      ...orders,
      {
        key: Date.now(),
        name: "",
        barcode: "",
        sku: "",
        quantity: 1,
        unit: "шт",
        price: 0,
        discount: 0,
        total: 0,
      },
    ]);
  };

  const handleDeleteRow = (key: any) => {
    setOrders(orders.filter((o: any) => o.key !== key));
  };

  const handleRowChange = (key: any, field: any, value: any) => {
    setOrders((prev: any) =>
      prev.map((o: any) => {
        if (o.key === key) {
          const updated = { ...o, [field]: value };
          updated.total = (
            updated.price *
            updated.quantity *
            (1 - updated.discount / 100)
          ).toFixed(2);
          return updated;
        }
        return o;
      })
    );
  };

  const handleSaveOrder = () => {
    if (!supplier) {
      message.error("Выберите поставщика!");
      return;
    }
    message.success(`Заказ поставщику ${supplier} сохранен!`);
    console.log({ supplier, orderLines: orders });
  };

  const columns = [
    {
      title: "Наименование товара",
      dataIndex: "name",
      key: "name",
      render: (text: any, record: any) => (
        <Input
          value={record.name}
          onChange={(e) => handleRowChange(record.key, "name", e.target.value)}
        />
      ),
    },
    {
      title: "Штрих-код",
      dataIndex: "barcode",
      key: "barcode",
      render: (text: any, record: any) => (
        <Input
          value={record.barcode}
          onChange={(e) =>
            handleRowChange(record.key, "barcode", e.target.value)
          }
        />
      ),
    },
    {
      title: "Артикул",
      dataIndex: "sku",
      key: "sku",
      render: (text: any, record: any) => (
        <Input
          value={record.sku}
          onChange={(e) => handleRowChange(record.key, "sku", e.target.value)}
        />
      ),
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
      render: (text: any, record: any) => (
        <InputNumber
          min={0}
          value={record.quantity}
          onChange={(value) => handleRowChange(record.key, "quantity", value)}
        />
      ),
    },
    {
      title: "Ед. измерения",
      dataIndex: "unit",
      key: "unit",
      render: (text: any, record: any) => (
        <Select
          value={record.unit}
          onChange={(value) => handleRowChange(record.key, "unit", value)}
          style={{ width: 80 }}
        >
          <Option value="шт">шт</Option>
          <Option value="кг">кг</Option>
          <Option value="л">л</Option>
        </Select>
      ),
    },
    {
      title: "Цена",
      dataIndex: "price",
      key: "price",
      render: (text: any, record: any) => (
        <InputNumber
          min={0}
          value={record.price}
          onChange={(value) => handleRowChange(record.key, "price", value)}
        />
      ),
    },
    {
      title: "Скидка %",
      dataIndex: "discount",
      key: "discount",
      render: (text: any, record: any) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discount}
          onChange={(value) => handleRowChange(record.key, "discount", value)}
        />
      ),
    },
    {
      title: "Общая сумма",
      dataIndex: "total",
      key: "total",
      render: (text: any) => <span>{text} ₽</span>,
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: any) => (
        <Button danger onClick={() => handleDeleteRow(record.key)}>
          Удалить
        </Button>
      ),
    },
  ];

  const totalSum = orders.reduce(
    (sum: any, o: any) => sum + parseFloat(o.total || 0),
    0
  );

  return (
    <div style={{ padding: 24 }}>
      <h1>Заказы поставщику</h1>

      <Card style={{ marginBottom: 24 }}>
        <Form layout="inline">
          <Form.Item label="Поставщик">
            <Select
              placeholder="Выберите поставщика"
              style={{ width: 200 }}
              onChange={setSupplier}
            >
              <Option value="ООО Ромашка">ООО Ромашка</Option>
              <Option value="ИП Иванов">ИП Иванов</Option>
              <Option value="ООО Лилия">ООО Лилия</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Период">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSaveOrder}>
              Сохранить заказ
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Button
          type="dashed"
          style={{ marginBottom: 16 }}
          onClick={handleAddRow}
        >
          Добавить товар
        </Button>

        <Table
          dataSource={orders}
          columns={columns}
          rowKey="key"
          pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={7}>Итого:</Table.Summary.Cell>
              <Table.Summary.Cell>{totalSum.toFixed(2)} ₽</Table.Summary.Cell>
              <Table.Summary.Cell />
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
};

export default SupplierOrdersPage;
