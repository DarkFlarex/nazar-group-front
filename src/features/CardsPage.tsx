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

const CardsPageWB = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [form] = Form.useForm();
  const [quantityForm] = Form.useForm();

  // Загрузка карточек Wildberries
  const fetchCards = async (cursorData = {}) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/sandbox/cards/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            sort: { ascending: true },
            cursor: { limit: 100, ...cursorData },
            filter: { withPhoto: -1 },
          },
        }),
      });

      if (!res.ok) throw new Error("Сервер вернул ошибку");

      const data = await res.json();

      if (data.error) {
        message.error("Ошибка при получении карточек");
        return;
      }

      setCards(data.cards || []);
      setCursor(data.cursor || {});
    } catch (e) {
      console.error(e);
      message.error(`Ошибка загрузки карточек: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const columns = [
    { title: "NM ID", dataIndex: "nmID", key: "nmID" },
    { title: "Название", dataIndex: "title", key: "title" },
    { title: "Бренд", dataIndex: "brand", key: "brand" },
    { title: "Категория", dataIndex: "subjectName", key: "subjectName" },
    { title: "Артикул", dataIndex: "vendorCode", key: "vendorCode" },
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
    form.setFieldsValue({
      title: record.title || "",
      brand: record.brand || "",
    });
    setEditModalVisible(true);
  };

  const handleEditSave = () => {
    form.validateFields().then((values) => {
      message.success(`Сохранили карточку ${selectedCard.nmID}`);
      setEditModalVisible(false);
    });
  };

  const openQuantityModal = (record) => {
    setSelectedCard(record);
    const qty = record.sizes?.[0]?.skus?.length || 0;
    quantityForm.setFieldsValue({ quantity: qty });
    setQuantityModalVisible(true);
  };

  const handleQuantitySave = () => {
    quantityForm.validateFields().then((values) => {
      message.success(
        `Изменили количество для ${selectedCard.nmID} на ${values.quantity}`
      );
      setQuantityModalVisible(false);
    });
  };

  const handleDelete = (record) => {
    message.success(`Удалена карточка ${record.nmID}`);
  };

  const loadNextPage = () => {
    if (cursor && cursor.nmID) {
      fetchCards({ updatedAt: cursor.updatedAt, nmID: cursor.nmID });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Список карточек Wildberries</h1>
      <Table
        rowKey="nmID"
        columns={columns}
        dataSource={cards}
        loading={loading}
        pagination={false}
      />
      {cursor?.total > cards.length && (
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Button onClick={loadNextPage}>Загрузить ещё</Button>
        </div>
      )}

      <Modal
        title="Редактировать карточку"
        open={editModalVisible}
        onOk={handleEditSave}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Название" rules={[{ required: true }]}>
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

export default CardsPageWB;
