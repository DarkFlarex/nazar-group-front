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
  useUpdateGoodsMutation,
  useUpdateStockMutation,
  useUpdateMarketplaceMutation,
} from "../../store/api/goodsApi";

const ProductsTableFull: React.FC = () => {
  const { data: products = [], refetch } = useGetgoodsQuery();
  const [updateGoods] = useUpdateGoodsMutation();
  const [updateStock] = useUpdateStockMutation();
  const [updateMarketplace] = useUpdateMarketplaceMutation();

  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Управление тремя Drawer
  const [openMain, setOpenMain] = useState(false);
  const [openStock, setOpenStock] = useState(false);
  const [openMarket, setOpenMarket] = useState(false);

  const [formMain] = Form.useForm();
  const [formStock] = Form.useForm();
  const [formMarket] = Form.useForm();

  const [searchText, setSearchText] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchText) return products;
    const lower = searchText.toLowerCase();
    return products.filter((p: any) =>
      Object.values(p).some(
        (val) => val && val.toString().toLowerCase().includes(lower)
      )
    );
  }, [products, searchText]);

  const handleEdit = (record: any) => {
    setEditingProduct(record);

    formMain.setFieldsValue({
      product_name: record.product_name,
      manufacturer: record.manufacturer?.[0],
      barcode: record.barcode,
      category_id: record.category_id,
      category_external_id: record.category_external_id,
    });

    formStock.setFieldsValue({
      stock_quantity: record.stock_quantity,
      reserve_quantity: record.reserve_quantity,
    });

    formMarket.setFieldsValue({
      ozon_sku: record.ozon_sku,
      ozon_product_id: record.ozon_product_id,
      ozon_name: record.ozon_name,
      wild_sku: record.wild_sku,
      wild_product_id: record.wild_product_id,
      wild_name: record.wild_name,
    });

    // открываем главное окно по умолчанию
    setOpenMain(true);
  };

  const handleMainSubmit = async (values: any) => {
    if (!editingProduct) return;
    try {
      await updateGoods({
        guid: editingProduct.guid,
        nameid: values.product_name,
        manufacturer: values.manufacturer,
        barcode: values.barcode,
        incoming_price: values.incoming_price,
        expence_price: values.expence_price,
        category_id: values.category_id,
        category_external_id: values.category_external_id,
      }).unwrap();

      message.success("Основные данные обновлены");
      setOpenMain(false);
      formMain.resetFields();
      refetch();
    } catch (error) {
      console.error(error);
      message.error("Ошибка обновления основных данных");
    }
  };

  const handleStockSubmit = async (values: any) => {
    if (!editingProduct) return;
    try {
      await updateStock({
        guid: editingProduct.guid,
        warehouse: "ABE22FD2-7A90-4789-8B1F-FFDC5C575E9C",
        stock_quantity: values.stock_quantity,
        reserve_quantity: values.reserve_quantity,
      }).unwrap();

      message.success("Остатки обновлены");
      setOpenStock(false);
      formStock.resetFields();
      refetch();
    } catch (error) {
      console.error(error);
      message.error("Ошибка обновления остатков");
    }
  };

  const handleMarketSubmit = async (values: any) => {
    if (!editingProduct) return;
    try {
      await updateMarketplace({
        guid: editingProduct.guid,
        ozon_sku: values.ozon_sku,
        ozon_product_id: values.ozon_product_id,
        ozon_name: values.ozon_name,
        wild_sku: values.wild_sku,
        wild_product_id: values.wild_product_id,
        wild_name: values.wild_name,
      }).unwrap();

      message.success("Маркетплейсы обновлены");
      setOpenMarket(false);
      formMarket.resetFields();
      refetch();
    } catch (error) {
      console.error(error);
      message.error("Ошибка обновления маркетплейсов");
    }
  };
  // const [searchText, setSearchText] = useState("");

  // const filteredProducts = useMemo(() => {
  //   if (!searchText) return products;
  //   const lower = searchText.toLowerCase();
  //   return products.filter((p: any) =>
  //     Object.values(p).some(
  //       (val) => val && val.toString().toLowerCase().includes(lower)
  //     )
  //   );
  // }, [products, searchText]);
  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Поиск ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90 }}
          >
            Поиск
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Сброс
          </Button>
        </Space>
      </div>
    ),
    onFilter: (value: any, record: any) => {
      const recordValue = record[dataIndex];
      return recordValue
        ? recordValue.toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
  });
  const columns = [
    {
      title: "Код",
      dataIndex: "codeid",
      sorter: (a: any, b: any) => (a.codeid || 0) - (b.codeid || 0),
      ...getColumnSearchProps("codeid"),
    },
    {
      title: "Наименование",
      dataIndex: "product_name",
      sorter: (a: any, b: any) => a.product_name.localeCompare(b.product_name),
      ...getColumnSearchProps("product_name"),
    },
    {
      title: "Производитель",
      dataIndex: "manufacturer",
      render: (record: any) => record.manufacturer?.[0] ?? "-",
      sorter: (a: any, b: any) =>
        (a.manufacturer?.[0] ?? "").localeCompare(b.manufacturer?.[0] ?? ""),
      ...getColumnSearchProps("manufacturer"),
    },
    {
      title: "Штрихкод",
      dataIndex: "barcode",
      sorter: (a: any, b: any) => (a.barcode || "").localeCompare(b.barcode),
      ...getColumnSearchProps("barcode"),
    },
    {
      title: "Закупочная",
      dataIndex: "incoming_price",
      sorter: (a: any, b: any) =>
        (a.incoming_price || 0) - (b.incoming_price || 0),
      ...getColumnSearchProps("incoming_price"),
    },
    {
      title: "Продажная",
      dataIndex: "expence_price",
      sorter: (a: any, b: any) =>
        (a.expence_price || 0) - (b.expence_price || 0),
      ...getColumnSearchProps("expence_price"),
    },
    {
      title: "На складе",
      dataIndex: "stock_quantity",
      sorter: (a: any, b: any) =>
        (a.stock_quantity || 0) - (b.stock_quantity || 0),
      ...getColumnSearchProps("stock_quantity"),
    },
    {
      title: "В резерве",
      dataIndex: "reserve_quantity",
      sorter: (a: any, b: any) =>
        (a.reserve_quantity || 0) - (b.reserve_quantity || 0),
      ...getColumnSearchProps("reserve_quantity"),
    },
    {
      title: "Доступно",
      dataIndex: "available_quantity",
      sorter: (a: any, b: any) =>
        (a.available_quantity || 0) - (b.available_quantity || 0),
      ...getColumnSearchProps("available_quantity"),
    },
    {
      title: "OZON SKU",
      dataIndex: "ozon_sku",
      sorter: (a: any, b: any) => (a.ozon_sku || "").localeCompare(b.ozon_sku),
      ...getColumnSearchProps("ozon_sku"),
    },
    {
      title: "OZON Product ID",
      dataIndex: "ozon_product_id",
      sorter: (a: any, b: any) =>
        (a.ozon_product_id || "").localeCompare(b.ozon_product_id),
      ...getColumnSearchProps("ozon_product_id"),
    },
    {
      title: "OZON Name",
      dataIndex: "ozon_name",
      sorter: (a: any, b: any) =>
        (a.ozon_name || "").localeCompare(b.ozon_name),
      ...getColumnSearchProps("ozon_name"),
    },
    {
      title: "Wild SKU",
      dataIndex: "wild_sku",
      sorter: (a: any, b: any) => (a.wild_sku || "").localeCompare(b.wild_sku),
      ...getColumnSearchProps("wild_sku"),
    },
    {
      title: "Wild Product ID",
      dataIndex: "wild_product_id",
      sorter: (a: any, b: any) =>
        (a.wild_product_id || "").localeCompare(b.wild_product_id),
      ...getColumnSearchProps("wild_product_id"),
    },
    {
      title: "Wild Name",
      dataIndex: "wild_name",
      sorter: (a: any, b: any) =>
        (a.wild_name || "").localeCompare(b.wild_name),
      ...getColumnSearchProps("wild_name"),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Глобальный поиск по всем полям"
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
        onRow={(record) => ({
          onClick: () => handleEdit(record),
        })}
        bordered
        size="small"
        pagination={{ pageSize: 10 }}
      />

      {/* Основные данные */}
      <Drawer
        title="Основные данные товара"
        open={openMain}
        width={400}
        onClose={() => setOpenMain(false)}
      >
        <Form form={formMain} layout="vertical" onFinish={handleMainSubmit}>
          <Form.Item name="product_name" label="Наименование">
            <Input />
          </Form.Item>
          <Form.Item name="manufacturer" label="Производитель">
            <Input />
          </Form.Item>
          <Form.Item name="barcode" label="Штрихкод">
            <Input />
          </Form.Item>
          <Form.Item name="incoming_price" label="Закупочная (Цена)">
            <Input />
          </Form.Item>
          <Form.Item name="expence_price" label="Продажная (Цена)">
            <Input />
          </Form.Item>
          <Form.Item name="category_id" label="Категория ID">
            <Input />
          </Form.Item>
          <Form.Item name="category_external_id" label="Внешний ID категории">
            <Input />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Сохранить
            </Button>
            <Button onClick={() => setOpenMain(false)}>Отмена</Button>
            <Button
              type="default"
              onClick={() => {
                setOpenMain(false);
                setOpenStock(true);
              }}
            >
              Редактировать остатки
            </Button>
            <Button
              type="default"
              onClick={() => {
                setOpenMain(false);
                setOpenMarket(true);
              }}
            >
              Редактировать маркетплейсы
            </Button>
          </Space>
        </Form>
      </Drawer>

      {/* Остатки склада */}
      <Drawer
        title="Остатки склада"
        open={openStock}
        width={400}
        onClose={() => setOpenStock(false)}
      >
        <Form form={formStock} layout="vertical" onFinish={handleStockSubmit}>
          <Form.Item name="stock_quantity" label="Остаток на складе">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="reserve_quantity" label="В резерве">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Сохранить
            </Button>
            <Button onClick={() => setOpenStock(false)}>Отмена</Button>
          </Space>
        </Form>
      </Drawer>

      {/* Маркетплейсы */}
      <Drawer
        title="Маркетплейсы"
        open={openMarket}
        width={400}
        onClose={() => setOpenMarket(false)}
      >
        <Form form={formMarket} layout="vertical" onFinish={handleMarketSubmit}>
          <Form.Item name="ozon_sku" label="OZON SKU">
            <Input />
          </Form.Item>
          <Form.Item name="ozon_product_id" label="OZON Product ID">
            <Input />
          </Form.Item>
          <Form.Item name="ozon_name" label="OZON Name">
            <Input />
          </Form.Item>
          <Form.Item name="wild_sku" label="Wild SKU">
            <Input />
          </Form.Item>
          <Form.Item name="wild_product_id" label="Wild Product ID">
            <Input />
          </Form.Item>
          <Form.Item name="wild_name" label="Wild Name">
            <Input />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Сохранить
            </Button>
            <Button onClick={() => setOpenMarket(false)}>Отмена</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
};

export default ProductsTableFull;
