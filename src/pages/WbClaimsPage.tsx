import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Card,
  Statistic,
  Modal,
  Form,
  Typography,
  Tooltip,
  message,
  Drawer,
  Descriptions,
  Row,
  Col,
  Divider,
  Alert,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  CheckOutlined,
  CloseOutlined,
  QuestionOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";

import {
  useGetWbClaimsQuery,
  useGetWbClaimByIdQuery,
  useGetWbClaimsStatsQuery,
  useApproveWbClaimMutation,
  useRejectWbClaimMutation,
  type WbClaim,
  type GetClaimsParams,
} from "../store/api/wbClaimsApi";

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

// ─────────────────────────────────────────────
// 🎨 Конфиг статусов
// ─────────────────────────────────────────────

type StatusKey = "pending" | "approved" | "rejected" | "unknown";

interface StatusConfig {
  color: string;
  icon: React.ReactNode;
  label: string;
}

const STATUS_CONFIG: Record<StatusKey, StatusConfig> = {
  pending: {
    color: "gold",
    icon: <ExclamationCircleOutlined />,
    label: "Ожидает",
  },
  approved: {
    color: "green",
    icon: <CheckCircleOutlined />,
    label: "Одобрено",
  },
  rejected: { color: "red", icon: <CloseCircleOutlined />, label: "Отклонено" },
  unknown: {
    color: "default",
    icon: <QuestionOutlined />,
    label: "Неизвестно",
  },
};

const getStatusConfig = (status: string): StatusConfig =>
  STATUS_CONFIG[status as StatusKey] ?? {
    color: "blue",
    icon: null,
    label: status,
  };

// ─────────────────────────────────────────────
// 📝 Типы
// ─────────────────────────────────────────────

interface RejectFormValues {
  reason: string;
}

interface StatCard {
  value: number;
  color: string;
  bg: string;
}

// ─────────────────────────────────────────────
// 🖥️ Основной компонент
// ─────────────────────────────────────────────

const WbClaimsPage: React.FC = () => {
  // ── Фильтры и пагинация ───────────────────
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [claimType, setClaimType] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[string, string] | []>([]);

  // ── Детальная панель ──────────────────────
  const [selectedGuid, setSelectedGuid] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // ── Модалка отклонения ────────────────────
  const [rejectTarget, setRejectTarget] = useState<WbClaim | null>(null);
  const [rejectModal, setRejectModal] = useState<boolean>(false);
  const [rejectForm] = Form.useForm<RejectFormValues>();

  // ─────────────────────────────────────────────
  // 🔌 RTK Query хуки
  // ─────────────────────────────────────────────

  const queryParams: GetClaimsParams = {
    page,
    pageSize,
    ...(search && { search }),
    ...(status && { status }),
    ...(claimType && { claim_type: claimType }),
    ...(dateRange.length === 2 && {
      dateFrom: dateRange[0],
      dateTo: dateRange[1],
    }),
  };

  const {
    data: claimsData,
    isLoading: claimsLoading,
    isFetching: claimsFetching,
    refetch: refetchClaims,
  } = useGetWbClaimsQuery(queryParams, {
    pollingInterval: 60_000,
    refetchOnFocus: true,
  });

  const { data: statsData, refetch: refetchStats } = useGetWbClaimsStatsQuery(
    undefined,
    {
      pollingInterval: 60_000,
    }
  );

  const { data: detailData, isLoading: detailLoading } = useGetWbClaimByIdQuery(
    selectedGuid!,
    {
      skip: !selectedGuid,
    }
  );

  const [approveClaim, { isLoading: approveLoading }] =
    useApproveWbClaimMutation();
  const [rejectClaim, { isLoading: rejectLoading }] =
    useRejectWbClaimMutation();

  // ── Деструктурируем данные ────────────────
  const claims = claimsData?.data ?? [];
  const total = claimsData?.pagination.total ?? 0;
  const stats = statsData?.data ?? null;
  const detailItem = detailData?.data ?? null;

  const isActionLoading = approveLoading || rejectLoading;
  const isPendingStatus = (s: string) => s === "pending" || s === "unknown";

  // ─────────────────────────────────────────────
  // ⚡ Обработчики
  // ─────────────────────────────────────────────

  const handleRefresh = (): void => {
    void refetchClaims();
    void refetchStats();
  };

  const handleReset = (): void => {
    setSearch("");
    setStatus(undefined);
    setClaimType(undefined);
    setDateRange([]);
    setPage(1);
  };

  const openDetail = (guid: string): void => {
    setSelectedGuid(guid);
    setDrawerOpen(true);
  };

  const closeDrawer = (): void => {
    setDrawerOpen(false);
    setSelectedGuid(null);
  };

  // ── Одобрить заявку ───────────────────────
  const handleApprove = (record: WbClaim): void => {
    confirm({
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      okText: "Одобрить",
      okType: "primary",
      cancelText: "Отмена",
      content: (
        <span>
          Заявка <Text code>{record.claim_id}</Text> будет одобрена на
          Wildberries.
        </span>
      ),
      onOk: async () => {
        try {
          await approveClaim({ claimId: record.claim_id }).unwrap();
          void message.success("Заявка успешно одобрена!");
          if (drawerOpen) closeDrawer();
        } catch (err: unknown) {
          const e = err as { data?: { message?: string }; message?: string };
          void message.error(
            e?.data?.message ?? e?.message ?? "Ошибка при одобрении"
          );
        }
      },
    });
  };

  // ── Открыть модалку отклонения ────────────
  const openRejectModal = (record: WbClaim): void => {
    setRejectTarget(record);
    setRejectModal(true);
    rejectForm.resetFields();
  };

  // ── Отклонить заявку ──────────────────────
  const handleReject = async (): Promise<void> => {
    if (!rejectTarget) return;
    try {
      const { reason } = await rejectForm.validateFields();
      await rejectClaim({ claimId: rejectTarget.claim_id, reason }).unwrap();
      void message.success("Заявка отклонена");
      setRejectModal(false);
      if (drawerOpen) closeDrawer();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      if (e?.data?.message) void message.error(e.data.message);
      // Ошибка валидации формы Ant Design — молча игнорируем
    }
  };

  // ─────────────────────────────────────────────
  // 📋 Колонки таблицы
  // ─────────────────────────────────────────────

  const columns: ColumnsType<WbClaim> = [
    {
      dataIndex: "claim_id",
      key: "claim_id",
      width: 200,
      render: (v: string) => (
        <Text code copyable style={{ fontSize: 11 }}>
          {v}
        </Text>
      ),
    },
    {
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (v: string) => {
        const cfg = getStatusConfig(v);
        return (
          <Tag icon={cfg.icon} color={cfg.color}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      dataIndex: "claim_type",
      key: "claim_type",
      width: 130,
      render: (v: string | null) =>
        v ? <Tag color="blue">{v}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: "Товар",
      dataIndex: "good_name",
      key: "good_name",
      ellipsis: true,
      render: (v: string | null, record: WbClaim) => (
        <Space direction="vertical" size={0}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {v ?? <Text type="secondary">Не найден</Text>}
          </Text>
          {record.product_offer_id && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              Арт: {record.product_offer_id}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "ина",
      dataIndex: "return_reason",
      key: "return_reason",
      ellipsis: true,
      render: (v: string | null) =>
        v ? (
          <Tooltip title={v}>
            <Text ellipsis style={{ maxWidth: 180 }}>
              {v}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      dataIndex: "return_date",
      key: "return_date",
      width: 130,
      render: (v: string | null) =>
        v ? (
          dayjs(v).format("DD.MM.YYYY HH:mm")
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      key: "actions",
      width: 160,
      fixed: "right",
      render: (_: unknown, record: WbClaim) => (
        <Space size={4}>
          <Tooltip title="Подробнее">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openDetail(record.guid)}
            />
          </Tooltip>
          {isPendingStatus(record.status) && (
            <>
              <Tooltip title="Одобрить">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={approveLoading}
                  style={{ background: "#52c41a", borderColor: "#52c41a" }}
                  onClick={() => handleApprove(record)}
                />
              </Tooltip>
              <Tooltip title="Отклонить">
                <Button
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  loading={rejectLoading}
                  onClick={() => openRejectModal(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // ─────────────────────────────────────────────
  // 📊 Карточки статистики
  // ─────────────────────────────────────────────

  const statCards: any[] = stats
    ? [
        { title: "Всего", value: stats.total, color: "#1677ff", bg: "#e6f4ff" },
        {
          title: "Ожидают",
          value: stats.pending,
          color: "#faad14",
          bg: "#fffbe6",
        },
        {
          title: "Одобрено",
          value: stats.approved,
          color: "#52c41a",
          bg: "#f6ffed",
        },
        {
          title: "Отклонено",
          value: stats.rejected,
          color: "#ff4d4f",
          bg: "#fff2f0",
        },
      ]
    : [];

  // ─────────────────────────────────────────────
  // 🖼️ Рендер
  // ─────────────────────────────────────────────

  return (
    <div style={{ padding: 24 }}>
      {/* ── Заголовок ─────────────────────── */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          🟡 Заявки Wildberries
        </Title>
        <Button
          icon={<ReloadOutlined />}
          loading={claimsFetching}
          onClick={handleRefresh}
        >
          Обновить
        </Button>
      </div>

      {/* ── Статистика ─────────────────────── */}
      {statCards.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {statCards.map((s: any) => (
            <Col xs={12} sm={6} key={s.title}>
              <Card
                size="small"
                style={{
                  borderColor: s.color,
                  background: s.bg,
                  borderRadius: 8,
                }}
              >
                <Statistic
                  title={
                    <Text style={{ color: s.color, fontWeight: 600 }}>
                      {s.title}
                    </Text>
                  }
                  value={s.value}
                  valueStyle={{ color: s.color, fontWeight: 700, fontSize: 28 }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ── Фильтры ───────────────────────── */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 8 }}>
        <Space wrap>
          <Input
            placeholder="Поиск по ID, артикулу, комментарию..."
            prefix={<SearchOutlined />}
            value={search}
            allowClear
            style={{ width: 280 }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            placeholder="Статус"
            value={status}
            allowClear
            style={{ width: 150 }}
            onChange={(v: string | undefined) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <Option value="pending">Ожидает</Option>
            <Option value="approved">Одобрено</Option>
            <Option value="rejected">Отклонено</Option>
            <Option value="unknown">Неизвестно</Option>
          </Select>
          <Select
            placeholder="Тип заявки"
            value={claimType}
            allowClear
            style={{ width: 160 }}
            onChange={(v: string | undefined) => {
              setClaimType(v);
              setPage(1);
            }}
          >
            <Option value="Defective">Бракованный</Option>
            <Option value="NotFit">Не подошел</Option>
            <Option value="WrongItem">Не тот товар</Option>
          </Select>
          <RangePicker
            value={
              dateRange.length === 2
                ? [dayjs(dateRange[0]), dayjs(dateRange[1])]
                : undefined
            }
            format="DD.MM.YYYY"
            placeholder={["Дата от", "Дата до"]}
            onChange={(dates: [Dayjs | null, Dayjs | null] | null) => {
              if (dates?.[0] && dates?.[1]) {
                setDateRange([dates[0].toISOString(), dates[1].toISOString()]);
              } else {
                setDateRange([]);
              }
              setPage(1);
            }}
          />
          <Button onClick={handleReset}>Сбросить</Button>
        </Space>
      </Card>

      {/* ── Таблица ───────────────────────── */}
      <Card style={{ borderRadius: 8 }} styles={{ body: { padding: 0 } }}>
        <Table<WbClaim>
          rowKey="guid"
          columns={columns}
          dataSource={claims}
          loading={claimsLoading || claimsFetching}
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (t: number) => `Всего ${t} заявок`,
            onChange: (p: number, ps: number) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          rowClassName={(record: WbClaim) =>
            isPendingStatus(record.status) ? "claims-row-pending" : ""
          }
        />
      </Card>

      {/* ── Drawer — детали заявки ────────── */}
      <Drawer
        title={
          <Space>
            <InboxOutlined />
            <span>Детали заявки</span>
            {detailItem && (
              <Tag color={getStatusConfig(detailItem.status).color}>
                {getStatusConfig(detailItem.status).label}
              </Tag>
            )}
          </Space>
        }
        width={520}
        open={drawerOpen}
        onClose={closeDrawer}
        loading={detailLoading}
        extra={
          detailItem && isPendingStatus(detailItem.status) ? (
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={isActionLoading}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
                onClick={() => handleApprove(detailItem)}
              >
                Одобрить
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                loading={isActionLoading}
                onClick={() => openRejectModal(detailItem)}
              >
                Отклонить
              </Button>
            </Space>
          ) : null
        }
      >
        {detailItem && (
          <>
            {isPendingStatus(detailItem.status) && (
              <Alert
                message="Эта заявка ожидает вашего ответа"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="ID заявки">
                <Text code copyable>
                  {detailItem.claim_id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Тип">
                {detailItem.claim_type ? (
                  <Tag color="blue">{detailItem.claim_type}</Tag>
                ) : (
                  "—"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Товар">
                {detailItem.good_name ?? (
                  <Text type="secondary">Не найден</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Артикул">
                {detailItem.product_offer_id ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="SKU">
                {detailItem.product_sku ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Причина возврата">
                {detailItem.return_reason ?? (
                  <Text type="secondary">Не указана</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Комментарий покупателя">
                {detailItem.user_comment ?? (
                  <Text type="secondary">Не указан</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Дата возврата">
                {detailItem.return_date
                  ? dayjs(detailItem.return_date).format("DD.MM.YYYY HH:mm")
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Добавлено">
                {dayjs(detailItem.created_at).format("DD.MM.YYYY HH:mm")}
              </Descriptions.Item>
              {detailItem.updated_at && (
                <Descriptions.Item label="Обновлено">
                  {dayjs(detailItem.updated_at).format("DD.MM.YYYY HH:mm")}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />
          </>
        )}
      </Drawer>

      {/* ── Модалка отклонения ────────────── */}
      <Modal
        open={rejectModal}
        okText="Отклонить"
        cancelText="Отмена"
        okButtonProps={{ danger: true, loading: rejectLoading }}
        title={
          <Space>
            <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
            Отклонить заявку
          </Space>
        }
        onOk={handleReject}
        onCancel={() => setRejectModal(false)}
      >
        {rejectTarget && (
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            Заявка: <Text code>{rejectTarget.claim_id}</Text>
          </Text>
        )}
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Причина отклонения"
            rules={[
              { required: true, message: "Введите причину" },
              { min: 10, message: "Минимум 10 символов" },
            ]}
          >
            <Input.TextArea
              rows={4}
              showCount
              maxLength={500}
              placeholder="Например: Товар не имеет видимых дефектов, возврат невозможен..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Стили подсветки строк ─────────── */}
      <style>{`
        .claims-row-pending td           { background-color: #fffbe6 !important; }
        .claims-row-pending:hover td     { background-color: #fff3cc !important; }
      `}</style>
    </div>
  );
};

export default WbClaimsPage;
