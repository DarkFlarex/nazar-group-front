import { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  DatePicker,
  Drawer,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  message,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Divider,
} from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";

import {
  useGetInvoicesQuery,
  useLazyGetInvoiceItemsQuery,
  useUpdateGoodsExpenseMutation,
  usePostInvoiceMutation,
} from "../store/api/invoiceApi";
import type { Invoice, InvoiceItem } from "../store/api/invoiceApi";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const InvoiceIncomeTable = () => {
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [form] = Form.useForm();

  // ─── Реактивные значения формы для расчёта итогов ───────────────────────
  const goodsValues = Form.useWatch("goods", form) || [];
  const discountPct = Form.useWatch("discountPercent", form) || 0;

  // ─── Вычисляем суммы ─────────────────────────────────────────────────────
  const subtotal = goodsValues.reduce((acc: number, g: any) => {
    const count = Number(g?.count) || 0;
    const price = Number(g?.price) || 0;
    return acc + count * price;
  }, 0);

  const discountAmount = Math.round((subtotal * discountPct) / 100);
  const totalAfterDiscount = subtotal - discountAmount;

  const { data: invoices, isLoading } = useGetInvoicesQuery({
    dateFrom: dates?.[0]?.format("YYYY-MM-DD"),
    dateTo: dates?.[1]?.format("YYYY-MM-DD"),
  });

  const [fetchItems, { data: items, isLoading: itemsLoading }] =
    useLazyGetInvoiceItemsQuery();

  const [updateExpense, { isLoading: isUpdating }] =
    useUpdateGoodsExpenseMutation();

  const [postInvoice, { isLoading: isPosting }] = usePostInvoiceMutation();

  // ─── Открыть накладную ───────────────────────────────────────────────────
  const handleOpen = async (record: Invoice, edit: boolean = false) => {
    try {
      setSelectedInvoice(record);
      setIsEditMode(edit);
      const fetchedItems = await fetchItems(record.guid).unwrap();

      if (edit) {
        // Берём скидку из первого товара (если она единая) и переводим обратно в %
        // Если бекенд хранит скидку в ₽ на весь заказ — адаптируйте логику здесь
        const firstDiscount = fetchedItems[0]?.discount || 0;
        const firstSubtotal = fetchedItems.reduce((acc, item) => {
          return acc + (Number(item.count) || 0) * (Number(item.price) || 0);
        }, 0);
        const savedDiscountPct =
          firstSubtotal > 0
            ? Math.round((firstDiscount / firstSubtotal) * 100)
            : 0;

        form.setFieldsValue({
          docnumber: record.doc_number,
          docdate: dayjs(record.doc_date || record.created_at),
          customer: record.supplier,
          discountPercent: savedDiscountPct,
          goods: fetchedItems.map((item) => ({
            goodid: item.goodid ?? (item as any).good,
            product_name: item.product_name,
            count: item.count,
            price: item.price,
          })),
        });
      }

      setDrawerOpen(true);
    } catch (e) {
      console.error(e);
      message.error("Ошибка загрузки позиций");
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setIsEditMode(false);
    form.resetFields();
  };

  // ─── Сохранить редактирование ────────────────────────────────────────────
  const handleSaveEdit = async (values: any) => {
    if (!selectedInvoice) return;

    const pct = Number(values.discountPercent) || 0;

    const formattedGoods = values.goods.map((g: any) => {
      const count = Number(g.count) || 0;
      const price = Number(g.price) || 0;
      const lineTotal = count * price;
      const lineDiscount = Math.round((lineTotal * pct) / 100);
      return {
        goodid: g.goodid,
        count,
        price,
        discount: lineDiscount,
        total: lineTotal - lineDiscount,
      };
    });

    const missingGoodId = formattedGoods.some((g: any) => !g.goodid);
    if (missingGoodId) {
      message.error("Ошибка: у одного из товаров отсутствует goodid.");
      return;
    }

    const totalsum = formattedGoods.reduce(
      (acc: number, item: any) => acc + item.total,
      0
    );

    try {
      await updateExpense({
        guid: selectedInvoice.guid,
        docdate: values.docdate.format("YYYY-MM-DD"),
        docnumber: values.docnumber,
        customer: values.customer,
        totalsum,
        goods: formattedGoods,
      }).unwrap();

      message.success("Накладная успешно обновлена");
      setIsEditMode(false);
      fetchItems(selectedInvoice.guid);
    } catch (err: any) {
      message.error(err?.data?.error || "Ошибка при сохранении");
    }
  };

  // ─── Провести накладную ──────────────────────────────────────────────────
  const handlePost = async () => {
    if (!selectedInvoice) return;
    try {
      await postInvoice(selectedInvoice.guid).unwrap();
      message.success("Накладная успешно проведена!");
      setSelectedInvoice((prev) =>
        prev ? { ...prev, status: "posted" } : prev
      );
    } catch (err: any) {
      message.error(err?.data?.error || "Ошибка при проведении");
    }
  };

  // ─── Колонки основной таблицы ─────────────────────────────────────────────
  const columns: ColumnsType<Invoice> = [
    { title: "№", dataIndex: "doc_number" },
    {
      dataIndex: "created_at",
      title: "Дата создания",
      render: (date: string) => dayjs(date).format("DD.MM.YYYY"),
    },
    { title: "Клиент", dataIndex: "supplier" },
    {
      dataIndex: "total_sum",
      title: "Сумма",
      render: (v: number) => `${v?.toLocaleString()} ₽`,
    },
    {
      dataIndex: "status",
      title: "Статус",
      render: (status: string) => (
        <Tag color={status === "draft" ? "orange" : "green"}>
          {status === "draft" ? "Черновик" : "Проведен"}
        </Tag>
      ),
    },
    {
      dataIndex: "invoice_type_name",
      title: "Тип",
      render: (invoice_type_name: string) => (
        <Tag color={invoice_type_name === "Приход товара" ? "orange" : "green"}>
          {invoice_type_name}
        </Tag>
      ),
    },

    {
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleOpen(record, false)}>
            Открыть
          </Button>
          {record.status === "draft" && (
            <Button type="link" onClick={() => handleOpen(record, true)}>
              Изменить
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // ─── Колонки таблицы товаров (просмотр) ──────────────────────────────────
  const itemColumns: ColumnsType<InvoiceItem> = [
    { title: "Товар", dataIndex: "product_name" },
    { title: "Артикул", dataIndex: "articul" },
    { title: "Кол-во", dataIndex: "count" },
    {
      dataIndex: "price",
      render: (v: number) => `${v?.toLocaleString()} ₽`,
    },
    {
      dataIndex: "discount",
      render: (v: number) =>
        v ? (
          <Text type="danger">-{v?.toLocaleString()} ₽</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      dataIndex: "total",
      render: (v: number) => <Text strong>{v?.toLocaleString()} ₽</Text>,
    },
  ];

  // ─── Extra кнопки в Drawer ────────────────────────────────────────────────
  const drawerExtra = () => {
    if (isEditMode) {
      return (
        <Space>
          <Button onClick={() => setIsEditMode(false)}>Отмена</Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={isUpdating}
          >
            Сохранить
          </Button>
        </Space>
      );
    }

    if (selectedInvoice?.status === "draft") {
      return (
        <Space>
          <Popconfirm
            title="Провести накладную?"
            description="После проведения редактирование будет невозможно. Остатки будут списаны."
            okText="Провести"
            cancelText="Отмена"
            onConfirm={handlePost}
          >
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={isPosting}
            >
              Провести
            </Button>
          </Popconfirm>
        </Space>
      );
    }

    return null;
  };

  return (
    <div>
      <Title level={3}>Накладные</Title>

      <Card style={{ marginBottom: 16 }}>
        <RangePicker
          format="DD.MM.YYYY"
          onChange={(value) => setDates(value as [Dayjs, Dayjs] | null)}
        />
      </Card>

      <Table<Invoice>
        rowKey="guid"
        loading={isLoading}
        dataSource={invoices}
        columns={columns}
        scroll={{ x: true }}
      />

      <Drawer
        width={960}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        title={
          isEditMode
            ? `Редактирование: ${selectedInvoice?.doc_number || ""}`
            : `Накладная № ${selectedInvoice?.doc_number || ""}`
        }
        extra={drawerExtra()}
      >
        {/* ===== РЕЖИМ ПРОСМОТРА ===== */}
        {selectedInvoice && !isEditMode && (
          <>
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col span={6}>
                <Statistic
                  title="Дата"
                  value={dayjs(selectedInvoice.doc_date).format("DD.MM.YYYY")}
                />
              </Col>
              <Col span={6}>
                <Statistic title="Клиент" value={selectedInvoice.supplier} />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Сумма без скидки"
                  value={selectedInvoice.total_sum}
                  suffix="₽"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Итого к оплате"
                  value={selectedInvoice.total_sum}
                  suffix="₽"
                  valueStyle={{ color: "#1677ff", fontWeight: 700 }}
                />
              </Col>
            </Row>

            {selectedInvoice.status === "posted" && (
              <Tag
                color="green"
                icon={<CheckCircleOutlined />}
                style={{ marginBottom: 16, fontSize: 14, padding: "4px 12px" }}
              >
                Накладная проведена — редактирование недоступно
              </Tag>
            )}

            <Spin spinning={itemsLoading}>
              <Table<InvoiceItem>
                rowKey="guid"
                columns={itemColumns}
                dataSource={items}
                pagination={false}
                size="small"
                summary={(pageData) => {
                  const totalDiscount = pageData.reduce(
                    (acc, row) => acc + (row.discount || 0),
                    0
                  );
                  const grandTotal = pageData.reduce(
                    (acc, row) => acc + (row.total || 0),
                    0
                  );
                  return (
                    <>
                      {totalDiscount > 0 && (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={4}>
                            <Text type="secondary">Итого скидка</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1}>
                            <Text type="danger">
                              -{totalDiscount.toLocaleString()} ₽
                            </Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} />
                        </Table.Summary.Row>
                      )}
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4}>
                          <Text strong>Итого к оплате</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} />
                        <Table.Summary.Cell index={2}>
                          <Text
                            strong
                            style={{ color: "#1677ff", fontSize: 16 }}
                          >
                            {grandTotal.toLocaleString()} ₽
                          </Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </>
                  );
                }}
              />
            </Spin>
          </>
        )}

        {/* ===== РЕЖИМ РЕДАКТИРОВАНИЯ ===== */}
        {selectedInvoice && isEditMode && (
          <Form form={form} layout="vertical" onFinish={handleSaveEdit}>
            {/* ─── Шапка документа ─────────────────────────────────────── */}
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="docnumber"
                  label="Номер документа"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="docdate"
                  label="Дата"
                  rules={[{ required: true }]}
                >
                  <DatePicker format="DD.MM.YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="customer"
                  label="Клиент"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            {/* ─── Глобальная скидка ───────────────────────────────────── */}
            <Card
              size="small"
              style={{
                marginBottom: 20,
                background: "#fafafa",
                border: "1px solid #e8e8e8",
              }}
            >
              <Row gutter={24} align="middle">
                <Col>
                  <Form.Item
                    name="discountPercent"
                    label="Скидка на все товары"
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        type: "number",
                        min: 0,
                        max: 100,
                        message: "Скидка от 0 до 100%",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={2}
                      addonAfter="%"
                      style={{ width: 160 }}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>

                {/* Сумма скидки (только читается, обновляется реактивно) */}
                <Col>
                  <div>
                    <Text
                      type="secondary"
                      style={{ display: "block", fontSize: 12 }}
                    >
                      Сумма скидки
                    </Text>
                    <Text
                      type="danger"
                      style={{ fontSize: 18, fontWeight: 600 }}
                    >
                      -{discountAmount.toLocaleString()} ₽
                    </Text>
                  </div>
                </Col>

                <Col style={{ marginLeft: "auto" }}>
                  <div style={{ textAlign: "right" }}>
                    <Text
                      type="secondary"
                      style={{ display: "block", fontSize: 12 }}
                    >
                      Сумма без скидки
                    </Text>
                    <Text style={{ fontSize: 15 }}>
                      {subtotal.toLocaleString()} ₽
                    </Text>
                  </div>
                </Col>

                <Col>
                  <div style={{ textAlign: "right" }}>
                    <Text
                      type="secondary"
                      style={{ display: "block", fontSize: 12 }}
                    >
                      Итого к оплате
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#1677ff",
                      }}
                    >
                      {totalAfterDiscount.toLocaleString()} ₽
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>

            <Divider />

            <Title level={5}>Товары</Title>

            {/* ─── Список товаров ──────────────────────────────────────── */}
            <Form.List name="goods">
              {(fields) => (
                <>
                  {fields.map(({ key, name, ...restField }) => {
                    const count = Number(goodsValues[name]?.count) || 0;
                    const price = Number(goodsValues[name]?.price) || 0;
                    const lineTotal = count * price;
                    const lineDiscount = Math.round(
                      (lineTotal * discountPct) / 100
                    );
                    const lineNet = lineTotal - lineDiscount;

                    return (
                      <Row
                        key={key}
                        gutter={12}
                        align="middle"
                        style={{
                          marginBottom: 8,
                          padding: "12px 16px",
                          background: "#f9f9f9",
                          borderRadius: 8,
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        {/* Скрытый goodid */}
                        <Form.Item
                          {...restField}
                          name={[name, "goodid"]}
                          hidden
                        >
                          <Input />
                        </Form.Item>

                        {/* Название товара */}
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "product_name"]}
                            label="Название"
                            style={{ marginBottom: 0 }}
                          >
                            <Input
                              readOnly
                              bordered={false}
                              style={{ fontWeight: 600 }}
                            />
                          </Form.Item>
                        </Col>

                        {/* Кол-во */}
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "count"]}
                            label="Кол-во"
                            rules={[{ required: true }]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>

                        {/* Цена */}
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "price"]}
                            label="Цена, ₽"
                            rules={[{ required: true }]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber min={0} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>

                        {/* Скидка на строку (читается) */}
                        <Col span={4}>
                          <div>
                            <Text
                              type="secondary"
                              style={{ fontSize: 12, display: "block" }}
                            >
                              Скидка
                            </Text>
                            <Text type="danger" style={{ fontWeight: 600 }}>
                              -{lineDiscount.toLocaleString()} ₽
                            </Text>
                          </div>
                        </Col>

                        {/* Итог строки (читается) */}
                        <Col span={4}>
                          <div>
                            <Text
                              type="secondary"
                              style={{ fontSize: 12, display: "block" }}
                            >
                              Сумма
                            </Text>
                            <Text strong style={{ color: "#1677ff" }}>
                              {lineNet.toLocaleString()} ₽
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    );
                  })}
                </>
              )}
            </Form.List>

            {/* ─── Итоговый блок под товарами ─────────────────────────── */}
            <Card
              style={{
                marginTop: 16,
                background: "#f0f5ff",
                border: "1px solid #adc6ff",
              }}
              size="small"
            >
              <Row justify="end" gutter={32}>
                <Col>
                  <Text type="secondary">Сумма без скидки:</Text>
                  <Text strong style={{ marginLeft: 8 }}>
                    {subtotal.toLocaleString()} ₽
                  </Text>
                </Col>
                <Col>
                  <Text type="secondary">Скидка ({discountPct}%):</Text>
                  <Text type="danger" strong style={{ marginLeft: 8 }}>
                    -{discountAmount.toLocaleString()} ₽
                  </Text>
                </Col>
                <Col>
                  <Text type="secondary">Итого:</Text>
                  <Text
                    strong
                    style={{ marginLeft: 8, fontSize: 18, color: "#1677ff" }}
                  >
                    {totalAfterDiscount.toLocaleString()} ₽
                  </Text>
                </Col>
              </Row>
            </Card>
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default InvoiceIncomeTable;
