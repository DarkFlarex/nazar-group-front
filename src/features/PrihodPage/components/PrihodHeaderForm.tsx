import { Form, Input, Select, DatePicker, InputNumber, Row, Col } from "antd";
import dayjs from "dayjs";

export interface HeaderValues {
  docNumber: string;
  docDate: string;
  supplier: string;
  warehouse: string;
  currency: "USD" | "KGS";
  rate: number;
  responsible: string;
  comment?: string;
}

interface Props {
  onChange: (values: HeaderValues) => void;
}

const PrihodHeaderForm = ({ onChange }: Props) => {
  const [form] = Form.useForm();

  const handleChange = () => {
    onChange(form.getFieldsValue());
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        docNumber: "000001",
        docDate: dayjs(),
        currency: "KGS",
        rate: 1,
      }}
      onValuesChange={handleChange}
    >
      <Row gutter={16}>
        <Col span={4}>
          <Form.Item name="docNumber" label="Номер">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item name="docDate" label="Дата">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="supplier"
            label="Поставщик"
            rules={[{ required: true }]}
          >
            <Select placeholder="Выберите поставщика">
              <Select.Option value="auto">ОсОО AutoParts KG</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="warehouse"
            label="Склад"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="bishkek">Бишкек</Select.Option>
              <Select.Option value="moscow">Москва</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={4}>
          <Form.Item name="currency" label="Валюта">
            <Select>
              <Select.Option value="KGS">Сом</Select.Option>
              <Select.Option value="USD">USD</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item name="rate" label="Курс">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="responsible" label="Ответственный">
            <Select>
              <Select.Option value="admin">Администратор</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="comment" label="Комментарий">
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default PrihodHeaderForm;
