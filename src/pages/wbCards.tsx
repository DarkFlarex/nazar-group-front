import { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Spin, Radio, Tabs, Input } from "antd";
import { useGetCardsQuery } from "../store/api/cardsApi";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface StockData {
  [sku: string]: number;
}

const CardsListWB = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [tabKey, setTabKey] = useState<"all" | "brand">("all");
  const [stocks, setStocks] = useState<StockData>({});
  const [loadingStock, setLoadingStock] = useState(true);

  const { data, isLoading, error } = useGetCardsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  // Сохраняем карточки при загрузке
  useEffect(() => {
    if (data) {
      setCards(data);

      // Собираем все SKU для запроса остатков
      const allSKUs = data.flatMap(
        (card: any) => card.sizes?.flatMap((s: any) => s.skus) || []
      );

      if (allSKUs.length > 0) {
        setLoadingStock(true);
        fetch(
          `https://nazar-backend.333.kg/api/wb/stocks?sku=${allSKUs.join(",")}`
        )
          .then((res) => res.json())
          .then((stockData) => {
            // stockData предполагаем в формате [{sku: '123', amount: 10}, ...]
            const stockMap: StockData = {};
            stockData.forEach((item: any) => {
              stockMap[item.sku] = item.amount ?? 0;
            });
            setStocks(stockMap);
          })
          .catch((err) => console.error("Ошибка получения остатков:", err))
          .finally(() => setLoadingStock(false));
      }
    }
  }, [data]);

  const filteredCards = cards.filter((card) => {
    if (search) {
      return (
        card.title.toLowerCase().includes(search.toLowerCase()) ||
        card.brand?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  if (isLoading) return <Spin tip="Загрузка карточек..." />;
  if (error) return <Text type="danger">Ошибка загрузки карточек</Text>;

  return (
    <div style={{ padding: 20 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>
        Карточки WB
      </Title>

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Input
          placeholder="Поиск по названию или бренду"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300, marginBottom: 8 }}
        />
        <Radio.Group
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
        >
          <Radio.Button value="grid">Карточки</Radio.Button>
          <Radio.Button value="table">Таблица</Radio.Button>
        </Radio.Group>
      </div>

      <Tabs
        activeKey={tabKey}
        onChange={setTabKey as any}
        type="card"
        style={{ marginBottom: 16 }}
      >
        <TabPane tab="Все" key="all" />
        <TabPane tab="По бренду" key="brand" />
      </Tabs>

      {viewMode === "grid" ? (
        <Row gutter={[16, 16]}>
          {filteredCards.map((card) => (
            <Col xs={24} sm={12} md={8} lg={6} key={card.nmUUID}>
              <Card title={card.title} bordered hoverable>
                <Text strong>Бренд: </Text>
                <Text>{card.brand || "-"}</Text>
                <br />
                <Text strong>Артикул: </Text>
                <Text>{card.vendorCode}</Text>
                <br />
                <Text strong>ID товара: </Text>
                <Text>{card.nmID}</Text>
                <br />
                <Text strong>Остатки по SKU: </Text>
                {loadingStock ? (
                  <Spin size="small" />
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {card.sizes
                      ?.flatMap((s: any) => s.skus)
                      .map((sku: string) => (
                        <li key={sku}>
                          {sku}: {stocks[sku] ?? "-"}
                        </li>
                      )) ?? "-"}
                  </ul>
                )}
                <Text strong>Размеры: </Text>
                <Text>{`Д: ${card.dimensions.length || 0}, Ш: ${
                  card.dimensions.width || 0
                }, В: ${card.dimensions.height || 0}, Вес: ${
                  card.dimensions.weightBrutto || 0
                } кг`}</Text>
                <br />
                <Text strong>SKU: </Text>
                <Text>
                  {card.sizes.map((s: any) => s.skus.join(", ")).join("; ")}
                </Text>
                <br />
                <Text strong>Описание: </Text>
                <Text>{card.description || "-"}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Бренд</th>
              <th>Артикул</th>
              <th>ID товара</th>
              <th>Размеры</th>
              <th>SKU</th>
              <th>Остаток</th>
            </tr>
          </thead>
          <tbody>
            {filteredCards.map((card) => (
              <tr key={card.nmUUID} style={{ borderBottom: "1px solid #eee" }}>
                <td>{card.title}</td>
                <td>{card.brand || "-"}</td>
                <td>{card.vendorCode}</td>
                <td>{card.nmID}</td>
                <td>{`Д: ${card.dimensions.length}, Ш: ${card.dimensions.width}, В: ${card.dimensions.height}, Вес: ${card.dimensions.weightBrutto}`}</td>
                <td>
                  {card.sizes.map((s: any) => s.skus.join(", ")).join("; ")}
                </td>
                <td>
                  {loadingStock ? (
                    <Spin size="small" />
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {card.sizes
                        ?.flatMap((s: any) => s.skus)
                        .map((sku: string) => (
                          <li key={sku}>
                            {sku}: {stocks[sku] ?? "-"}
                          </li>
                        )) ?? "-"}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CardsListWB;
