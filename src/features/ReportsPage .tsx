import { useState } from "react";
import {
  Card,
  Tabs,
  Form,
  DatePicker,
  Select,
  Button,
  Table,
  Space,
  message,
} from "antd";
import dayjs from "dayjs";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const mockData = [
  { key: 1, date: "01.01.2026", counterparty: "ООО Ромашка", amount: 1500 },
  { key: 2, date: "02.01.2026", counterparty: "ИП Иванов", amount: 2500 },
  { key: 3, date: "03.01.2026", counterparty: "ООО Лилия", amount: 3200 },
];

const ReportsPage = () => {
  const [reportType, setReportType] = useState("expense");
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const columnsExpense = [
    { title: "Дата", dataIndex: "date", key: "date" },
    { title: "Контрагент", dataIndex: "counterparty", key: "counterparty" },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      render: (val: any) => `${val} ₽`,
    },
  ];

  const columnsIncome = [
    { title: "Дата", dataIndex: "date", key: "date" },
    { title: "Клиент", dataIndex: "counterparty", key: "counterparty" },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      render: (val: any) => `${val} ₽`,
    },
  ];

  const handleGenerateReport = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      // Здесь можно вызвать API для получения отчета
      setData(mockData);
      setLoading(false);
      message.success("Отчет сгенерирован");
    }, 500);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Отчеты</h1>

      <Card style={{ marginBottom: 24 }}>
        <Tabs defaultActiveKey="expense" onChange={setReportType}>
          <TabPane tab="Расходы" key="expense">
            <Form layout="inline" onFinish={handleGenerateReport}>
              <Form.Item name="date" label="Период">
                <RangePicker
                  defaultValue={[dayjs().startOf("month"), dayjs()]}
                />
              </Form.Item>

              <Form.Item name="counterparty" label="Контрагент">
                <Select
                  placeholder="Выберите"
                  style={{ width: 200 }}
                  allowClear
                >
                  <Option value="ООО Ромашка">ООО Ромашка</Option>
                  <Option value="ИП Иванов">ИП Иванов</Option>
                  <Option value="ООО Лилия">ООО Лилия</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Сформировать
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Доходы" key="income">
            <Form layout="inline" onFinish={handleGenerateReport}>
              <Form.Item name="date" label="Период">
                <RangePicker
                  defaultValue={[dayjs().startOf("month"), dayjs()]}
                />
              </Form.Item>

              <Form.Item name="client" label="Клиент">
                <Select
                  placeholder="Выберите"
                  style={{ width: 200 }}
                  allowClear
                >
                  <Option value="Клиент А">Клиент А</Option>
                  <Option value="Клиент Б">Клиент Б</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Сформировать
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Товары" key="products">
            <Form layout="inline" onFinish={handleGenerateReport}>
              <Form.Item name="category" label="Категория">
                <Select
                  placeholder="Выберите"
                  style={{ width: 200 }}
                  allowClear
                >
                  <Option value="Продукты">Продукты</Option>
                  <Option value="Техника">Техника</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Сформировать
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="default">Экспорт в Excel</Button>
            <Button type="default">Экспорт в PDF</Button>
          </Space>
        </div>

        <Table
          rowKey="key"
          columns={
            reportType === "expense"
              ? columnsExpense
              : reportType === "income"
              ? columnsIncome
              : columnsExpense
          }
          dataSource={data}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default ReportsPage;
