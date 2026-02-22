import React, { useRef, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Divider,
  Table,
  Space,
  message,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useReactToPrint } from "react-to-print";
import { useGetgoodsQuery } from "../../store/api/goodsApi";

/* ================= TYPES ================= */

interface Product {
  guid: string;
  nameid: string;
  manufacturer: string;
  articul: string;
  manufacturer_number: string;
  original_number: string;
  gross_weight: number | null;
}

interface HeaderValues {
  docNumber: string;
  docDate: string;
  supplier: string;
  warehouse: string;
}

interface GoodsItem {
  key: string;
  productGuid?: string;
  productName?: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

/* ================= COMPONENT ================= */

const PrihodPage: React.FC = () => {
  const { data: products = [] } = useGetgoodsQuery();
  const printRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm();

  const [header, setHeader] = useState<HeaderValues | null>(null);
  const [items, setItems] = useState<GoodsItem[]>([]);

  /* ================= PRINT ================= */

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Приходная накладная",
  });

  /* ================= HEADER ================= */

  const handleValuesChange = (_: any, allValues: any) => {
    setHeader({
      ...allValues,
      docDate: allValues.docDate
        ? (allValues.docDate as Dayjs).format("DD.MM.YYYY")
        : "",
    });
  };

  /* ================= GOODS ================= */

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        key: Date.now().toString(),
        quantity: 1,
        price: 0,
        discount: 0,
        total: 0,
      },
    ]);
  };

  const updateRow = (key: string, field: keyof GoodsItem, value: any) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row;

        const updated = { ...row, [field]: value };

        const sum =
          (updated.quantity || 0) * (updated.price || 0);

        const discountSum = sum * ((updated.discount || 0) / 100);

        updated.total = sum - discountSum;

        return updated;
      })
    );
  };

  const deleteRow = (key: string) => {
    setItems((prev) => prev.filter((x) => x.key !== key));
  };

  /* ================= TABLE ================= */

  const columns = [
    {
      title: "Товар",
      render: (_: any, record: GoodsItem) => (
        <Select
          style={{ width: 400 }}
          showSearch
          placeholder="Выберите товар"
          value={record.productGuid}
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={(val) => {
            const product = products.find(
              (p: Product) => p.guid === val
            );

            updateRow(record.key, "productGuid", val);
            updateRow(record.key, "productName", product?.nameid);
          }}
          options={products.map((p: Product) => ({
            value: p.guid,
            label: `${p.nameid} | ${p.manufacturer} | ${p.articul}`,
          }))}
        />
      ),
    },
    {
      title: "Кол-во",
      render: (_: any, record: GoodsItem) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) =>
            updateRow(record.key, "quantity", val || 0)
          }
        />
      ),
    },
    {
      title: "Цена",
      render: (_: any, record: GoodsItem) => (
        <InputNumber
          min={0}
          value={record.price}
          onChange={(val) =>
            updateRow(record.key, "price", val || 0)
          }
        />
      ),
    },
    {
      title: "Скидка %",
      render: (_: any, record: GoodsItem) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discount}
          onChange={(val) =>
            updateRow(record.key, "discount", val || 0)
          }
        />
      ),
    },
    {
      title: "Сумма",
      dataIndex: "total",
    },
    {
      title: "",
      render: (_: any, record: GoodsItem) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => deleteRow(record.key)}
        />
      ),
    },
  ];

  /* ================= SAVE ================= */

  const handleSave = () => {
    if (!header || items.length === 0) {
      message.error("Заполните шапку и товары");
      return;
    }

    console.log("HEADER:", header);
    console.log("ITEMS:", items);

    message.success("Документ проведён");
  };

  const totalSum = items.reduce((acc, x) => acc + x.total, 0);

  /* ================= RENDER ================= */

  return (
    <div style={{ padding: 24 }}>
      <h2>Приходная накладная</h2>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          docNumber: "000001",
          docDate: dayjs(),
        }}
        onValuesChange={handleValuesChange}
      >
        <Space size={16} wrap>
          <Form.Item name="docNumber" label="Номер">
            <Input disabled />
          </Form.Item>

          <Form.Item name="docDate" label="Дата">
            <DatePicker />
          </Form.Item>

          <Form.Item
            name="supplier"
            label="Поставщик"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="warehouse" label="Склад">
            <Input />
          </Form.Item>
        </Space>
      </Form>

      <Divider />

      <Button type="dashed" onClick={addRow}>
        Добавить строку
      </Button>

      <Table
        style={{ marginTop: 16 }}
        columns={columns}
        dataSource={items}
        pagination={false}
        rowKey="key"
      />

      <Divider />

      <div style={{ fontWeight: 600 }}>
        Итого: {totalSum.toFixed(2)}
      </div>

      <Space style={{ marginTop: 16 }}>
        <Button type="primary" onClick={handleSave}>
          Провести
        </Button>
        <Button onClick={handlePrint}>Печать</Button>
      </Space>

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <h3>Приходная накладная</h3>
          <p>Номер: {header?.docNumber}</p>
          <p>Дата: {header?.docDate}</p>
          <p>Поставщик: {header?.supplier}</p>
          <p>Итого: {totalSum.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default PrihodPage;
