// pages/OzonTasksComponent.tsx
import React, { useState, useMemo, useCallback } from "react";
import {
  Input,
  Tag,
  Typography,
  Spin,
  Alert,
  Button,
  Tooltip,
  Modal,
  Descriptions,
  message,
  Empty,
} from "antd";
import {
  SearchOutlined,
  PrinterOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  LoadingOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  InboxOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
  ShoppingCartOutlined,
  BoxPlotOutlined,
} from "@ant-design/icons";
import {
  useGetTasksQuery,
  useGetPackageLabelMutation,
  useGetPackageLabelsBatchMutation,
  useAssignTaskMutation,
  useCompleteTaskMutation,
} from "../store/api/ozonProduct";

const { Text } = Typography;
const { confirm } = Modal;

// ============================================================
// Types
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
  posting: { guid: string; posting_number: string };
  order: { guid: string; marketplace_order_id: string; status: string };
  items: TaskItem[];
}

interface TaskWrapper {
  task: TaskData;
}

interface FlatTask extends TaskData {
  key: string;
}

// ============================================================
// Utils
// ============================================================
const STATUS_META: Record<
  string,
  { color: string; bg: string; label: string; icon: React.ReactNode }
> = {
  pending: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    label: "Ожидает",
    icon: <ClockCircleOutlined />,
  },
  in_progress: {
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    label: "В работе",
    icon: <BoxPlotOutlined />,
  },
  completed: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    label: "Завершён",
    icon: <CheckCircleOutlined />,
  },
  failed: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    label: "Ошибка",
    icon: <WarningOutlined />,
  },
  delivering: {
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    label: "Доставляется",
    icon: <InboxOutlined />,
  },
  awaiting_deliver: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    label: "Ожидает отгрузки",
    icon: <ClockCircleOutlined />,
  },
  cancelled: {
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    label: "Отменён",
    icon: <WarningOutlined />,
  },
  processing: {
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    label: "В обработке",
    icon: <BoxPlotOutlined />,
  },
};

const getStatusMeta = (s: string) =>
  STATUS_META[s?.toLowerCase()] || {
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
    label: s?.toUpperCase() || "N/A",
    icon: null,
  };

const openPdfBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const newWindow = window.open(url, "_blank");
  if (!newWindow) {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
};

// ============================================================
// Sub-components
// ============================================================
const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const meta = getStatusMeta(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        color: meta.color,
        background: meta.bg,
        border: `1px solid ${meta.color}33`,
        letterSpacing: "0.02em",
      }}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
};

const StockBadge: React.FC<{ qty: number }> = ({ qty }) => {
  const color = qty > 5 ? "#22c55e" : qty > 0 ? "#f59e0b" : "#ef4444";
  const bg =
    qty > 5
      ? "rgba(34,197,94,0.12)"
      : qty > 0
      ? "rgba(245,158,11,0.12)"
      : "rgba(239,68,68,0.12)";
  return (
    <span
      style={{
        color,
        background: bg,
        border: `1px solid ${color}33`,
        padding: "1px 8px",
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {qty} шт
    </span>
  );
};

// ============================================================
// Main Component
// ============================================================
const OzonTasksComponent: React.FC = () => {
  const {
    data: tasksData = [],
    isLoading,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetTasksQuery(undefined, { pollingInterval: 60000 });

  const [getPackageLabel] = useGetPackageLabelMutation();
  const [getPackageLabelsBatch, { isLoading: isBatchLabelLoading }] =
    useGetPackageLabelsBatchMutation();
  const [assignTask, { isLoading: isAssigning }] = useAssignTaskMutation();
  const [completeTask, { isLoading: isCompleting }] = useCompleteTaskMutation();

  const [searchText, setSearchText] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loadingLabelGuid, setLoadingLabelGuid] = useState<string | null>(null);
  const [itemModal, setItemModal] = useState<{
    open: boolean;
    item: TaskItem | null;
  }>({ open: false, item: null });

  // ── Process data ────────────────────────────────────────────
  const processedData: FlatTask[] = useMemo(() => {
    if (!isSuccess || !Array.isArray(tasksData)) return [];
    return tasksData.map((w: TaskWrapper, i: number) => ({
      ...w.task,
      key: w.task.guid || i.toString(),
    }));
  }, [tasksData, isSuccess]);

  const finalData = useMemo(() => {
    if (!searchText) return processedData;
    const q = searchText.toLowerCase();
    return processedData.filter(
      (t) =>
        t.status?.toLowerCase().includes(q) ||
        t.order?.marketplace_order_id?.toLowerCase().includes(q) ||
        t.posting?.posting_number?.toLowerCase().includes(q) ||
        t.items?.some(
          (i) =>
            i.nameid?.toLowerCase().includes(q) ||
            i.articul?.toLowerCase().includes(q) ||
            i.sku?.toLowerCase().includes(q)
        )
    );
  }, [searchText, processedData]);

  // ── Handlers ────────────────────────────────────────────────
  const handlePrintLabel = useCallback(
    async (record: FlatTask) => {
      const postingGuid = record.posting?.guid;
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
          openPdfBlob(
            blob,
            `label-${record.posting.posting_number || postingGuid}.pdf`
          );
          message.success(`Этикетка ${record.posting.posting_number} готова`);
        } else {
          message.error("Получен пустой файл");
        }
      } catch (err: any) {
        if (err?.error?.includes?.("not ready") || err?.ozon_error)
          message.warning(
            "Этикетка ещё не готова. Попробуйте через 45–60 секунд."
          );
        else
          message.error(
            err?.error || err?.data?.error || "Ошибка получения этикетки"
          );
      } finally {
        setLoadingLabelGuid(null);
      }
    },
    [getPackageLabel]
  );

  const handlePrintBatch = useCallback(async () => {
    if (!selectedKeys.length) {
      message.warning("Выберите задания");
      return;
    }
    if (selectedKeys.length > 20) {
      message.error("Макс. 20 отправлений");
      return;
    }
    const guids = selectedKeys
      .map((k) => processedData.find((t) => t.key === k)?.posting?.guid)
      .filter(Boolean) as string[];
    try {
      const blob = await getPackageLabelsBatch({
        posting_guids: guids,
      }).unwrap();
      if (blob instanceof Blob && blob.size > 0) {
        openPdfBlob(blob, `labels-${Date.now()}.pdf`);
        message.success(`Напечатано ${guids.length} этикеток`);
        setSelectedKeys([]);
      } else {
        message.error("Пустой файл");
      }
    } catch (err: any) {
      message.error(err?.error || err?.data?.error || "Ошибка пакетной печати");
    }
  }, [selectedKeys, processedData, getPackageLabelsBatch]);

  const handleAssign = useCallback(
    (record: FlatTask) => {
      confirm({
        title: "Взять заказ в обработку?",
        icon: <ExclamationCircleOutlined />,
        content: (
          <div style={{ paddingTop: 8 }}>
            <p>
              Отправление: <strong>{record.posting?.posting_number}</strong>
            </p>
            <p>
              Товаров: <strong>{record.items?.length || 0}</strong>
            </p>
            <p>
              Сумма:{" "}
              <strong>
                {record.items
                  ?.reduce((s, i) => s + i.price * i.qty, 0)
                  .toLocaleString("ru-RU")}{" "}
                ₽
              </strong>
            </p>
          </div>
        ),
        okText: "Взять в обработку",
        cancelText: "Отмена",
        okButtonProps: { loading: isAssigning },
        onOk: async () => {
          try {
            await assignTask({ task_guid: record.guid }).unwrap();
            message.success(
              `Заказ ${record.posting?.posting_number} взят в обработку`
            );
          } catch (err: any) {
            message.error(err?.data?.error || "Ошибка");
          }
        },
      });
    },
    [assignTask, isAssigning]
  );

  const handleComplete = useCallback(
    (record: FlatTask) => {
      confirm({
        title: "Завершить сборку?",
        icon: <CheckCircleOutlined style={{ color: "#22c55e" }} />,
        content: (
          <div style={{ paddingTop: 8 }}>
            <p>
              Отправление: <strong>{record.posting?.posting_number}</strong>
            </p>
            <p>Заказ будет передан на упаковку и отгрузку.</p>
          </div>
        ),
        okText: "Завершить",
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
            message.error(err?.data?.error || "Ошибка");
          }
        },
      });
    },
    [completeTask, isCompleting]
  );

  const toggleSelect = (key: string, canSelect: boolean) => {
    if (!canSelect) return;
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // ── States ───────────────────────────────────────────────────
  if (isLoading)
    return (
      <div style={styles.centerBox}>
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 40, color: "#3b82f6" }} />
          }
        />
        <p
          style={{
            color: "#94a3b8",
            marginTop: 16,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Загрузка заданий...
        </p>
      </div>
    );

  if (isError)
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Ошибка загрузки"
          type="error"
          showIcon
          description={
            JSON.stringify((error as any)?.data) ||
            "Не удалось получить данные."
          }
        />
      </div>
    );

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div style={styles.page}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <div>
            <div style={styles.headerTitle}>
              <BoxPlotOutlined style={{ color: "#3b82f6", fontSize: 22 }} />
              <span>Сборочные задания</span>
              <span style={styles.countBadge}>{processedData.length}</span>
            </div>
            <p style={styles.headerSub}>
              Ozon Fulfillment · Управление сборкой
            </p>
          </div>
          <Button
            onClick={refetch}
            icon={<ReloadOutlined />}
            style={styles.refreshBtn}
          >
            Обновить
          </Button>
        </div>

        {/* ── Toolbar ── */}
        <div style={styles.toolbar}>
          <Input
            placeholder="Поиск по отправлению, товару, артикулу..."
            prefix={<SearchOutlined style={{ color: "#64748b" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={styles.searchInput}
          />
          {selectedKeys.length > 0 && (
            <div style={styles.batchBar}>
              <span style={styles.batchCount}>
                <CheckSquareOutlined /> Выбрано:{" "}
                <strong>{selectedKeys.length}</strong>
              </span>
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
                onClick={handlePrintBatch}
                style={{
                  background: "#3b82f6",
                  borderColor: "#3b82f6",
                  borderRadius: 8,
                }}
              >
                Печать этикеток ({selectedKeys.length})
              </Button>
              <Button
                onClick={() => setSelectedKeys([])}
                style={{ borderRadius: 8 }}
              >
                Снять выбор
              </Button>
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        <div style={styles.statsRow}>
          {(["pending", "in_progress", "completed", "failed"] as const).map(
            (s) => {
              const meta = getStatusMeta(s);
              const count = processedData.filter(
                (t) => t.status?.toLowerCase() === s
              ).length;
              return (
                <div
                  key={s}
                  style={{ ...styles.statCard, borderColor: meta.color + "33" }}
                >
                  <span style={{ color: meta.color, fontSize: 20 }}>
                    {meta.icon}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#f1f5f9",
                        lineHeight: 1,
                      }}
                    >
                      {count}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}
                    >
                      {meta.label}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* ── Task Cards ── */}
        {finalData.length === 0 ? (
          <div style={styles.empty}>
            <Empty
              description={
                <span style={{ color: "#475569" }}>Нет заданий</span>
              }
            />
          </div>
        ) : (
          <div style={styles.cardGrid}>
            {finalData.map((task) => {
              const taskMeta = getStatusMeta(task.status);
              // const orderMeta = getStatusMeta(task.order?.status);
              const canSelect = task.order?.status === "awaiting_deliver";
              const isSelected = selectedKeys.includes(task.key);
              const isLabelLoading = loadingLabelGuid === task.posting?.guid;
              const totalSum =
                task.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0;
              const totalQty = task.items?.reduce((s, i) => s + i.qty, 0) || 0;

              return (
                <div
                  key={task.key}
                  className="task-card"
                  style={{
                    ...styles.taskCard,
                    ...(isSelected ? styles.taskCardSelected : {}),
                    borderColor: isSelected ? "#3b82f6" : taskMeta.color + "40",
                  }}
                >
                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <div style={styles.cardHeaderLeft}>
                      {canSelect && (
                        <div
                          onClick={() => toggleSelect(task.key, canSelect)}
                          style={{
                            ...styles.checkbox,
                            background: isSelected ? "#3b82f6" : "transparent",
                            borderColor: isSelected ? "#3b82f6" : "#475569",
                          }}
                        >
                          {isSelected && (
                            <CheckCircleOutlined
                              style={{ color: "#fff", fontSize: 12 }}
                            />
                          )}
                        </div>
                      )}
                      <div>
                        <div style={styles.postingNumber}>
                          {task.posting?.posting_number || "—"}
                        </div>
                        <div style={styles.orderId}>
                          ID: {task.order?.marketplace_order_id || "—"}
                        </div>
                      </div>
                    </div>
                    <div style={styles.cardHeaderRight}>
                      <StatusPill status={task.status} />
                      <StatusPill status={task.order?.status} />
                    </div>
                  </div>

                  {/* Meta row */}
                  <div style={styles.metaRow}>
                    <div style={styles.metaItem}>
                      <ShoppingCartOutlined style={{ color: "#64748b" }} />
                      <span>
                        {totalQty} товар
                        {totalQty === 1 ? "" : totalQty < 5 ? "а" : "ов"}
                      </span>
                    </div>
                    <div style={styles.metaItem}>
                      <span
                        style={{
                          color: "#3b82f6",
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {totalSum.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                    <div style={styles.metaItem}>
                      <ClockCircleOutlined style={{ color: "#64748b" }} />
                      <span>
                        {task.created_at
                          ? new Date(task.created_at).toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* ── Items Table ── */}
                  <div style={styles.itemsSection}>
                    <div style={styles.itemsHeader}>
                      <InboxOutlined
                        style={{ color: "#475569", fontSize: 13 }}
                      />
                      <span style={styles.itemsHeaderText}>Состав заказа</span>
                    </div>
                    <div style={styles.itemsTable}>
                      {/* Table head */}
                      <div style={styles.itemsTableHead}>
                        <span style={{ flex: 1 }}>Название</span>
                        <span style={{ width: 80, textAlign: "center" }}>
                          Артикул
                        </span>
                        <span style={{ width: 90, textAlign: "center" }}>
                          SKU
                        </span>
                        <span style={{ width: 55, textAlign: "center" }}>
                          Кол-во
                        </span>
                        <span style={{ width: 90, textAlign: "right" }}>
                          Цена
                        </span>
                        <span style={{ width: 70, textAlign: "center" }}>
                          Остаток
                        </span>
                        <span style={{ width: 32, textAlign: "center" }}></span>
                      </div>
                      {/* Table body */}
                      {task.items?.map((item, idx) => (
                        <div
                          key={item.posting_item_guid || idx}
                          className="item-row"
                          style={{
                            ...styles.itemRow,
                            background:
                              idx % 2 === 0
                                ? "transparent"
                                : "rgba(255,255,255,0.015)",
                          }}
                        >
                          <span
                            style={{
                              flex: 1,
                              color: "#222",
                              fontSize: 13,
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              paddingRight: 8,
                            }}
                          >
                            {item.nameid || "—"}
                          </span>
                          <span style={{ width: 80, textAlign: "center" }}>
                            <span style={styles.articulTag}>
                              {item.articul || "—"}
                            </span>
                          </span>
                          <span
                            style={{
                              width: 90,
                              textAlign: "center",
                              fontFamily: "monospace",
                              fontSize: 11,
                              color: "#64748b",
                            }}
                          >
                            {item.sku}
                          </span>
                          <span style={{ width: 55, textAlign: "center" }}>
                            <span style={styles.qtyBadge}>{item.qty}</span>
                          </span>
                          <span
                            style={{
                              width: 90,
                              textAlign: "right",
                              color: "#94a3b8",
                              fontSize: 13,
                            }}
                          >
                            {item.price?.toLocaleString("ru-RU")} ₽
                          </span>
                          <span style={{ width: 70, textAlign: "center" }}>
                            <StockBadge qty={item.stock_quantity} />
                          </span>
                          <span style={{ width: 32, textAlign: "center" }}>
                            <Tooltip title="Подробнее о товаре">
                              <button
                                className="detail-btn"
                                onClick={() =>
                                  setItemModal({ open: true, item })
                                }
                                style={styles.detailBtn}
                              >
                                <EyeOutlined />
                              </button>
                            </Tooltip>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Actions ── */}
                  <div style={styles.actions}>
                    {task.status?.toLowerCase() === "pending" && (
                      <button
                        className="action-btn action-btn--primary"
                        onClick={() => handleAssign(task)}
                        style={styles.actionBtnPrimary}
                      >
                        <PlayCircleOutlined /> В работу
                      </button>
                    )}
                    {task.status?.toLowerCase() === "in_progress" && (
                      <button
                        className="action-btn action-btn--success"
                        onClick={() => handleComplete(task)}
                        style={styles.actionBtnSuccess}
                      >
                        <CheckCircleOutlined /> Собрано
                      </button>
                    )}
                    <Tooltip
                      title={
                        task.order?.status !== "awaiting_deliver"
                          ? "Доступно только в статусе «Ожидает отгрузки»"
                          : "Напечатать этикетку"
                      }
                    >
                      <button
                        className="action-btn action-btn--print"
                        disabled={
                          task.order?.status !== "awaiting_deliver" ||
                          isLabelLoading
                        }
                        onClick={() => handlePrintLabel(task)}
                        style={{
                          ...styles.actionBtnPrint,
                          opacity:
                            task.order?.status !== "awaiting_deliver" ? 0.4 : 1,
                          cursor:
                            task.order?.status !== "awaiting_deliver"
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {isLabelLoading ? (
                          <LoadingOutlined />
                        ) : (
                          <PrinterOutlined />
                        )}
                        Этикетка
                      </button>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Item Detail Modal ── */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EyeOutlined style={{ color: "#3b82f6" }} />
            <span>Детали товара</span>
          </div>
        }
        open={itemModal.open}
        onCancel={() => setItemModal({ open: false, item: null })}
        footer={
          <Button
            type="primary"
            onClick={() => setItemModal({ open: false, item: null })}
          >
            Закрыть
          </Button>
        }
        width={600}
      >
        {itemModal.item && (
          <Descriptions
            bordered
            column={1}
            size="small"
            style={{ marginTop: 16 }}
          >
            <Descriptions.Item label="Название">
              <Text strong style={{ fontSize: 15 }}>
                {itemModal.item.nameid}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Артикул">
              <Tag color="geekblue">{itemModal.item.articul}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="SKU">
              <Text copyable style={{ fontFamily: "monospace" }}>
                {itemModal.item.sku}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Оригинальный номер">
              {itemModal.item.original_number ? (
                <Text code copyable>
                  {itemModal.item.original_number}
                </Text>
              ) : (
                <Text type="secondary">—</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Номер производителя">
              {itemModal.item.manufacturer_number ? (
                <Text code copyable>
                  {itemModal.item.manufacturer_number}
                </Text>
              ) : (
                <Text type="secondary">—</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Количество">
              <Tag
                color="blue"
                style={{ fontSize: 14, fontWeight: 700, padding: "2px 12px" }}
              >
                {itemModal.item.qty}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Цена">
              <Text strong style={{ fontSize: 15, color: "#1890ff" }}>
                {itemModal.item.price?.toLocaleString("ru-RU")} ₽
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Остаток">
              <StockBadge qty={itemModal.item.stock_quantity} />
            </Descriptions.Item>
            {(itemModal.item.width ||
              itemModal.item.height ||
              itemModal.item.length) && (
              <Descriptions.Item label="Габариты (Ш×В×Д)">
                {itemModal.item.width ?? "—"} × {itemModal.item.height ?? "—"} ×{" "}
                {itemModal.item.length ?? "—"} мм
              </Descriptions.Item>
            )}
            {itemModal.item.gross_weight && (
              <Descriptions.Item label="Вес брутто">
                {itemModal.item.gross_weight} г
              </Descriptions.Item>
            )}
            <Descriptions.Item label="GUID товара">
              <Text copyable style={{ fontFamily: "monospace", fontSize: 11 }}>
                {itemModal.item.good_guid}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

// ============================================================
// Styles
// ============================================================
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
  },
  centerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    background: "#f8fafc",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.03em",
  },
  countBadge: {
    background: "#dbeafe",
    color: "#2563eb",
    fontSize: 13,
    fontWeight: 700,
    padding: "2px 10px",
    borderRadius: 20,
    border: "1px solid #93c5fd",
  },
  headerSub: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 0,
  },
  refreshBtn: {
    background: "#ffffff",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    width: 380,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    color: "#0f172a",
  },
  batchBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#eff6ff",
    padding: "8px 16px",
    borderRadius: 10,
    border: "1px solid #bfdbfe",
  },
  batchCount: {
    color: "#2563eb",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  statsRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#ffffff",
    padding: "14px 20px",
    borderRadius: 12,
    border: "1px solid transparent",
    flex: "1 1 140px",
  },
  cardGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    // maxHeight: "70vh",
    overflow: "auto",
  },
  taskCard: {
    background: "#ffffff",
    border: "1px solid transparent",
    borderRadius: 14,
    overflow: "hidden",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  taskCardSelected: {
    boxShadow: "0 0 0 2px #3b82f640",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "16px 20px 12px",
    borderBottom: "1px solid #e2e8f0",
    background: "linear-gradient(90deg, #f1f5f9 0%, #ffffff 100%)",
  },
  cardHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  cardHeaderRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
    flexShrink: 0,
  },
  postingNumber: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1e293b",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    letterSpacing: "0.03em",
  },
  orderId: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "monospace",
  },
  metaRow: {
    display: "flex",
    gap: 24,
    padding: "10px 20px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#64748b",
  },
  itemsSection: {
    padding: "0",
  },
  itemsHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f1f5f9",
  },
  itemsHeaderText: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  itemsTable: {
    padding: "0",
  },
  itemsTableHead: {
    display: "flex",
    alignItems: "center",
    padding: "8px 20px",
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #e2e8f0",
    background: "#f1f5f9",
    gap: 0,
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    padding: "9px 20px",
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.15s",
    gap: 0,
  },
  articulTag: {
    display: "inline-block",
    background: "#dbeafe",
    color: "#2563eb",
    padding: "2px 8px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.03em",
  },
  qtyBadge: {
    display: "inline-block",
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "2px 10px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 800,
    border: "1px solid #93c5fd",
  },
  detailBtn: {
    background: "transparent",
    border: "1px solid #e2e8f0",
    color: "#94a3b8",
    cursor: "pointer",
    borderRadius: 6,
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    transition: "all 0.15s",
    padding: 0,
  },
  actions: {
    display: "flex",
    gap: 10,
    padding: "14px 20px",
    borderTop: "1px solid #e2e8f0",
    background: "#f8fafc",
    flexWrap: "wrap",
  },
  actionBtnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  actionBtnSuccess: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  actionBtnPrint: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#ffffff",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "7px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  empty: {
    background: "#ffffff",
    borderRadius: 14,
    padding: 60,
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
};

const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
  
    .task-card:hover {
      box-shadow: 0 4px 32px rgba(59,130,246,0.10) !important;
    }
    .item-row:hover {
      background: rgba(59,130,246,0.04) !important;
    }
    .detail-btn:hover {
      background: #f1f5f9 !important;
      color: #2563eb !important;
      border-color: #93c5fd !important;
    }
    .action-btn--primary:hover {
      background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(37,99,235,0.30) !important;
    }
    .action-btn--success:hover {
      background: linear-gradient(135deg, #15803d, #166534) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(22,163,74,0.30) !important;
    }
    .action-btn--print:hover:not(:disabled) {
      background: #f1f5f9 !important;
      color: #1e293b !important;
      border-color: #cbd5e1 !important;
    }
  
    /* Override Ant Design search input for light theme */
    .ant-input-affix-wrapper {
      background: #ffffff !important;
      border-color: #e2e8f0 !important;
      color: #0f172a !important;
      border-radius: 10px !important;
    }
    .ant-input-affix-wrapper input {
      background: transparent !important;
      color: #0f172a !important;
    }
    .ant-input-affix-wrapper:hover,
    .ant-input-affix-wrapper:focus-within {
      border-color: #3b82f6 !important;
    }
    .ant-input-clear-icon { color: #94a3b8 !important; }
  `;

export default OzonTasksComponent;
