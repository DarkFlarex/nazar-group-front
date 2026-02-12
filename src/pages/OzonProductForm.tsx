import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Space,
  Divider,
  message,
} from "antd";
import { useImportProductsMutation } from "../store/api/ozonCategoryApi";

const OzonProductForm = ({ initialValues }: any) => {
  const [form] = Form.useForm();
  const [importProduct, { isLoading }] = useImportProductsMutation();

  const onFinish = async (values: any) => {
    try {
      await importProduct({ items: [values] } as any).unwrap();
      message.success("Товар отправлен в Ozon");
      form.resetFields();
    } catch (e) {
      console.error(e);
      message.error("Ошибка при отправке товара");
    }
  };

  return (
    <Card
      title="Создание / редактирование товара Ozon"
      style={{ maxHeight: 700, overflow: "auto" }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
      >
        <Divider>Основное</Divider>
        <Form.Item name="offer_id" label="Offer ID">
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Название">
          <Input />
        </Form.Item>
        <Form.Item name="barcode" label="Штрихкод">
          <Input />
        </Form.Item>
        <Form.Item name="description_category_id" label="Категория Ozon">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="type_id" label="Type ID">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Divider>Цены</Divider>
        <Form.Item name="price" label="Цена">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="old_price" label="Старая цена">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Divider>Габариты</Divider>
        <Space size="middle">
          <Form.Item name="width" label="Ширина">
            <InputNumber />
          </Form.Item>
          <Form.Item name="height" label="Высота">
            <InputNumber />
          </Form.Item>
          <Form.Item name="depth" label="Глубина">
            <InputNumber />
          </Form.Item>
        </Space>
        <Form.Item name="weight" label="Вес (г)">
          <InputNumber />
        </Form.Item>

        <Divider>Атрибуты</Divider>
        <Form.List name="attributes">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <Space key={key} align="baseline">
                  <Form.Item name={[name, "id"]}>
                    <InputNumber placeholder="ID" />
                  </Form.Item>
                  <Form.Item name={[name, "values", 0, "value"]}>
                    <Input placeholder="Значение" />
                  </Form.Item>
                  <Form.Item name={[name, "values", 0, "dictionary_value_id"]}>
                    <InputNumber placeholder="Dict ID" />
                  </Form.Item>
                  <Button danger onClick={() => remove(name)}>
                    ✕
                  </Button>
                </Space>
              ))}
              <Button type="dashed" onClick={() => add({ values: [{}] })} block>
                + Добавить атрибут
              </Button>
            </>
          )}
        </Form.List>

        <Divider />
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          Отправить в Ozon
        </Button>
      </Form>
    </Card>
  );
};

export default OzonProductForm;
