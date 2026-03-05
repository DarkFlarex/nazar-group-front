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
import { useGetAllgoodsQuery } from "../../store/api/goodsApi";
import { useGoodsIncomeMutation } from "../../store/api/invoiceApi";

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
  docDate: any;
  supplier: string;
  warehouse: string;
}

interface GoodsItem {
  key: string;
  productGuid?: string;
  productName?: string;
  quantity: number;
  incoming_price: number; // 🔥 новое поле
  price: number; // можно оставить если нужно
  discount: number;
  total: number;
}

/* ================= COMPONENT ================= */

const PrihodPage: React.FC = () => {
  const { data: products = [] } = useGetAllgoodsQuery();
  const printRef = useRef<any>(null);
  const [scanValue, setScanValue] = useState("");
  const [form] = Form.useForm();
  const [goodsIncome] = useGoodsIncomeMutation();
  const [header, setHeader] = useState<HeaderValues | null>(null);
  const [items, setItems] = useState<GoodsItem[]>([]);

  /* ================= PRINT ================= */

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Приходная накладная",
  } as any);

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
        incoming_price: 0, // 🔥
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

        const sum = (updated.quantity || 0) * (updated.incoming_price || 0);

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
          filterOption={(input, option) => {
            const search = input.toLowerCase();

            return (
              option?.nameid?.toLowerCase().includes(search) ||
              option?.articul?.toLowerCase().includes(search) ||
              option?.barcode?.toLowerCase().includes(search)
            );
          }}
          onChange={(val) => {
            const product = products.find((p: Product) => p.guid === val);

            updateRow(record.key, "productGuid", val);
            updateRow(record.key, "productName", product?.nameid);
          }}
          options={products.map((p: any) => ({
            value: p.guid,
            label: `${p.nameid} | ${p.manufacturer} | ${p.articul} | ${p.barcode}`,
            nameid: p.nameid,
            manufacturer: p.manufacturer,
            articul: p.articul,
            barcode: p.barcode,
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
          onChange={(val) => updateRow(record.key, "quantity", val || 0)}
        />
      ),
    },
    {
      title: "Цена",
      render: (_: any, record: GoodsItem) => (
        <InputNumber
          min={0}
          value={record.incoming_price}
          onChange={(val) => updateRow(record.key, "incoming_price", val || 0)}
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
          onChange={(val) => updateRow(record.key, "discount", val || 0)}
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

  const handleSave = async () => {
    if (!header || items.length === 0) {
      message.error("Заполните шапку и товары");
      return;
    }

    const payload = {
      doc_number: header.docNumber,
      doc_date: header.docDate
        ? header.docDate instanceof Date
          ? header.docDate
          : new Date(header.docDate) // <-- приводим к JS Date
        : undefined,
      supplier: header.supplier,
      warehouse: header.warehouse,
      goods: items.map((item) => ({
        product_guid: item.productGuid,
        quantity: item.quantity,
        incoming_price: item.incoming_price, // 🔥
        discount: item.discount,
        total: item.total,
      })),
      total_sum: totalSum,
    };

    try {
      await goodsIncome(payload).unwrap();

      message.success("Документ успешно проведён");

      form.resetFields();
      setItems([]);
      setHeader(null);
    } catch (error) {
      console.error(error);
      message.error("Ошибка при сохранении документа");
    }
  };

  const totalSum = items.reduce((acc, x) => acc + x.total, 0);

  const handleBarcodeScan = () => {
    if (!scanValue.trim()) return;

    const search = scanValue.trim().toLowerCase();

    let product = products.find(
      (p: any) => p.barcode?.toLowerCase() === search
    );

    if (!product) {
      product = products.find((p: any) => p.articul?.toLowerCase() === search);
    }

    if (!product) {
      message.error("Товар с таким штрихкодом не найден");
      setScanValue("");
      return;
    }

    setItems((prev: any) => {
      const existing = prev.find((x: any) => x.productGuid === product.guid);

      if (existing) {
        return prev.map((row: any) => {
          if (row.productGuid !== product.guid) return row;

          const newQty = row.quantity + 1;
          const sum = newQty * (row.incoming_price || 0);
          const discountSum = sum * ((row.discount || 0) / 100);

          return {
            ...row,
            quantity: newQty,
            total: sum - discountSum,
          };
        });
      }

      return [
        ...prev,
        {
          key: Date.now().toString(),
          productGuid: product.guid,
          productName: product.nameid,
          quantity: 1,
          incoming_price: product.incoming_price,
          discount: 0,
          total: 0,
        },
      ];
    });

    setScanValue("");
  };
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
        </Space>
      </Form>

      <Divider />

      <Space style={{ marginBottom: 16 }}>
        <Button type="dashed" onClick={addRow}>
          Добавить строку
        </Button>

        <Input
          placeholder="Сканируйте штрихкод"
          value={scanValue}
          onChange={(e) => setScanValue(e.target.value)}
          onPressEnter={handleBarcodeScan}
          style={{ width: 250 }}
          autoFocus
        />
      </Space>

      <Table
        style={{ marginTop: 16 }}
        columns={columns}
        dataSource={items}
        pagination={false}
        rowKey="key"
      />

      <Divider />

      <div style={{ fontWeight: 600 }}>Итого: {totalSum.toFixed(2)}</div>

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
