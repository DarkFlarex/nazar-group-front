import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  Spin,
  Typography,
  Row,
  Col,
  Radio,
  Tabs,
} from "antd";
import { useGetProductListMutation } from "../store/api/ozonCategoryApi";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const OzonProductList = () => {
  const [form] = Form.useForm();
  const [getProductList, { isLoading }] = useGetProductListMutation();
  const [products, setProducts] = useState<any[]>([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [tabKey, setTabKey] = useState<"all" | "fbo" | "fbs">("all");

  const fetchProducts = async (values: any) => {
    const payload: any = {
      filter: {},
      last_id: "",
      limit: values.limit || 1000,
    };

    if (values.offer_id) payload.filter.offer_id = [values.offer_id];
    if (values.product_id) payload.filter.product_id = [values.product_id];
    if (values.visibility) payload.filter.visibility = values.visibility;

    try {
      const res = await getProductList(payload).unwrap();
      setProducts(res.result.items || []);
      setLastId(res.result.last_id || null);
      setTotal(res.result.total || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { title: "Offer ID", dataIndex: "offer_id", key: "offer_id" },
    { title: "Product ID", dataIndex: "product_id", key: "product_id" },
    {
      title: "Архивирован",
      dataIndex: "archived",
      key: "archived",
      render: (v: boolean) => (v ? "Да" : "Нет"),
    },
    {
      title: "FBO",
      dataIndex: "has_fbo_stocks",
      key: "has_fbo_stocks",
      render: (v: boolean) => (v ? "Да" : "Нет"),
    },
    {
      title: "FBS",
      dataIndex: "has_fbs_stocks",
      key: "has_fbs_stocks",
      render: (v: boolean) => (v ? "Да" : "Нет"),
    },
    {
      title: "Скидка",
      dataIndex: "is_discounted",
      key: "is_discounted",
      render: (v: boolean) => (v ? "Да" : "Нет"),
    },
  ];

  const filteredProducts = products.filter((p) => {
    if (tabKey === "fbo") return p.has_fbo_stocks;
    if (tabKey === "fbs") return p.has_fbs_stocks;
    return true;
  });

  return (
    <Card
      style={{
        margin: "20px auto",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        padding: 20,
      }}
    >
      <Title level={4} style={{ textAlign: "center", marginBottom: 20 }}>
        Список товаров Ozon
      </Title>

      <Form
        layout="inline"
        form={form}
        onFinish={fetchProducts}
        style={{ marginBottom: 16 }}
      >
        <Form.Item name="offer_id" label="Offer ID">
          <Input placeholder="Например: 136748" />
        </Form.Item>
        <Form.Item name="product_id" label="Product ID">
          <Input placeholder="Например: 223681945" />
        </Form.Item>
        <Form.Item name="visibility" label="Видимость">
          <Input placeholder="ALL / ACTIVE / ARCHIVED" />
        </Form.Item>
        <Form.Item name="limit" label="Лимит">
          <Input placeholder="100" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Получить
          </Button>
        </Form.Item>
      </Form>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Tabs
            activeKey={tabKey as any}
            onChange={setTabKey as any}
            type="card"
          >
            <TabPane tab="Все" key="all" />
            <TabPane tab="FBO" key="fbo" />
            <TabPane tab="FBS" key="fbs" />
          </Tabs>
        </Col>
        <Col>
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <Radio.Button value="table">Таблица</Radio.Button>
            <Radio.Button value="cards">Карточки</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>

      {isLoading ? (
        <Spin tip="Загрузка товаров..." />
      ) : viewMode === "table" ? (
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="product_id"
          scroll={{ x: 1300, y: 700 }}
        />
      ) : (
        <div
          className=""
          style={{ overflow: "auto", maxHeight: "calc(100vh - 350px)" }}
        >
          <Row gutter={[16, 16]}>
            {filteredProducts.map((p) => (
              <Col xs={24} sm={12} md={8} lg={6} key={p.product_id}>
                <Card hoverable>
                  <Text strong>Offer ID: </Text>
                  <Text>{p.offer_id}</Text>
                  <br />
                  <Text strong>Product ID: </Text>
                  <Text>{p.product_id}</Text>
                  <br />
                  <Text strong>Архивирован: </Text>
                  <Text>{p.archived ? "Да" : "Нет"}</Text>
                  <br />
                  <Text strong>FBO: </Text>
                  <Text>{p.has_fbo_stocks ? "Да" : "Нет"}</Text>
                  <br />
                  <Text strong>FBS: </Text>
                  <Text>{p.has_fbs_stocks ? "Да" : "Нет"}</Text>
                  <br />
                  <Text strong>Скидка: </Text>
                  <Text>{p.is_discounted ? "Да" : "Нет"}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {filteredProducts.length > 0 && (
        <div style={{ marginTop: 8, textAlign: "right" }}>
          Всего товаров: {total}
        </div>
      )}
    </Card>
  );
};

export default OzonProductList;
