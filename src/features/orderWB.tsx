import { Card, Tag, List, Button, Space, Popconfirm } from "antd";
import { useGetWBOrdersQuery } from "../store/api/wbOrdersApi";

const initialOrders = [
  {
    id: 13833711,
    article: "one-ring-7548",
    orderUid: "165918930_629fbc924b984618a44354475ca58675",
    price: 1014,
    finalPrice: 1014,
    deliveryType: "fbs",
    ddate: "17.05.2024",
    sellerDate: "02.06.2025",
    status: "new",
    comment: "Упакуйте в плёнку, пожалуйста",
    address:
      "Челябинская область, г. Челябинск, 51-я улица Арабкира, д. 10А, кв. 42",
    skus: ["6665956397512"],
    offices: ["Калуга"],
    isB2b: true,
  },
];

const statusTag: any = {
  new: <Tag color="blue">Новый</Tag>,
  processed: <Tag color="green">Обработан</Tag>,
  rejected: <Tag color="red">Отклонён</Tag>,
};

const OrdersPage = () => {
  const { data: orders = initialOrders } = useGetWBOrdersQuery();
  const changeStatus = () => {};

  return (
    <div style={{ padding: 16 }}>
      <h2>📦 Заказы</h2>

      <List
        dataSource={orders}
        renderItem={(order: any) => (
          <Card size="small" key={order.id} style={{ marginBottom: 12 }}>
            {/* Верхняя строка */}
            <Space
              style={{ width: "100%", justifyContent: "space-between" }}
              align="start"
            >
              <Space size="small" wrap>
                <b>#{order.id}</b>
                {statusTag[order.status]}
                <Tag>{order.deliveryType.toUpperCase()}</Tag>
                {order.isB2b && <Tag color="purple">B2B</Tag>}
              </Space>

              <Space>
                <Popconfirm
                  title="Обработать заказ?"
                  okText="Да"
                  cancelText="Отмена"
                  onConfirm={() => changeStatus()}
                  disabled={order.status !== "new"}
                >
                  <Button
                    type="primary"
                    size="small"
                    disabled={order.status !== "new"}
                  >
                    Обработать
                  </Button>
                </Popconfirm>

                <Popconfirm
                  title="Отклонить заказ?"
                  okText="Отклонить"
                  cancelText="Отмена"
                  onConfirm={() => changeStatus()}
                  disabled={order.status !== "new"}
                >
                  <Button danger size="small" disabled={order.status !== "new"}>
                    Отклонить
                  </Button>
                </Popconfirm>
              </Space>
            </Space>

            {/* Вторая строка */}
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <Space size="large" wrap>
                <span>
                  <b>Артикул:</b> {order.article}
                </span>
                <span>
                  <b>Цена:</b> {order.finalPrice} ₽
                </span>
                <span>
                  <b>Дата доставки:</b> {order.ddate}
                </span>
                <span>
                  <b>SKU:</b> {order.skus.join(", ")}
                </span>
                <span>
                  <b>Склад:</b> {order.offices.join(", ")}
                </span>
              </Space>
            </div>

            {/* Адрес + комментарий */}
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "#555",
              }}
            >
              📍 {order.address}
              {order.comment && (
                <>
                  <br />
                  💬 {order.comment}
                </>
              )}
            </div>
          </Card>
        )}
      />
    </div>
  );
};

export default OrdersPage;
