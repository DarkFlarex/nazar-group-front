import React from "react";
import type { HeaderValues } from "./PrihodHeaderForm";
import type { GoodsItem } from "./PrihodGoodsTable";

interface Props {
  header: HeaderValues | null;
  items: GoodsItem[];
}

const PrihodPrint = React.forwardRef<HTMLDivElement, Props>(
  ({ header, items }, ref) => {
    if (!header) return null;

    return (
      <div ref={ref} style={{ padding: 24 }}>
        <h2 style={{ textAlign: "center" }}>ПРИХОДНАЯ НАКЛАДНАЯ</h2>

        <p>Поставщик: {header.supplier}</p>
        <p>Склад: {header.warehouse}</p>
        <p>Дата: {header.docDate}</p>

        <table width="100%" border={1} cellPadding={4}>
          <thead>
            <tr>
              <th>№</th>
              <th>Товар</th>
              <th>Кол-во</th>
              <th>Цена</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={i.key}>
                <td>{idx + 1}</td>
                <td>{i.product}</td>
                <td>{i.quantity}</td>
                <td>{i.priceKgs}</td>
                <td>{i.totalKgs}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ marginTop: 32 }}>Ответственный ______________________</p>
      </div>
    );
  }
);

export default PrihodPrint;
