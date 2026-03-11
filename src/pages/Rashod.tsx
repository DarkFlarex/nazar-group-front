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
import { useGetAllgoodsQuery } from "../store/api/goodsApi";
import { useGoodsExpenseMutation } from "../store/api/invoiceApi";

/* ================= TYPES ================= */
interface Product {
  guid: string;
  nameid: string;
  manufacturer: string;
  articul: string;
  barcode: string;
  incoming_price: number;
}

interface HeaderValues {
  docNumber: string;
  docDate: any;
  customer: string;
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
const RashodPage: React.FC = () => {
  const { data: products = [] } = useGetAllgoodsQuery();
  const printRef = useRef<any>(null);
  const [form] = Form.useForm();
  const [goodsSale, { isLoading }] = useGoodsExpenseMutation();
  const [header, setHeader] = useState<HeaderValues | null>(null);
  const [items, setItems] = useState<GoodsItem[]>([]);
  const [scanValue, setScanValue] = useState("");

  /* ================= PRINT ================= */
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Расходная накладная",
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
        const sum = (updated.quantity || 0) * (updated.price || 0);
        const discountSum = sum * ((updated.discount || 0) / 100);
        updated.total = sum - discountSum;
        return updated;
      })
    );
  };

  const deleteRow = (key: string) =>
    setItems((prev) => prev.filter((x) => x.key !== key));

  const handleBarcodeScan = () => {
    if (!scanValue.trim()) return;

    const search = scanValue.trim().toLowerCase();

    let product = products.find(
      (p: any) =>
        p.barcode?.toLowerCase() === search ||
        p.articul?.toLowerCase() === search
    );

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
          const sum = newQty * (row.price || product.incoming_price || 0);
          return { ...row, quantity: newQty, total: sum };
        });
      }

      return [
        ...prev,
        {
          key: Date.now().toString(),
          productGuid: product.guid,
          productName: product.nameid,
          quantity: 1,
          price: product.incoming_price || 0,
          discount: 0,
          total: product.incoming_price || 0,
        },
      ];
    });

    setScanValue("");
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
          options={products.map((p: Product) => ({
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
          value={record.price}
          onChange={(val) => updateRow(record.key, "price", val || 0)}
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

  /* ================= TOTAL ================= */
  const totalSum = items.reduce((acc, x) => acc + x.total, 0);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!header || items.length === 0) {
      message.error("Заполните шапку и товары");
      return;
    }

    const payload = {
      docdate: header.docDate,
      docnumber: header.docNumber,
      customer: header.customer,
      warehouse: header.warehouse,
      totalsum: totalSum,
      goods: items.map((item) => ({
        goodid: item.productGuid,
        count: item.quantity,
        price: item.price,
        discount: item.discount,
        total: item.total,
      })),
    };

    try {
      await goodsSale(payload).unwrap();
      message.success("Расходная накладная проведена.");
      form.resetFields();
      setItems([]);
      setHeader(null);
    } catch (err: any) {
      console.error(err);
      message.error("Ошибка при проведении расходной накладной");
    }
  };

  /* ================= RENDER ================= */
  return (
    <div>
      <h2>Расходная накладная</h2>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ docNumber: "000001", docDate: dayjs() }}
        onValuesChange={handleValuesChange}
      >
        <Space size={16} wrap>
          <Form.Item name="docNumber" label="Номер">
            <Input />
          </Form.Item>

          <Form.Item name="docDate" label="Дата">
            <DatePicker />
          </Form.Item>

          <Form.Item
            name="customer"
            label="Клиент"
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
        columns={columns.map((col) => ({
          ...col,
          onHeaderCell: () => ({
            style: { whiteSpace: "nowrap" }, // предотвращает перенос строки в заголовке
          }),
        }))}
        dataSource={items}
        pagination={false}
        rowKey="key"
      />

      <Divider />

      <div style={{ fontWeight: 600 }}>Итого: {totalSum.toFixed(2)}</div>

      <Space style={{ marginTop: 16 }}>
        <Button type="primary" onClick={handleSave} loading={isLoading}>
          Провести
        </Button>
        <Button onClick={handlePrint}>Печать</Button>
      </Space>

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <h3>Расходная накладная</h3>
          <p>Номер: {header?.docNumber}</p>
          <p>Дата: {header?.docDate}</p>
          <p>Клиент: {header?.customer}</p>
          <p>Итого: {totalSum.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default RashodPage;
