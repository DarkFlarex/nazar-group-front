import { useState, useEffect } from "react";
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
  Drawer,
} from "antd";
import {
  useGetProductInfoStokMutation,
  useGetProductInfoStoksMutation,
  useGetProductInfoWareMutation,
  useGetProductListMutation,
} from "../store/api/ozonCategoryApi";
import { useGetProductPricesMutation } from "../store/api/ozonProduct";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const OzonProductList = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [getProductList, { isLoading }] = useGetProductListMutation();
  const [getProductQuant, { isLoading: isLoadingQuant }] =
    useGetProductInfoStokMutation();
  const [getProductStockQuant, { isLoading: isLoadingStockQuant }] =
    useGetProductInfoStoksMutation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [priceData, setPriceData] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [getProductInfoWare] = useGetProductInfoWareMutation();
  const [getProductPrice, { isLoading: isPriceLoading }] =
    useGetProductPricesMutation();
  const [products, setProducts] = useState<any[]>([]);
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
      // Получаем данные о количестве
      const quantRes = await getProductQuant({
        filter: {},
        limit: 1000, // Возможно, тут нужно будет настроить лимит или фильтр для получения нужных остатков
      }).unwrap();

      const dataNew = getProductInfoWare({});
      console.log(dataNew);

      const productsWithQuant = res.result.items.map((product: any) => {
        const foundQuant = quantRes.items.find(
          (q: any) => q.product_id === product.product_id
        );
        const fboPresent =
          foundQuant?.stocks
            .filter((s: any) => s.type === "fbo")
            .reduce((sum: number, s: any) => sum + s.present, 0) || 0;
        const fbsPresent =
          foundQuant?.stocks
            .filter((s: any) => s.type === "fbs")
            .reduce((sum: number, s: any) => sum + s.present, 0) || 0;

        return {
          ...product,
          fbo_present_stock: fboPresent,
          fbs_present_stock: fbsPresent,
        };
      });

      setProducts(productsWithQuant || []);
      setTotal(res.result.total || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const showPrice = async (product: any) => {
    setSelectedProduct(product);
    try {
      const res = await getProductPrice({
        offer_id: product.offer_id,
        product_id: product.product_id,
      }).unwrap();
      setPriceData(res);
      setDrawerVisible(true);
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    {
      title: "№",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 70,
    },
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
      dataIndex: "fbo_present_stock", // Используем новое поле
      key: "fbo_present_stock",
    },
    {
      title: "FBS",
      dataIndex: "fbs_present_stock", // Используем новое поле
      key: "fbs_present_stock",
    },
    {
      title: "Скидка",
      dataIndex: "is_discounted",
      key: "is_discounted",
      render: (v: boolean) => (v ? "Да" : "Нет"),
    },
    {
      title: "Действие",
      key: "action",
      render: (_: any, record: any) => (
        <>
          <Button type="link" onClick={() => showPrice(record)}>
            Цена
          </Button>

          <Button
            type="link"
            onClick={() => navigate(`/product/product_id/${record.product_id}`)}
          >
            Характеристики
          </Button>
        </>
      ),
    },
  ];

  const filteredProducts = products.filter((p) => {
    if (tabKey === "fbo") return p.has_fbo_stocks;
    if (tabKey === "fbs") return p.has_fbs_stocks;
    return true;
  });

  useEffect(() => {
    fetchProducts({});
  }, []);

  return (
    <Card
      style={{
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
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

      <Row justify="space-between" align="middle" style={{ marginBottom: 0 }}>
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

      {isLoading || isLoadingQuant ? ( // Учитываем загрузку остатков
        <Spin tip="Загрузка товаров..." />
      ) : viewMode === "table" ? (
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="product_id"
          pagination={false} // ← ВАЖНО
          scroll={{ x: 1300, y: 470 }}
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
                  <Text strong>FBO (в наличии): </Text>
                  <Text>{p.fbo_present_stock}</Text> {/* Отображаем FBO */}
                  <br />
                  <Text strong>FBS (в наличии): </Text>
                  <Text>{p.fbs_present_stock}</Text> {/* Отображаем FBS */}
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

      {/* Drawer для отображения цены */}
      <Drawer
        title={`Цены для Offer ID: ${selectedProduct?.offer_id}`}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {isPriceLoading ? (
          <Spin tip="Загрузка цены..." />
        ) : priceData?.items?.length ? (
          priceData.items.map((item: any) => (
            <div key={item.product_id} style={{ marginBottom: 16 }}>
              <Text strong>Цена: </Text>
              <Text>
                {item.price.price} {item.price.currency_code}
              </Text>
              <br />
              <Text strong>Старая цена: </Text>
              <Text>{item.price.old_price}</Text>
              <br />
              <Text strong>Минимальная цена: </Text>
              <Text>{item.price.min_price}</Text>
              <br />
              <Text strong>VAT: </Text>
              <Text>{item.price.vat * 100}%</Text>
            </div>
          ))
        ) : (
          <Text>Данных о цене нет</Text>
        )}
      </Drawer>
    </Card>
  );
};

export default OzonProductList;
