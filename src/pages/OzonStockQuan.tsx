import { useState } from "react";
import {
  Card,
  Table,
  Typography,
  Tag,
  Button,
  Modal,
  InputNumber,
  Form,
  Space,
  Spin,
  message,
} from "antd";
import {
  useChangeInfoStoksMutation,
  useGetInfoStoksQuery,
} from "../store/api/directoryApi";

const { Title, Text } = Typography;

interface StockRow {
  type: string;
  present: number;
  reserved: number;
  sku: number;
  shipment_type: string;
  warehouse_ids: number[];
}

const stockColor: Record<string, string> = {
  fbo: "blue",
  fbs: "green",
  rfbs: "orange",
};

const StocksQoanPage = () => {
  const { data, isLoading } = useGetInfoStoksQuery();
  const [changeStock, { isLoading: isSaving }]: any =
    useChangeInfoStoksMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [form] = Form.useForm();

  const openModal = (product: any, stock: StockRow) => {
    setSelectedStock({ ...product, ...stock });
    form.setFieldsValue({
      present: stock.present,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      await changeStock({
        product_id: selectedStock.product_id,
        sku: selectedStock.sku,
        type: selectedStock.type,
        present: values.present,
      }).unwrap();

      message.success("Остаток успешно обновлён");
      setModalOpen(false);
    } catch (err) {
      message.error("Ошибка при обновлении");
    }
  };

  const columns = [
    {
      title: "Product ID",
      dataIndex: "product_id",
    },
    {
      title: "Offer ID",
      dataIndex: "offer_id",
    },
  ];

  return (
    <Card style={{ borderRadius: 12 }}>
      <Title level={4}>Остатки товаров</Title>

      {isLoading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="product_id"
          expandable={{
            expandedRowRender: (record: any) => (
              <Table
                rowKey="type"
                pagination={false}
                dataSource={record.stocks}
                columns={[
                  {
                    title: "Тип",
                    dataIndex: "type",
                    render: (v: string) => (
                      <Tag color={stockColor[v] || "default"}>{v}</Tag>
                    ),
                  },
                  {
                    title: "SKU",
                    dataIndex: "sku",
                  },
                  {
                    title: "В наличии",
                    dataIndex: "present",
                  },
                  {
                    title: "Зарезервировано",
                    dataIndex: "reserved",
                  },
                  {
                    title: "Действие",
                    render: (_: any, stock: StockRow) => (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => openModal(record, stock)}
                      >
                        Изменить
                      </Button>
                    ),
                  },
                ]}
              />
            ),
          }}
        />
      )}

      {/* Модалка редактирования */}
      <Modal
        title="Редактирование остатка"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={isSaving}
        okText="Сохранить"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text>
            <b>Product ID:</b> {selectedStock?.product_id}
          </Text>
          <Text>
            <b>Тип:</b> {selectedStock?.type}
          </Text>
          <Text>
            <b>SKU:</b> {selectedStock?.sku}
          </Text>

          <Form form={form} layout="vertical">
            <Form.Item
              name="present"
              label="Количество в наличии"
              rules={[{ required: true, message: "Введите количество" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Space>
      </Modal>
    </Card>
  );
};

export default StocksQoanPage;
