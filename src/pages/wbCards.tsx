import { useState, useEffect } from "react";
import { Table, Input, Button, Drawer, Typography, Spin } from "antd";
import { useLazyGetCardsQuery } from "../store/api/cardsApi";

const { Title, Text } = Typography;

interface StockData {
  [sku: string]: number;
}

const CardsListWB = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [cursor, setCursor] = useState<any>(null);
  const [search, setSearch] = useState("");

  const [stocks, setStocks] = useState<StockData>({});
  const [loadingStock, setLoadingStock] = useState(false);

  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [fetchCards, { isFetching }] = useLazyGetCardsQuery();

  const loadCards = async (nextCursor?: any) => {
    try {
      const res: any = await fetchCards(nextCursor).unwrap();

      const newCards = [...cards, ...res.cards];

      setCards(newCards);
      setCursor(res.cursor);

      loadStocks(newCards);
    } catch (err) {
      console.error("Ошибка загрузки карточек:", err);
    }
  };

  const loadStocks = async (cardsList: any[]) => {
    const allSKUs = [
      ...new Set(
        cardsList.flatMap(
          (card: any) => card.sizes?.flatMap((s: any) => s.skus) || []
        )
      ),
    ];

    if (!allSKUs.length) return;

    setLoadingStock(true);

    try {
      const res = await fetch(
        `https://nazar-backend.333.kg/api/wb/stocks?sku=${allSKUs.join(",")}`
      );

      const stockData = await res.json();

      const stockMap: StockData = {};

      stockData.forEach((item: any) => {
        stockMap[item.sku] = item.amount ?? 0;
      });

      setStocks(stockMap);
    } catch (err) {
      console.error("Ошибка получения остатков:", err);
    } finally {
      setLoadingStock(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const filtered = cards.filter(
    (card) =>
      card.title?.toLowerCase().includes(search.toLowerCase()) ||
      card.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "Фото",
      render: (_: any, record: any) =>
        record.photos?.[0]?.tm && (
          <img src={record.photos[0].tm} style={{ width: 50 }} />
        ),
    },
    {
      title: "Название",
      dataIndex: "title",
    },
    {
      title: "Бренд",
      dataIndex: "brand",
    },
    {
      title: "Артикул",
      dataIndex: "vendorCode",
    },
    {
      title: "ID",
      dataIndex: "nmID",
    },
    {
      title: "SKU",
      render: (_: any, record: any) =>
        record.sizes?.map((s: any) => s.skus.join(", ")).join("; "),
    },
    {
      title: "Количество",
      render: (_: any, record: any) => {
        if (loadingStock) return <Spin size="small" />;

        const skus = record.sizes?.flatMap((s: any) => s.skus) || [];

        const total = skus.reduce(
          (sum: number, sku: string) => sum + (stocks[sku] || 0),
          0
        );

        return total;
      },
    },
    {
      title: "Действие",
      render: (_: any, record: any) => (
        <Button
          onClick={() => {
            setSelectedCard(record);
            setDrawerOpen(true);
          }}
        >
          Подробнее
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Карточки WB</Title>

      <Input
        placeholder="Поиск по названию или бренду"
        style={{ width: 300, marginBottom: 20 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Table
        rowKey="nmID"
        columns={columns}
        dataSource={filtered}
        loading={isFetching}
        pagination={false}
      />

      <div style={{ marginTop: 20 }}>
        <Button onClick={() => loadCards(cursor)} disabled={!cursor}>
          Загрузить ещё
        </Button>
      </div>

      <Drawer
        title="Карточка товара"
        width={500}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedCard && (
          <div>
            <img
              src={selectedCard.photos?.[0]?.big}
              style={{ width: "100%", marginBottom: 20 }}
            />

            <Text strong>Название:</Text>
            <div>{selectedCard.title}</div>

            <Text strong>Бренд:</Text>
            <div>{selectedCard.brand}</div>

            <Text strong>Описание:</Text>
            <div>{selectedCard.description}</div>

            <Text strong>Артикул:</Text>
            <div>{selectedCard.vendorCode}</div>

            <Text strong>ID:</Text>
            <div>{selectedCard.nmID}</div>

            <Text strong>Размеры:</Text>
            <div>
              Д: {selectedCard.dimensions?.length} <br />
              Ш: {selectedCard.dimensions?.width} <br />
              В: {selectedCard.dimensions?.height} <br />
              Вес: {selectedCard.dimensions?.weightBrutto}
            </div>

            <Text strong>SKU и остатки:</Text>

            {selectedCard.sizes?.map((s: any) =>
              s.skus.map((sku: string) => (
                <div key={sku}>
                  {sku} — {stocks[sku] ?? 0} шт
                </div>
              ))
            )}

            <Text strong>Создано:</Text>
            <div>{selectedCard.createdAt}</div>

            <Text strong>Обновлено:</Text>
            <div>{selectedCard.updatedAt}</div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CardsListWB;
