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
  Image,
  Divider,
} from "antd";
import {
  useGetgoodsQuery,
  useUpdateGoodsMutation,
  useUpdateStockMutation,
  useUpdateMarketplaceMutation,
} from "../../store/api/goodsApi";

// TODO: замените на реальный базовый URL для фотографий
const PHOTO_BASE_URL = "https://nazar-backend.333.kg/uploads/";

const ProductsTableFull: React.FC = () => {
  const { data: products = [], refetch } = useGetgoodsQuery();
  const [updateGoods] = useUpdateGoodsMutation();
  const [updateStock] = useUpdateStockMutation();
  const [updateMarketplace] = useUpdateMarketplaceMutation();

  const [editingProduct, setEditingProduct] = useState<any>(null);

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
      manufacturer: record.manufacturer?.[0] ?? "",
      barcode: record.barcode,
      incoming_price: record.incoming_price,
      expence_price: record.expence_price,
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
      ozon_account_id: record.ozon_account_id,
      ozon_name: record.ozon_name,

      wild_sku: record.wild_sku,
      wild_product_id: record.wild_product_id,
      wild_account_id: record.wild_account_id,
      wild_name: record.wild_name,
    });

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
        ozon_account_id: values.ozon_account_id,

        wild_sku: values.wild_sku,
        wild_product_id: values.wild_product_id,
        wild_account_id: values.wild_account_id,
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
            onClick={() => clearFilters?.()}
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
      title: "Фото",
      dataIndex: "photos",
      width: 70,
      render: (photos: any[]) => {
        const firstPhoto = photos?.[0];

        if (!firstPhoto) {
          return (
            <div
              style={{
                width: 48,
                height: 48,
                background: "#f0f0f0",
                border: "1px dashed #d9d9d9",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#bbb",
              }}
            >
              Нет фото
            </div>
          );
        }

        return (
          <Image
            src={`${PHOTO_BASE_URL}${firstPhoto.photo_url}`}
            width={48}
            height={48}
            style={{ objectFit: "cover", borderRadius: 4, cursor: "pointer" }}
            preview={false}
            onClick={(e) => {
              e.stopPropagation();
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABo0lEQVR4nO2YzUrDQBDHc6qXHjx48CKKd/EBfAAFH8CLJ+/iQfAiHsSDB8GDB/EgXoSDB8GDB8GDB8GDB8GDB8GDB8GDiIjIJptkk91kMyubLGw2aZJNN7vZJv8fDCwzk5l/ZnaXCCGEEEL+MRFC+OjEGJMxxlillFJKlVLKGGOstdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmv/s9ba+2+ttffeW2vvvbfW3ntrrbX33lprrb33Wmu5z5RSSimllFJKKaWUUkoppZRSSikVEZGIiERERERERERERERERERERERERERERERERERERETENyJylFLKHCil1EgpdQNgB8AxgBcAL0opJUQkIiIioULIPQDfAN4BvALYBbAF4ADAAwBXABYBLACYBzAHYBbANIBJABMAzs6BHwBOAZwAOARwAOAQwAECgIPnAXgAeAAeAB4AHgAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQkiInwCPisMiVF8LYQAAAABJRU5ErkJggg=="
          />
        );
      },
    },
    {
      title: "Код",
      dataIndex: "articul",
      sorter: (a: any, b: any) => (a.articul || 0) - (b.articul || 0),
      ...getColumnSearchProps("articul"),
    },
    {
      title: "Наименование",
      dataIndex: "product_name",
      sorter: (a: any, b: any) =>
        (a.product_name || "").localeCompare(b.product_name || ""),
      ...getColumnSearchProps("product_name"),
    },
    {
      title: "ОЕМ",
      dataIndex: "original_number",
      sorter: (a: any, b: any) =>
        (a.original_number || "").localeCompare(b.original_number || ""),
      ...getColumnSearchProps("original_number"),
    },
    {
      title: "Производитель",
      dataIndex: "manufacturer",
      render: (manufacturer: any) => manufacturer?.[0] ?? "-",
      sorter: (a: any, b: any) =>
        (a.manufacturer?.[0] ?? "").localeCompare(b.manufacturer?.[0] ?? ""),
      ...getColumnSearchProps("manufacturer"),
    },
    {
      title: "Штрихкод",
      dataIndex: "barcode",
      sorter: (a: any, b: any) =>
        (a.barcode || "").localeCompare(b.barcode || ""),
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
      sorter: (a: any, b: any) =>
        (a.ozon_sku || "").localeCompare(b.ozon_sku || ""),
      ...getColumnSearchProps("ozon_sku"),
    },
    {
      title: "OZON Product ID",
      dataIndex: "ozon_product_id",
      sorter: (a: any, b: any) =>
        (a.ozon_product_id || "").localeCompare(b.ozon_product_id || ""),
      ...getColumnSearchProps("ozon_product_id"),
    },
    {
      title: "OZON Name",
      dataIndex: "ozon_name",
      sorter: (a: any, b: any) =>
        (a.ozon_name || "").localeCompare(b.ozon_name || ""),
      ...getColumnSearchProps("ozon_name"),
    },
    {
      title: "Wild SKU",
      dataIndex: "wild_sku",
      sorter: (a: any, b: any) =>
        (a.wild_sku || "").localeCompare(b.wild_sku || ""),
      ...getColumnSearchProps("wild_sku"),
    },
    {
      title: "Wild Product ID",
      dataIndex: "wild_product_id",
      sorter: (a: any, b: any) =>
        (a.wild_product_id || "").localeCompare(b.wild_product_id || ""),
      ...getColumnSearchProps("wild_product_id"),
    },
    {
      title: "Wild Name",
      dataIndex: "wild_name",
      sorter: (a: any, b: any) =>
        (a.wild_name || "").localeCompare(b.wild_name || ""),
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
          style: { cursor: "pointer" },
        })}
        bordered
        size="small"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title="Основные данные товара"
        open={openMain}
        width={480}
        onClose={() => setOpenMain(false)}
      >
        {editingProduct?.photos?.length > 0 && (
          <>
            <Divider
              orientation="horizontal"
              style={{ fontSize: 13, marginTop: 0 }}
            >
              Фотографии ({editingProduct.photos.length})
            </Divider>

            <Image.PreviewGroup>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {editingProduct.photos.map((photo: any) => (
                  <Image
                    key={photo.id}
                    src={`${PHOTO_BASE_URL}${photo.photo_url}`}
                    width={80}
                    height={80}
                    style={{
                      objectFit: "cover",
                      borderRadius: 6,
                      border: "1px solid #f0f0f0",
                    }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABo0lEQVR4nO2YzUrDQBDHc6qXHjx48CKKd/EBfAAFH8CLJ+/iQfAiHsSDB8GDB/EgXoSDB8GDB8GDB8GDB8GDB8GDB8GDiIjIJptkk91kMyubLGw2aZJNN7vZJv8fDCwzk5l/ZnaXCCGEEEL+MRFC+OjEGJMxxlillFJKlVLKGGOstdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmv/s9ba+2+ttffeW2vvvbfW3ntrrbX33lprrb33Wmu5z5RSSimllFJKKaWUUkoppZRSSikVEZGIiERERERERERERERERERERERERERERERERERERETENyJylFLKHCil1EgpdQNgB8AxgBcAL0opJUQkIiIioULIPQDfAN4BvALYBbAF4ADAAwBXABYBLACYBzAHYBbANIBJABMAzs6BHwBOAZwAOARwAOAQwAECgIPnAXgAeAAeAB4AHgAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQkiInwCPisMiVF8LYQAAAABJRU5ErkJggg=="
                  />
                ))}
              </div>
            </Image.PreviewGroup>

            <Divider orientation="horizontal" style={{ fontSize: 13 }}>
              Основные поля
            </Divider>
          </>
        )}

        {editingProduct?.photos?.length === 0 && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 16px",
              background: "#fafafa",
              borderRadius: 6,
              border: "1px dashed #d9d9d9",
              color: "#aaa",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            Нет фотографий для этого товара
          </div>
        )}

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

          <Form.Item name="incoming_price" label="Закупочная цена">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="expence_price" label="Продажная цена">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="category_id" label="Категория ID">
            <Input />
          </Form.Item>

          <Form.Item name="category_external_id" label="Внешний ID категории">
            <Input />
          </Form.Item>

          <Space wrap>
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

      <Drawer
        title="Маркетплейсы"
        open={openMarket}
        width={420}
        onClose={() => setOpenMarket(false)}
      >
        <Form form={formMarket} layout="vertical" onFinish={handleMarketSubmit}>
          <Divider orientation="horizontal">OZON</Divider>

          <Form.Item name="ozon_sku" label="OZON SKU">
            <Input />
          </Form.Item>

          <Form.Item name="ozon_product_id" label="OZON Product ID">
            <Input />
          </Form.Item>

          <Form.Item name="ozon_account_id" label="OZON Account ID">
            <Input />
          </Form.Item>

          <Form.Item name="ozon_name" label="OZON Name">
            <Input disabled />
          </Form.Item>

          <Divider orientation="horizontal">Wildberries</Divider>

          <Form.Item name="wild_sku" label="Wild SKU">
            <Input />
          </Form.Item>

          <Form.Item name="wild_product_id" label="Wild Product ID">
            <Input />
          </Form.Item>

          <Form.Item name="wild_account_id" label="Wild Account ID">
            <Input />
          </Form.Item>

          <Form.Item name="wild_name" label="Wild Name">
            <Input disabled />
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
