import { useRef, useState } from "react";
import { Button, Divider, Space, message } from "antd";
import { useReactToPrint } from "react-to-print";
import type { HeaderValues } from "./components/PrihodHeaderForm";
import type { GoodsItem } from "./components/PrihodGoodsTable";
import PrihodHeaderForm from "./components/PrihodHeaderForm";
import PrihodGoodsTable from "./components/PrihodGoodsTable";
import PrihodPrint from "./components/PrihodPrint";

const PrihodPage = () => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Приходная накладная",
  });

  const [header, setHeader] = useState<HeaderValues | null>(null);
  const [items, setItems] = useState<GoodsItem[]>([]);

  const handleSave = () => {
    if (!header || items.length === 0) {
      message.error("Заполните шапку и товары");
      return;
    }
    message.success("Документ проведён");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Приходная накладная</h2>

      <PrihodHeaderForm onChange={setHeader} />

      <Divider />

      <PrihodGoodsTable
        items={items}
        onAdd={(item: any) => setItems((p) => [...p, item])}
      />

      <Divider />

      <Space>
        <Button type="primary" onClick={handleSave}>
          Провести
        </Button>

        <Button onClick={handlePrint}>Печать</Button>
      </Space>

      {/* Печатная форма */}
      <div style={{ display: "none" }}>
        <PrihodPrint ref={printRef} header={header} items={items} />
      </div>
    </div>
  );
};

export default PrihodPage;
