// pages/OzonTasksComponent.tsx

import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  Input,
  Tag,
  Card,
  Typography,
  Spin,
  Alert,
  Flex,
  Button,
  Space,
  Tooltip,
  Modal,
  Descriptions,
  message,
} from "antd";
import type { TableProps } from "antd";
import {
  SearchOutlined,
  ShoppingOutlined,
  PrinterOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  LoadingOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import {
  useGetTasksQuery,
  useGetPackageLabelMutation,
  useGetPackageLabelsBatchMutation,
  useAssignTaskMutation,
  useCompleteTaskMutation,
} from "../store/api/ozonProduct";

const { Title, Text } = Typography;
const { confirm } = Modal;

// ============================================================
// Типы
// ============================================================
interface TaskItem {
  posting_item_guid: string;
  good_guid: string;
  qty: number;
  price: number;
  sku: string;
  nameid: string;
  manufacturer: string;
  articul: string;
  manufacturer_number: string | null;
  original_number: string;
  width: number | null;
  height: number | null;
  length: number | null;
  gross_weight: number | null;
  stock_quantity: number;
}

interface TaskData {
  guid: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  posting: {
    guid: string;
    posting_number: string;
  };
  order: {
    guid: string;
    marketplace_order_id: string;
    status: string;
  };
  items: TaskItem[];
}

interface TaskWrapper {
  task: TaskData;
}

interface FlatTask extends TaskData {
  key: string;
}

// ============================================================
// Утилиты
// ============================================================
const statusColorMap: Record<string, string> = {
  completed: "green",
  success: "green",
  delivered: "green",
  pending: "orange",
  awaiting: "orange",
  awaiting_deliver: "gold",
  processing: "blue",
  in_progress: "blue",
  delivering: "cyan",
  failed: "red",
  error: "red",
  cancelled: "volcano",
};

const getStatusColor = (status: string | undefined): string => {
  if (!status) return "default";
  return statusColorMap[status.toLowerCase()] || "default";
};

const statusTextMap: Record<string, string> = {
  pending: "Ожидает",
  processing: "В обработке",
  in_progress: "В работе",
  completed: "Завершён",
  failed: "Ошибка",
  delivering: "Доставляется",
  awaiting_deliver: "Ожидает отгрузки",
  cancelled: "Отменён",
};

const getStatusText = (status: string): string => {
  return statusTextMap[status?.toLowerCase()] || status?.toUpperCase() || "N/A";
};

/**
 * Открывает PDF blob в новой вкладке или скачивает
 */
const openPdfBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const newWindow = window.open(url, "_blank");

  // Если браузер заблокировал popup — скачиваем файлом
  if (!newWindow) {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Очищаем URL через 60 секунд
  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
};

// ============================================================
// Компонент
// ============================================================
const OzonTasksComponent: React.FC = () => {
  const {
    data: tasksData = [],
    isLoading,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetTasksQuery(undefined, {
    pollingInterval: 60000, // автообновление каждую минуту
  });

  const [getPackageLabel] = useGetPackageLabelMutation();
  const [getPackageLabelsBatch, { isLoading: isBatchLabelLoading }] =
    useGetPackageLabelsBatchMutation();
  const [assignTask, { isLoading: isAssigning }] = useAssignTaskMutation();
  const [completeTask, { isLoading: isCompleting }] = useCompleteTaskMutation();

  const [searchText, setSearchText] = useState<string>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // --- Состояние модалки товара ---
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TaskItem | null>(null);

  // --- Состояние модалки всех товаров заказа ---
  const [orderItemsModalVisible, setOrderItemsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<FlatTask | null>(null);

  // --- Трекинг какая этикетка грузится ---
  const [loadingLabelGuid, setLoadingLabelGuid] = useState<string | null>(null);

  // --- Данные ---
  const processedData: FlatTask[] = useMemo(() => {
    if (!isSuccess || !Array.isArray(tasksData)) return [];
    return tasksData.map((wrapper: TaskWrapper, index: number) => {
      const task = wrapper.task;
      return {
        ...task,
        key: task.guid || index.toString(),
      };
    });
  }, [tasksData, isSuccess]);

  // --- Поиск ---
  const finalData = useMemo(() => {
    if (!searchText) return processedData;
    const lower = searchText.toLowerCase();

    return processedData.filter((task) => {
      const matchesMain =
        task.status?.toLowerCase().includes(lower) ||
        task.order?.marketplace_order_id?.toLowerCase().includes(lower) ||
        task.order?.status?.toLowerCase().includes(lower) ||
        task.posting?.posting_number?.toLowerCase().includes(lower);

      const matchesItems = task.items?.some(
        (item) =>
          item.nameid?.toLowerCase().includes(lower) ||
          item.articul?.toLowerCase().includes(lower) ||
          item.sku?.toLowerCase().includes(lower) ||
          item.original_number?.toLowerCase().includes(lower)
      );

      return matchesMain || matchesItems;
    });
  }, [searchText, processedData]);

  // ============================================================
  // Обработчики
  // ============================================================

  const handleViewItem = (item: TaskItem) => {
    setSelectedItem(item);
    setItemModalVisible(true);
  };

  const handleViewOrderItems = (record: FlatTask) => {
    setSelectedOrder(record);
    setOrderItemsModalVisible(true);
  };

  // ---- Печать одной этикетки ----
  const handlePrintLabel = useCallback(
    async (record: FlatTask) => {
      const postingGuid = record.posting?.guid;
      const postingNumber = record.posting?.posting_number;

      if (!postingGuid) {
        message.error("Нет GUID отправления");
        return;
      }

      setLoadingLabelGuid(postingGuid);

      try {
        const blob = await getPackageLabel({
          posting_guid: postingGuid,
        }).unwrap();

        if (blob instanceof Blob && blob.size > 0) {
          openPdfBlob(blob, `label-${postingNumber || postingGuid}.pdf`);
          message.success(`Этикетка ${postingNumber} готова`);
        } else {
          message.error("Получен пустой файл этикетки");
        }
      } catch (err: any) {
        console.error("Label error:", err);

        if (err?.error?.includes?.("not ready") || err?.ozon_error) {
          message.warning(
            "Этикетка ещё не готов��. Попробуйте чер��з 45-60 секунд после отгрузки."
          );
        } else {
          message.error(
            err?.error || err?.data?.error || "Ошибка получения этикетки"
          );
        }
      } finally {
        setLoadingLabelGuid(null);
      }
    },
    [getPackageLabel]
  );

  // ---- Пакетная печать ----
  const handlePrintSelectedLabels = useCallback(async () => {
    if (!selectedRowKeys.length) {
      message.warning("Выберите отправления для печати");
      return;
    }

    if (selectedRowKeys.length > 20) {
      message.error("Максимум 20 отправлений за один раз");
      return;
    }

    // Собираем posting_guids
    const postingGuids = selectedRowKeys
      .map((key) => {
        const task = processedData.find((t) => t.key === key);
        return task?.posting?.guid;
      })
      .filter(Boolean) as string[];

    if (!postingGuids.length) {
      message.error("Не найдены GUID отправлений");
      return;
    }

    try {
      const blob = await getPackageLabelsBatch({
        posting_guids: postingGuids,
      }).unwrap();

      if (blob instanceof Blob && blob.size > 0) {
        openPdfBlob(blob, `labels-batch-${Date.now()}.pdf`);
        message.success(`Напечатано ${postingGuids.length} этикеток`);
        setSelectedRowKeys([]);
      } else {
        message.error("Получен пусто�� файл");
      }
    } catch (err: any) {
      console.error("Batch label error:", err);

      if (err?.invalid_postings) {
        const invalid = err.invalid_postings
          .map((p: any) => `${p.posting_number} (${p.status})`)
          .join(", ");
        message.error(
          `Некоторые отправления не в статусе "Ожидает отгрузки": ${invalid}`
        );
      } else {
        message.error(
          err?.error || err?.data?.error || "Ошибка пакетной печати"
        );
      }
    }
  }, [selectedRowKeys, processedData, getPackageLabelsBatch]);

  // ---- Взять в работу ----
  const handleAssignTask = useCallback(
    (record: FlatTask) => {
      confirm({
        title: "Взять заказ в обработку?",
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>
              Отправление: <Text strong>{record.posting?.posting_number}</Text>
            </p>
            <p>
              Товаров: <Text strong>{record.items?.length || 0}</Text>
            </p>
            <p>
              Сумма:{" "}
              <Text strong>
                {record.items
                  ?.reduce((s, i) => s + i.price * i.qty, 0)
                  .toLocaleString("ru-RU")}{" "}
                ₽
              </Text>
            </p>
          </div>
        ),
        okText: "Взять в обработку",
        cancelText: "Отмена",
        okButtonProps: { loading: isAssigning },
        onOk: async () => {
          try {
            await assignTask({
              task_guid: record.guid,
              // picker_guid: currentUser.guid // если есть авторизация
            }).unwrap();

            message.success(
              `Заказ ${record.posting?.posting_number} взят в обработку`
            );
          } catch (err: any) {
            message.error(
              err?.data?.error || "Ошибка при взятии задачи в работу"
            );
          }
        },
      });
    },
    [assignTask, isAssigning]
  );

  // ---- Завершить сборку ----
  const handleCompleteTask = useCallback(
    (record: FlatTask) => {
      confirm({
        title: "Завершить сборку?",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        content: (
          <div>
            <p>
              Отправление: <Text strong>{record.posting?.posting_number}</Text>
            </p>
            <p>
              После завершения сборки заказ будет передан на упаковку и
              отгрузку.
            </p>
          </div>
        ),
        okText: "Завершить сборку",
        okType: "primary",
        cancelText: "Отмена",
        okButtonProps: { loading: isCompleting },
        onOk: async () => {
          try {
            await completeTask({ task_guid: record.guid }).unwrap();
            message.success(
              `Сборка ${record.posting?.posting_number} завершена`
            );
          } catch (err: any) {
            message.error(err?.data?.error || "Ошибка завершения сборки");
          }
        },
      });
    },
    [completeTask, isCompleting]
  );

  // ============================================================
  // Колонки основной таблицы
  // ============================================================
  const columns: TableProps<FlatTask>["columns"] = [
    {
      title: "№",
      key: "index",
      width: 50,
      align: "center",
      render: (_, __, index) => <Text type="secondary">{index + 1}</Text>,
    },
    {
      title: "Номер отправления",
      key: "posting_number",
      width: 200,
      render: (_, record) => (
        <Text copyable={{ tooltips: ["Копировать", "Скопировано"] }} strong>
          {record.posting?.posting_number || "—"}
        </Text>
      ),
    },
    {
      title: "ID Заказа",
      key: "marketplace_order_id",
      width: 160,
      render: (_, record) => (
        <Text
          copyable={{ tooltips: ["Копировать", "Скопировано"] }}
          style={{ fontFamily: "monospace", fontSize: 13 }}
        >
          {record.order?.marketplace_order_id || "—"}
        </Text>
      ),
    },
    {
      title: "Статус задачи",
      dataIndex: "status",
      key: "task_status",
      width: 150,
      filters: [
        { text: "Ожидает", value: "pending" },
        { text: "В работе", value: "in_progress" },
        { text: "Завершён", value: "completed" },
        { text: "Ошибка", value: "failed" },
      ],
      onFilter: (value, record) =>
        record.status?.toLowerCase() === (value as string),
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 600 }}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Статус ��аказа",
      key: "order_status",
      width: 150,
      render: (_, record) => {
        const s = record.order?.status;
        return s ? (
          <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag>
        ) : (
          "—"
        );
      },
    },
    {
      title: "Товары",
      key: "items",
      width: 160,
      render: (_, record) => (
        <Button
          type="link"
          icon={<ShoppingOutlined />}
          onClick={() => handleViewOrderItems(record)}
          style={{ padding: 0 }}
        >
          Посмотреть ({record.items?.length || 0})
        </Button>
      ),
    },
    {
      title: "Создано",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      defaultSortOrder: "descend",
      render: (date: string) =>
        date
          ? new Date(date).toLocaleString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
    },
    {
      title: "Действия",
      key: "actions",
      width: 320,
      fixed: "right",
      render: (_, record) => {
        const taskStatus = record.status?.toLowerCase();
        const isCurrentLabelLoading = loadingLabelGuid === record.posting?.guid;

        return (
          <Space size="small" wrap>
            {/* Взять в работу — только для pending */}
            {taskStatus === "pending" && (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                size="small"
                loading={isAssigning}
                onClick={() => handleAssignTask(record)}
              >
                В работу
              </Button>
            )}

            {/* Завершить сборку — только для in_progress */}
            {taskStatus === "in_progress" && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
                loading={isCompleting}
                onClick={() => handleCompleteTask(record)}
              >
                Собрано
              </Button>
            )}

            {/* Печать этикетк�� — всегда доступна */}
            <Tooltip
              title={
                record.order?.status !== "awaiting_deliver"
                  ? "Этикетка доступна только в статусе 'Ожидает отгрузки'"
                  : "Напечатать этикетку"
              }
            >
              <Button
                icon={
                  isCurrentLabelLoading ? (
                    <LoadingOutlined />
                  ) : (
                    <PrinterOutlined />
                  )
                }
                size="small"
                loading={isCurrentLabelLoading}
                disabled={record.order?.status !== "awaiting_deliver"}
                onClick={() => handlePrintLabel(record)}
              >
                Этикетка
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  // ============================================================
  // Колонки таблицы товаров внутри модалки
  // ============================================================
  const itemColumns: TableProps<TaskItem>["columns"] = [
    {
      title: "Название",
      dataIndex: "nameid",
      key: "nameid",
      render: (name: string, item: TaskItem) => (
        <Flex align="center" gap={8}>
          <Text strong style={{ fontSize: 13 }}>
            {name || "—"}
          </Text>
          <Tooltip title="Подробнее">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewItem(item)}
            />
          </Tooltip>
        </Flex>
      ),
    },
    {
      title: "Артикул",
      dataIndex: "articul",
      key: "articul",
      width: 100,
      align: "center",
      render: (art: string) => <Tag color="geekblue">{art || "—"}</Tag>,
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 140,
      render: (sku: string) => (
        <Text
          copyable={{ tooltips: ["Копировать", "Скопировано"] }}
          style={{ fontFamily: "monospace", fontSize: 12 }}
        >
          {sku}
        </Text>
      ),
    },
    {
      title: "Кол-во",
      dataIndex: "qty",
      key: "qty",
      width: 80,
      align: "center",
      render: (qty: number) => (
        <Tag
          color="blue"
          style={{ fontSize: 14, fontWeight: 700, padding: "2px 12px" }}
        >
          {qty}
        </Tag>
      ),
    },
    {
      title: "Цена",
      dataIndex: "price",
      key: "price",
      width: 120,
      align: "right",
      render: (price: number) => (
        <Text>{price?.toLocaleString("ru-RU")} ₽</Text>
      ),
    },
    {
      title: "Остаток",
      dataIndex: "stock_quantity",
      key: "stock_quantity",
      width: 100,
      align: "center",
      render: (qty: number) => (
        <Tag
          color={qty > 5 ? "green" : qty > 0 ? "orange" : "red"}
          style={{ fontWeight: 600 }}
        >
          {qty} шт.
        </Tag>
      ),
    },
  ];

  // ============================================================
  // Выбор строк для пакетной печати
  // ============================================================
  const rowSelection: TableProps<FlatTask>["rowSelection"] = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    getCheckboxProps: (record) => ({
      disabled: record.order?.status !== "awaiting_deliver",
    }),
  };

  // ============================================================
  // Загрузка / Ошибка
  // ============================================================
  if (isLoading) {
    return (
      <Card>
        <Flex
          gap="middle"
          vertical
          align="center"
          justify="center"
          style={{ padding: 50 }}
        >
          <Spin size="large" />
          <Text>Загрузка задач...</Text>
        </Flex>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <Alert
          message="Ошибка загрузки"
          description={
            JSON.stringify((error as any)?.data) ||
            "Не удалось пол��чить данные."
          }
          type="error"
          showIcon
        />
      </Card>
    );
  }

  // ============================================================
  // Рендер
  // ============================================================
  return (
    <>
      <Card
        title={
          <Flex align="center" justify="space-between">
            <Title level={3} style={{ margin: 0 }}>
              Сборочные задания
            </Title>
            <Space>
              <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
                Всего: {processedData.length}
              </Tag>
              <Button size="small" onClick={refetch}>
                Обновить
              </Button>
            </Space>
          </Flex>
        }
        variant="borderless"
        styles={{ body: { padding: "0 24px 24px 24px" } }}
        style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)" }}
      >
        {/* Панель поиска и пакетных действий */}
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={12}
          style={{ marginBottom: 16 }}
        >
          <Input
            placeholder="Поиск по отправлению, заказу, артикулу, названию..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "100%", maxWidth: 420 }}
            allowClear
          />

          {/* Пакетная печа��ь */}
          {selectedRowKeys.length > 0 && (
            <Space>
              <Text type="secondary">Выбрано: {selectedRowKeys.length}</Text>
              <Button
                type="primary"
                icon={
                  isBatchLabelLoading ? (
                    <LoadingOutlined />
                  ) : (
                    <FilePdfOutlined />
                  )
                }
                loading={isBatchLabelLoading}
                onClick={handlePrintSelectedLabels}
              >
                Напечатать этикетки ({selectedRowKeys.length})
              </Button>
              <Button onClick={() => setSelectedRowKeys([])}>
                Снять выбор
              </Button>
            </Space>
          )}
        </Flex>

        <Table
          columns={columns}
          dataSource={finalData}
          rowSelection={rowSelection}
          bordered
          size="middle"
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* ======================================================== */}
      {/* Модалка — список товаров заказа                          */}
      {/* ======================================================== */}
      <Modal
        title={
          <Flex align="center" gap={8}>
            <ShoppingOutlined style={{ color: "#1890ff", fontSize: 18 }} />
            <span>
              Товары заказа{" "}
              <Text type="secondary" style={{ fontSize: 14 }}>
                {selectedOrder?.posting?.posting_number}
              </Text>
            </span>
          </Flex>
        }
        open={orderItemsModalVisible}
        onCancel={() => {
          setOrderItemsModalVisible(false);
          setSelectedOrder(null);
        }}
        footer={
          <Space>
            <Tooltip
              title={
                selectedOrder?.order?.status !== "awaiting_deliver"
                  ? "Доступно только в статусе 'Ожидает отг��узки'"
                  : ""
              }
            >
              <Button
                icon={
                  loadingLabelGuid === selectedOrder?.posting?.guid ? (
                    <LoadingOutlined />
                  ) : (
                    <PrinterOutlined />
                  )
                }
                loading={loadingLabelGuid === selectedOrder?.posting?.guid}
                disabled={selectedOrder?.order?.status !== "awaiting_deliver"}
                onClick={() => selectedOrder && handlePrintLabel(selectedOrder)}
              >
                Напечатать этикетку
              </Button>
            </Tooltip>
            <Button
              type="primary"
              onClick={() => {
                setOrderItemsModalVisible(false);
                setSelectedOrder(null);
              }}
            >
              Закрыть
            </Button>
          </Space>
        }
        width={900}
        styles={{ body: { padding: "16px 0" } }}
      >
        {selectedOrder && (
          <>
            <Descriptions
              size="small"
              bordered
              column={2}
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Отправление">
                <Text strong copyable>
                  {selectedOrder.posting?.posting_number}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="ID Заказа">
                <Text copyable>
                  {selectedOrder.order?.marketplace_order_id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Статус задачи">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Статус заказа">
                <Tag color={getStatusColor(selectedOrder.order?.status)}>
                  {getStatusText(selectedOrder.order?.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Сумма заказа">
                <Text strong style={{ color: "#1890ff" }}>
                  {selectedOrder.items
                    ?.reduce((s, i) => s + i.price * i.qty, 0)
                    .toLocaleString("ru-RU")}{" "}
                  ₽
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Всего товаров">
                <Tag color="blue">
                  {selectedOrder.items?.reduce((s, i) => s + i.qty, 0)} шт.
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Table
              columns={itemColumns}
              dataSource={selectedOrder.items?.map((item, i) => ({
                ...item,
                key: item.posting_item_guid || i.toString(),
              }))}
              pagination={false}
              size="small"
              bordered
            />
          </>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* Модалка — детали одного товара                           */}
      {/* ======================================================== */}
      <Modal
        title={
          <Flex align="center" gap={8}>
            <EyeOutlined style={{ color: "#1890ff", fontSize: 18 }} />
            <span>Детали товара</span>
          </Flex>
        }
        open={itemModalVisible}
        onCancel={() => {
          setItemModalVisible(false);
          setSelectedItem(null);
        }}
        footer={
          <Button
            type="primary"
            onClick={() => {
              setItemModalVisible(false);
              setSelectedItem(null);
            }}
          >
            Закрыть
          </Button>
        }
        width={640}
      >
        {selectedItem && (
          <Descriptions
            bordered
            column={1}
            size="small"
            style={{ marginTop: 16 }}
          >
            <Descriptions.Item label="Название">
              <Text strong style={{ fontSize: 15 }}>
                {selectedItem.nameid}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Артикул">
              <Tag color="geekblue" style={{ fontSize: 13 }}>
                {selectedItem.articul}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="SKU">
              <Text copyable style={{ fontFamily: "monospace" }}>
                {selectedItem.sku}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Оригинальный номер">
              {selectedItem.original_number ? (
                <Text code copyable>
                  {selectedItem.original_number}
                </Text>
              ) : (
                <Text type="secondary">—</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Номер производителя">
              {selectedItem.manufacturer_number ? (
                <Text code copyable>
                  {selectedItem.manufacturer_number}
                </Text>
              ) : (
                <Text type="secondary">—</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="GUID производителя">
              <Text copyable style={{ fontFamily: "monospace", fontSize: 11 }}>
                {selectedItem.manufacturer}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="GUID товара">
              <Text copyable style={{ fontFamily: "monospace", fontSize: 11 }}>
                {selectedItem.good_guid}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Количество">
              <Tag
                color="blue"
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  padding: "2px 12px",
                }}
              >
                {selectedItem.qty}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Цена">
              <Text strong style={{ fontSize: 15, color: "#1890ff" }}>
                {selectedItem.price?.toLocaleString("ru-RU")} ₽
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Остаток на складе">
              <Tag
                color={
                  selectedItem.stock_quantity > 5
                    ? "green"
                    : selectedItem.stock_quantity > 0
                    ? "orange"
                    : "red"
                }
                style={{ fontWeight: 600, fontSize: 13 }}
              >
                {selectedItem.stock_quantity} шт.
              </Tag>
            </Descriptions.Item>
            {(selectedItem.width ||
              selectedItem.height ||
              selectedItem.length) && (
              <Descriptions.Item label="Габариты (Ш × В × Д)">
                {selectedItem.width ?? "—"} × {selectedItem.height ?? "—"} ×{" "}
                {selectedItem.length ?? "—"} мм
              </Descriptions.Item>
            )}
            {selectedItem.gross_weight && (
              <Descriptions.Item label="Вес брутто">
                {selectedItem.gross_weight} г
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default OzonTasksComponent;
