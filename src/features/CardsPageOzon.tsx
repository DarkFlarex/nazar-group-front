import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Modal,
  Input,
  Form,
} from "antd";

const CardsPageOZ = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [form] = Form.useForm();
  const [quantityForm] = Form.useForm();

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/ozon/cards/list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Ошибка сервера");
      const data = await res.json();
      if (!data.cards) throw new Error("Нет карточек");
      setCards(data.cards);
    } catch (e) {
      console.error(e);
      message.error(`Ошибка загрузки карточек Ozon: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const columns = [
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Название", dataIndex: "name", key: "name" },
    { title: "Бренд", dataIndex: "brand", key: "brand" },
    { title: "Категория", dataIndex: "category", key: "category" },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => openEditModal(record)}>
            Редактировать
          </Button>
          <Popconfirm
            title="Вы уверены?"
            onConfirm={() => handleDelete(record)}
            okText="Да"
            cancelText="Нет"
          >
            <Button danger>Удалить</Button>
          </Popconfirm>
          <Button onClick={() => openQuantityModal(record)}>
            Изменить кол-во
          </Button>
        </Space>
      ),
    },
  ];

  const openEditModal = (record) => {
    setSelectedCard(record);
    form.setFieldsValue({ name: record.name || "", brand: record.brand || "" });
    setEditModalVisible(true);
  };

  const handleEditSave = () => {
    form.validateFields().then((values) => {
      message.success(`Сохранили карточку SKU ${selectedCard.sku}`);
      setEditModalVisible(false);
    });
  };

  const openQuantityModal = (record) => {
    setSelectedCard(record);
    const qty = record.stock || 0;
    quantityForm.setFieldsValue({ quantity: qty });
    setQuantityModalVisible(true);
  };

  const handleQuantitySave = () => {
    quantityForm.validateFields().then((values) => {
      message.success(
        `Изменили количество для SKU ${selectedCard.sku} на ${values.quantity}`
      );
      setQuantityModalVisible(false);
    });
  };

  const handleDelete = (record) => {
    message.success(`Удалена карточка SKU ${record.sku}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Список карточек Ozon</h1>
      <Table
        rowKey="sku"
        columns={columns}
        dataSource={cards}
        loading={loading}
        pagination={false}
      />

      <Modal
        title="Редактировать карточку"
        open={editModalVisible}
        onOk={handleEditSave}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="brand" label="Бренд" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Изменить количество"
        open={quantityModalVisible}
        onOk={handleQuantitySave}
        onCancel={() => setQuantityModalVisible(false)}
      >
        <Form form={quantityForm} layout="vertical">
          <Form.Item
            name="quantity"
            label="Количество"
            rules={[{ required: true, type: "number", min: 0 }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CardsPageOZ;
