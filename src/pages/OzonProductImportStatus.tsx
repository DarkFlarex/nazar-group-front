import { Button, Card, Form, Input, Spin, Tag, Typography } from "antd";
import { useGetProductImportInfoMutation } from "../store/api/ozonCategoryApi";

const { Title, Text } = Typography;

const statusColorMap: Record<string, string> = {
  SUCCESS: "green",
  FAILED: "red",
  IN_PROGRESS: "blue",
};

const OzonProductImportStatus = () => {
  const [form] = Form.useForm();
  const [getStatus, { data, isLoading, error }] =
    useGetProductImportInfoMutation();

  const onFinish = (values: { task_id: string }) => {
    getStatus(values);
  };

  return (
    <Card style={{ maxWidth: 600 }}>
      <Title level={4}>Статус загрузки товара (Ozon)</Title>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Task ID"
          name="task_id"
          rules={[{ required: true, message: "Введите task_id" }]}
        >
          <Input placeholder="Например: 172549793" />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Проверить статус
        </Button>
      </Form>

      {isLoading && (
        <div style={{ marginTop: 16 }}>
          <Spin />
        </div>
      )}

      {error && <Text type="danger">Ошибка при получении статуса</Text>}

      {data && (
        <Card style={{ marginTop: 16 }} type="inner" title="Результат">
          <p>
            <b>Task ID:</b> {data.task_id}
          </p>

          <p>
            <b>Статус:</b>{" "}
            <Tag color={statusColorMap[data.status] || "default"}>
              {data.status}
            </Tag>
          </p>

          {data.error && <Text type="danger">Ошибка: {data.error}</Text>}

          {data.items && (
            <pre style={{ marginTop: 12 }}>
              {JSON.stringify(data.items, null, 2)}
            </pre>
          )}
        </Card>
      )}
    </Card>
  );
};

export default OzonProductImportStatus;
