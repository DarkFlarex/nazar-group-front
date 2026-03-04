import React, { useState, useMemo } from "react";
import {
  Table,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Space,
  message,
} from "antd";
import {
  useGetgoodsQuery,
  useUpdateGoodsFullMutation,
} from "../../store/api/goodsApi";

const ProductsTableFull: React.FC = () => {
  const { data: products = [], refetch } = useGetgoodsQuery();
  const [updateGoodsFull] = useUpdateGoodsFullMutation();

  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form] = Form.useForm();

  // ================= SEARCH =================
  const [searchText, setSearchText] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchText) return products;
    const lower = searchText.toLowerCase();
    return products.filter(
      (p: any) =>
        p.product_name?.toLowerCase().includes(lower) ||
        p.barcode?.toLowerCase().includes(lower)
    );
  }, [products, searchText]);

  /* ================= EDIT ================= */

  const handleEdit = (record: any) => {
    setEditingProduct(record);

    form.setFieldsValue({
      product_name: record.product_name,
      manufacturer: record.manufacturer?.[0],
      barcode: record.barcode,
      incoming_price: record.incoming_price,
      expence_price: record.expence_price,
      stock_quantity: record.stock_quantity,
      reserve_quantity: record.reserve_quantity,
      marketplace_sku: record.marketplace_sku,
      marketplace_product_id: record.marketplace_product_id,
      category_id: record.category_id,
      category_external_id: record.category_external_id,
    });

    setOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (!editingProduct) return;

    try {
      await updateGoodsFull({
        guid: editingProduct.guid,
        nameid: values.product_name,
        manufacturer: values.manufacturer,
        barcode: values.barcode,
        incoming_price: values.incoming_price,
        expence_price: values.expence_price,
        warehouse: "ABE22FD2-7A90-4789-8B1F-FFDC5C575E9C",
        stock_quantity: values.stock_quantity,
        reserve_qty: values.reserve_quantity,
        reserve_status: null,
        marketplace_guid: null,
        marketplace_sku: values.marketplace_sku,
        marketplace_product_id: values.marketplace_product_id,
        category_id: values.category_id,
        category_external_id: values.category_external_id,
      }).unwrap();

      message.success("Товар обновлён");
      setOpen(false);
      setEditingProduct(null);
      refetch();
    } catch (err) {
      message.error("Ошибка обновления");
    }
  };

  /* ================= TABLE COLUMNS ================= */

  const columns = [
    { title: "Код", dataIndex: "codeid" },
    { title: "Наименование", dataIndex: "product_name" },
    {
      title: "Производитель",
      render: (record: any) => record.manufacturer?.[0] ?? "-",
    },
    { title: "Штрихкод", dataIndex: "barcode" },
    { title: "Закупочная", dataIndex: "incoming_price" },
    { title: "Продажная", dataIndex: "expence_price" },
    { title: "На складе", dataIndex: "stock_quantity" },
    { title: "В резерве", dataIndex: "reserve_quantity" },
    { title: "Доступно", dataIndex: "available_quantity" },
    {
      title: "Редактировать",
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          Ред
        </Button>
      ),
    },
  ];

  /* ================= RENDER ================= */

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Поиск по наименованию или штрихкоду"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </Space>

      <Table
        dataSource={filteredProducts}
        columns={columns}
        rowKey="guid"
        bordered
        size="small"
        pagination={{ pageSize: 15 }}
      />

      <Drawer
        title="Редактирование товара"
        open={open}
        width={500}
        onClose={() => setOpen(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="product_name" label="Наименование">
            <Input />
          </Form.Item>
          <Form.Item name="manufacturer" label="Производитель">
            <Input />
          </Form.Item>
          <Form.Item name="barcode" label="Штрихкод">
            <Input />
          </Form.Item>
          <Form.Item name="incoming_price" label="Закупочная цена">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="expence_price" label="Продажная цена">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="stock_quantity" label="Остаток на складе">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="reserve_quantity" label="В резерве">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="marketplace_sku" label="Marketplace SKU">
            <Input />
          </Form.Item>
          <Form.Item
            name="marketplace_product_id"
            label="Marketplace Product ID"
          >
            <Input />
          </Form.Item>
          <Form.Item name="category_id" label="Category ID">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="category_external_id" label="Category External ID">
            <Input />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Сохранить
            </Button>
            <Button onClick={() => setOpen(false)}>Отмена</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
};

export default ProductsTableFull;
