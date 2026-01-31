import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  message,
  Card,
  Row,
  Col,
  Typography,
  Upload,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import ImgCrop from "antd-img-crop";

const { Option } = Select;
const { Title, Text } = Typography;

const MarketplaceForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [limits, setLimits] = useState<{
    freeLimits: number;
    paidLimits: number;
  } | null>(null);
  const [cardResponse, setCardResponse] = useState<any>(null);

  // 📸 Состояние для загрузки фото
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const res = await fetch("http://localhost:5000/sandbox/cards/limits");
        const data = await res.json();
        if (!data.error) setLimits(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLimits();
  }, []);

  const onUploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
  };

  const onUploadPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as File);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const handleSubmitOrder = async (values: any) => {
    setLoading(true);
    setOrderStatus(null);

    try {
      if (values.marketplace === "wb") {
        const createRes = await fetch("http://localhost:5000/wb/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: values.orderId,
            sku: values.sku,
            quantity: values.quantity,
            price: values.price,
            fio: values.fio,
            phone: values.phone,
          }),
        });
        const createData = await createRes.json();
        message.success("Заказ создан!");

        const statusRes = await fetch(
          `http://localhost:5000/wb/order/${values.orderId}`
        );
        const statusData = await statusRes.json();
        setOrderStatus(JSON.stringify(statusData, null, 2));
      }
    } catch (error) {
      console.error(error);
      message.error("Ошибка при создании или отслеживании заказа!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async () => {
    const values = form.getFieldsValue();
    if (!values.sku) {
      message.error("Введите SKU для карточки!");
      return;
    }

    setLoading(true);
    setCardResponse(null);

    try {
      const images = fileList.map((f) => f.originFileObj); // или f.url, если уже загружены на сервер
      const payload = [
        {
          subjectID: 105,
          variants: [
            {
              vendorCode: `SANDBOX-CARD-${Date.now()}`,
              title: "Тестовая карточка через 333",
              brand: "SandboxBrand",
              description: "Создано через локальный Node.js сервер",
              dimensions: { length: 10, width: 10, height: 10 },
              weight: 0.3,
              sizes: [{ skus: [values.sku] }],
              images, // добавляем фото в карточку
            },
          ],
        },
      ];

      const res = await fetch("http://localhost:5000/sandbox/cards/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setCardResponse(data);

      if (!data.error) message.success("Карточка успешно создана!");
      else message.error(data.errorText || "Ошибка при создании карточки");
    } catch (err) {
      console.error(err);
      message.error("Ошибка при создании карточки!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        maxWidth: 700,
        margin: "30px auto",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>
        Создание заказа и карточки Wildberries
      </Title>

      {limits && (
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={12}>
            <Text strong>Свободные лимиты:</Text>{" "}
            <Text>{limits.freeLimits}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Платные лимиты:</Text> <Text>{limits.paidLimits}</Text>
          </Col>
        </Row>
      )}

      {/* 🔹 Загрузка изображений */}
      <ImgCrop rotationSlider>
        <Upload
          action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
          listType="picture-card"
          fileList={fileList}
          onChange={onUploadChange}
          onPreview={onUploadPreview}
        >
          {fileList.length < 5 && "+ Upload"}
        </Upload>
      </ImgCrop>

      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Form.Item
          name="marketplace"
          label="Маркетплейс"
          rules={[{ required: true, message: "Выберите маркетплейс" }]}
        >
          <Select placeholder="Выберите маркетплейс">
            <Option value="wb">Wildberries</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="orderId"
          label="ID заказа"
          rules={[{ required: true, message: "Введите ID заказа" }]}
        >
          <Input placeholder="Например, TEST12345" />
        </Form.Item>

        <Form.Item
          name="sku"
          label="SKU товара"
          rules={[{ required: true, message: "Введите SKU" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Количество"
          rules={[{ required: true, message: "Введите количество" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="price"
          label="Цена"
          rules={[{ required: true, message: "Введите цену" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="fio"
          label="ФИО покупателя"
          rules={[{ required: true, message: "Введите ФИО" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Телефон"
          rules={[{ required: true, message: "Введите телефон" }]}
        >
          <Input placeholder="+7 (___) ___-__-__" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Button
              type="primary"
              block
              loading={loading}
              style={{ borderRadius: 6 }}
              onClick={() =>
                form.submit() && handleSubmitOrder(form.getFieldsValue())
              }
            >
              Создать и проверить заказ
            </Button>
          </Col>

          <Col span={12}>
            <Button
              type="default"
              block
              loading={loading}
              style={{ borderRadius: 6 }}
              onClick={handleCreateCard}
            >
              Создать карточку WB Sandbox
            </Button>
          </Col>
        </Row>

        {orderStatus && (
          <pre
            style={{
              background: "#f4f4f4",
              padding: 10,
              borderRadius: 6,
              overflowX: "auto",
              marginTop: 10,
            }}
          >
            {orderStatus}
          </pre>
        )}

        {cardResponse && (
          <pre
            style={{
              background: "#f0f0f0",
              padding: 10,
              borderRadius: 6,
              overflowX: "auto",
              marginTop: 10,
            }}
          >
            {JSON.stringify(cardResponse, null, 2)}
          </pre>
        )}
      </Form>
    </Card>
  );
};

export default MarketplaceForm;
