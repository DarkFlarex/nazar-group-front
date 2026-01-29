import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const MarketplaceForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    console.log("Отправляем на API:", values);

    try {
      // Пример запроса для Wildberries
      if (values.marketplace === "wb") {
        const response = await fetch(
          "https://suppliers-api.wildberries.ru/api/v1/supplier/stocks",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer YOUR_WB_API_KEY",
            },
            body: JSON.stringify({
              sku: values.sku,
              name: values.name,
              price: values.price,
              quantity: values.quantity,
            }),
          }
        );
        const data = await response.json();
        message.success("Товар отправлен на Wildberries!");
        console.log(data);
      }

      // Пример запроса для Ozon
      if (values.marketplace === "ozon") {
        const response = await fetch(
          "https://api-seller.ozon.ru/v2/product/import",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Client-Id": "YOUR_OZON_CLIENT_ID",
              "Api-Key": "YOUR_OZON_API_KEY",
            },
            body: JSON.stringify({
              items: [
                {
                  offer_id: values.sku,
                  name: values.name,
                  price: values.price,
                  stock: values.quantity,
                  category_id: values.category,
                  images:
                    values.images?.fileList?.map(
                      (f: any) => f.originFileObj.name
                    ) || [],
                },
              ],
            }),
          }
        );
        const data = await response.json();
        message.success("Товар отправлен на Ozon!");
        console.log(data);
      }
    } catch (error) {
      console.error(error);
      message.error("Ошибка отправки товара!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="marketplace"
        label="Маркетплейс"
        rules={[{ required: true }]}
      >
        <Select placeholder="Выберите маркетплейс">
          <Option value="wb">Wildberries</Option>
          <Option value="ozon">Ozon</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="name"
        label="Название товара"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="price" label="Цена" rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="quantity"
        label="Количество"
        rules={[{ required: true }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="category" label="Категория" rules={[{ required: true }]}>
        <Input placeholder="ID категории" />
      </Form.Item>

      <Form.Item name="images" label="Фото">
        <Upload listType="picture" beforeUpload={() => false} multiple>
          <Button icon={<UploadOutlined />}>Загрузить фото</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Отправить
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MarketplaceForm;
