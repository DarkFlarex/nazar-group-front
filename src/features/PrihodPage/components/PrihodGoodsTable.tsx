import { Table, InputNumber, Button } from "antd";
import { useState } from "react";

export interface GoodsItem {
  key: string;
  product: string;
  quantity: number;
  priceKgs: number;
  totalKgs: number;
}

interface Props {
  items: GoodsItem[];
  onAdd: (item: GoodsItem) => void;
}

const PrihodGoodsTable = ({ items, onAdd }: Props) => {
  const [qty, setQty] = useState(1);

  const addRow = () => {
    const price = 3200;
    onAdd({
      key: Date.now().toString(),
      product: "Зеркало боковое MB Sprinter",
      quantity: qty,
      priceKgs: price,
      totalKgs: price * qty,
    });
  };

  return (
    <>
      <Button onClick={addRow}>Добавить строку</Button>

      <Table
        size="small"
        bordered
        pagination={false}
        dataSource={items}
        rowKey="key"
        columns={[
          { title: "Товар", dataIndex: "product" },
          { title: "Кол-во", dataIndex: "quantity" },
          {
            title: "Цена (сом)",
            dataIndex: "priceKgs",
            render: (v) => v.toLocaleString(),
          },
          {
            title: "Сумма (сом)",
            dataIndex: "totalKgs",
            render: (v) => v.toLocaleString(),
          },
        ]}
        summary={(data) => {
          const totalQty = data.reduce((s, i) => s + i.quantity, 0);
          const totalSum = data.reduce((s, i) => s + i.totalKgs, 0);

          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={2}>
                Итого
              </Table.Summary.Cell>

              <Table.Summary.Cell index={2}>{totalQty}</Table.Summary.Cell>

              <Table.Summary.Cell index={3} />

              <Table.Summary.Cell index={4}>
                {totalSum.toLocaleString()} сом
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </>
  );
};

export default PrihodGoodsTable;
