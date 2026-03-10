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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";

import {
  useGetInvoicesQuery,
  useLazyGetInvoiceItemsQuery,
} from "../store/api/invoiceApi";

import type { Invoice, InvoiceItem } from "../store/api/invoiceApi";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const statusColors: Record<number, string> = {
  0: "orange",
  1: "green",
};

const InvoiceIncomeTable = () => {
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const { data: invoices, isLoading } = useGetInvoicesQuery(
    {
      dateFrom: dates?.[0]?.format("YYYY-MM-DD"),
      dateTo: dates?.[1]?.format("YYYY-MM-DD"),
    },
    {
      skip: false,
    }
  );

  const [fetchItems, { data: items, isLoading: itemsLoading }] =
    useLazyGetInvoiceItemsQuery();

  const handleOpen = async (record: Invoice) => {
    try {
      setSelectedInvoice(record);
      await fetchItems(record.guid).unwrap();
      setDrawerOpen(true);
    } catch {
      message.error("Ошибка загрузки позиций");
    }
  };

  const columns: ColumnsType<Invoice> = [
    {
      title: "№",
      dataIndex: "doc_number",
      sorter: (a, b) => a.doc_number.localeCompare(b.doc_number),
    },
    {
      title: "Дата",
      dataIndex: "created_at",
      render: (date: string) => dayjs(date).format("DD.MM.YYYY"),
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Поставщик",
      dataIndex: "supplier",
    },
    {
      title: "Склад",
      dataIndex: "warehouse",
      responsive: ["md"],
    },
    {
      title: "Тип",
      dataIndex: "invoice_type_name",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Сумма",
      dataIndex: "total_sum",
      sorter: (a, b) => a.total_sum - b.total_sum,
      render: (value: number) => `${value?.toLocaleString()} ₽`,
    },
    {
      title: "Статус",
      dataIndex: "status",
      filters: [
        { text: "Черновик", value: 0 },
        { text: "Проведен", value: 1 },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: number) => (
        <Tag color={statusColors[status]}>
          {status === 1 ? "Проведен" : "Черновик"}
        </Tag>
      ),
    },
    {
      title: "Действия",
      render: (_, record) => (
        <Button type="link" onClick={() => handleOpen(record)}>
          Открыть
        </Button>
      ),
    },
  ];

  const itemColumns: ColumnsType<InvoiceItem> = [
    {
      title: "Товар",
      dataIndex: "product_name",
    },
    {
      title: "Артикул",
      dataIndex: "articul",
      responsive: ["md"],
    },
    {
      title: "Кол-во",
      dataIndex: "count",
    },
    {
      title: "Цена",
      dataIndex: "price",
    },
    {
      title: "Скидка",
      dataIndex: "discount",
    },
    {
      title: "Сумма",
      dataIndex: "total",
      render: (v: number) => `${v?.toLocaleString()} ₽`,
    },
  ];

  return (
    <div>
      <Title level={3}>Приходные накладные</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <RangePicker
            format="DD.MM.YYYY"
            onChange={(value) => setDates(value as [Dayjs, Dayjs] | null)}
          />
        </Space>
      </Card>

      <Table<Invoice>
        rowKey="guid"
        loading={isLoading}
        dataSource={invoices}
        columns={columns}
        scroll={{ x: true }}
      />

      <Drawer
        width={900}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Накладная № ${selectedInvoice?.doc_number ?? ""}`}
      >
        {selectedInvoice && (
          <>
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col span={8}>
                <Statistic
                  title="Дата"
                  value={dayjs(selectedInvoice.doc_date).format("DD.MM.YYYY")}
                />
              </Col>
              <Col span={8}>
                <Statistic title="Поставщик" value={selectedInvoice.supplier} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Сумма"
                  value={selectedInvoice.total_sum}
                  suffix="₽"
                />
              </Col>
            </Row>

            <Spin spinning={itemsLoading}>
              <Table<InvoiceItem>
                rowKey="guid"
                columns={itemColumns}
                dataSource={items}
                pagination={false}
                size="small"
              />
            </Spin>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default InvoiceIncomeTable;
