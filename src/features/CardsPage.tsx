import { useEffect, useState } from "react";
import { Button, Space, message, Popconfirm, Modal, Input, Form } from "antd";
import CardsList from "../pages/wbCards";

const CardsPageWB = () => {
  const [cards, setCards] = useState<any>([]);
  const [cursor, setCursor] = useState<any>({});
  const [editModalVisible, setEditModalVisible] = useState<any>(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState<any>(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [form] = Form.useForm();
  const [quantityForm] = Form.useForm();

  // Загрузка карточек Wildberries
  const fetchCards = async (cursorData = {}) => {
    try {
      const res = await fetch(
        "https://nazar-backend.333.kg/api/sandbox/cards/list",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            settings: {
              sort: { ascending: true },
              cursor: { limit: 100, ...cursorData },
              filter: { withPhoto: -1 },
            },
          }),
        }
      );

      if (!res.ok) throw new Error("Сервер вернул ошибку");

      const data = await res.json();

      if (data.error) {
        message.error("Ошибка при получении карточек");
        return;
      }

      setCards(data.cards || []);
      setCursor(data.cursor || {});
    } catch (e: any) {
      console.error(e);
      message.error(`Ошибка загрузки карточек: ${e.message}`);
    } finally {
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleEditSave = () => {
    form.validateFields().then(() => {
      message.success(`Сохранили карточку ${selectedCard.nmID}`);
      setEditModalVisible(false);
    });
  };

  const handleQuantitySave = () => {
    quantityForm.validateFields().then((values) => {
      message.success(
        `Изменили количество для ${selectedCard.nmID} на ${values.quantity}`
      );
      setQuantityModalVisible(false);
    });
  };

  const loadNextPage = () => {
    if (cursor && cursor.nmID) {
      fetchCards({ updatedAt: cursor.updatedAt, nmID: cursor.nmID });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Список карточек Wildberries</h1>
      <CardsList />
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
