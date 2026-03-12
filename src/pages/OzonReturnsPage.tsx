import { useState, useEffect, useCallback } from "react";

const BASE_URL = "https://nazar-backend.333.kg/api/returns";

// ── API helpers ────────────────────────────────────────────────
const api = {
  getReturns: async (params = {}) => {
    const query: any = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== "" && v != null) query.set(k, v);
    });
    const res = await fetch(`${BASE_URL}?${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  getStats: async () => {
    const res = await fetch(`${BASE_URL}/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  getById: async (guid: any) => {
    const res = await fetch(`${BASE_URL}/${guid}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  sync: async () => {
    const res = await fetch(`${BASE_URL}/sync`, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};

// ── useDebounce ────────────────────────────────────────────────
function useDebounce(value: any, delay: any = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const STATUS_CONFIG: any = {
  accepted: {
    label: "Принят",
    color: "#16a34a",
    bg: "#dcfce7",
    border: "#86efac",
  },
  waiting_for_seller: {
    label: "Ожидает продавца",
    color: "#d97706",
    bg: "#fef3c7",
    border: "#fcd34d",
  },
  in_transit: {
    label: "В пути",
    color: "#2563eb",
    bg: "#dbeafe",
    border: "#93c5fd",
  },
  declined: {
    label: "Отклонён",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fca5a5",
  },
  disposed: {
    label: "Утилизирован",
    color: "#7c3aed",
    bg: "#ede9fe",
    border: "#c4b5fd",
  },
  unknown: {
    label: "Неизвестно",
    color: "#64748b",
    bg: "#f1f5f9",
    border: "#e2e8f0",
  },
  MovingToOzon: {
    label: "Едет на Ozon",
    color: "#0284c7",
    bg: "#e0f2fe",
    border: "#7dd3fc",
  },
  ReturnedToOzon: {
    label: "Возвращён на Ozon",
    color: "#0891b2",
    bg: "#cffafe",
    border: "#67e8f9",
  },
  WaitingShipment: {
    label: "Ожидает отправки",
    color: "#b45309",
    bg: "#fef9c3",
    border: "#fde047",
  },
  MovingToSeller: {
    label: "Едет продавцу",
    color: "#7c3aed",
    bg: "#f3e8ff",
    border: "#d8b4fe",
  },
};

const TYPE_CONFIG: any = {
  FBO: { color: "#0369a1", bg: "#e0f2fe", border: "#7dd3fc" },
  FBS: { color: "#059669", bg: "#d1fae5", border: "#6ee7b7" },
  rFBS: { color: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd" },
};

const fmtDate = (iso: any) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const fmtDateTime = (iso: any) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Icons ──────────────────────────────────────────────────────
const Icon = ({
  d,
  size = 16,
  stroke = "currentColor",
  fill = "none",
}: any) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const Icons = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  package: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  arrowR: "M9 5l7 7-7 7",
  arrowL: "M15 19l-7-7 7-7",
  x: "M6 18L18 6M6 6l12 12",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  sync: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  total:
    "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  undo: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
  warn: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  check: "M5 13l4 4L19 7",
};

// ── Toast ──────────────────────────────────────────────────────
const Toast = ({ toasts }: any) => (
  <div
    style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}
  >
    {toasts.map((t: any) => (
      <div
        key={t.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background:
            t.type === "error"
              ? "#fee2e2"
              : t.type === "success"
              ? "#dcfce7"
              : "#dbeafe",
          border: `1px solid ${
            t.type === "error"
              ? "#fca5a5"
              : t.type === "success"
              ? "#86efac"
              : "#93c5fd"
          }`,
          color:
            t.type === "error"
              ? "#dc2626"
              : t.type === "success"
              ? "#16a34a"
              : "#2563eb",
          borderRadius: 10,
          padding: "10px 16px",
          fontSize: 13,
          fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)",
          minWidth: 240,
          maxWidth: 360,
        }}
      >
        <Icon d={t.type === "error" ? Icons.warn : Icons.check} size={16} />
        <span style={{ flex: 1 }}>{t.message}</span>
      </div>
    ))}
  </div>
);

// ── StatusBadge ────────────────────────────────────────────────
const StatusBadge = ({ status }: any) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.color,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
};

// ── TypeBadge ──────────────────────────────────────────────────
const TypeBadge = ({ type }: any) => {
  const cfg = TYPE_CONFIG[type] || {
    color: "#64748b",
    bg: "#f1f5f9",
    border: "#e2e8f0",
  };
  return (
    <span
      style={{
        display: "inline-block",
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        padding: "2px 9px",
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
      }}
    >
      {type || "—"}
    </span>
  );
};

// ── StatCard ───────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent, loading }: any) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 14,
      padding: "16px 20px",
      border: "1px solid #e2e8f0",
      flex: "1 1 150px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.2s",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.boxShadow = `0 4px 20px ${accent}22`)
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)")
    }
  >
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 11,
        background: `${accent}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: accent,
        flexShrink: 0,
      }}
    >
      <Icon d={icon} size={20} />
    </div>
    <div>
      {loading ? (
        <div
          style={{
            width: 60,
            height: 22,
            borderRadius: 6,
            background: "#f1f5f9",
            animation: "pulse 1.2s ease infinite",
          }}
        />
      ) : (
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {(value ?? 0).toLocaleString("ru-RU")}
        </div>
      )}
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
        {label}
      </div>
    </div>
  </div>
);

// ── Skeleton Row ───────────────────────────────────────────────
const SkeletonRow = () => (
  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
    {[40, 140, 60, 140, 120, 120, 40, 100, 100, 80].map((w, i) => (
      <td key={i} style={{ padding: "14px 16px" }}>
        <div
          style={{
            height: 13,
            width: w,
            borderRadius: 6,
            background: "#f1f5f9",
            animation: "pulse 1.2s ease infinite",
            animationDelay: `${i * 0.05}s`,
          }}
        />
      </td>
    ))}
  </tr>
);

// ── ReturnRow ──────────────────────────────────────────────────
const ReturnRow = ({ ret, selected, onSelect, onView }: any) => {
  const [hovered, setHovered] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected ? "#eff6ff" : hovered ? "#f8fafc" : "#fff",
        transition: "background 0.12s",
        cursor: "default",
        borderBottom: "1px solid #f8fafc",
      }}
    >
      <td style={{ padding: "11px 8px 11px 20px", width: 40 }}>
        <div
          onClick={() => onSelect(ret.guid)}
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            border: `2px solid ${selected ? "#2563eb" : "#cbd5e1"}`,
            background: selected ? "#2563eb" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {selected && (
            <svg width={10} height={10} viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </td>
      <td style={{ padding: "11px 16px 11px 8px", whiteSpace: "nowrap" }}>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            color: "#1e293b",
          }}
        >
          {ret.return_number || `#${ret.return_id}`}
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
          #{ret.return_id}
        </div>
      </td>
      <td style={{ padding: "11px 16px" }}>
        <TypeBadge type={ret.return_type} />
      </td>
      <td style={{ padding: "11px 16px" }}>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: "#475569",
          }}
        >
          {ret.posting_number || "—"}
        </span>
      </td>
      <td style={{ padding: "11px 16px" }}>
        <div
          style={{
            display: "inline-block",
            background: "#dbeafe",
            color: "#2563eb",
            padding: "2px 8px",
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {ret.product_offer_id || "—"}
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
          SKU {ret.product_sku || "—"}
        </div>
      </td>
      <td style={{ padding: "11px 16px", maxWidth: 200 }}>
        <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.4 }}>
          {ret.return_reason || "—"}
        </span>
      </td>
      <td style={{ padding: "11px 16px", textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            background: "#f1f5f9",
            color: "#374151",
            border: "1px solid #e2e8f0",
            padding: "2px 10px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 800,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {ret.qty ?? 1}
        </span>
      </td>
      <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
        <div style={{ fontSize: 13, color: "#374151" }}>
          {fmtDate(ret.return_date)}
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
          {fmtDateTime(ret.updated_at)}
        </div>
      </td>
      <td style={{ padding: "11px 16px" }}>
        <StatusBadge status={ret.status} />
      </td>
      <td style={{ padding: "11px 20px 11px 8px" }}>
        <button
          onClick={() => onView(ret)}
          style={{
            background: "transparent",
            border: "1px solid #e2e8f0",
            borderRadius: 7,
            padding: "4px 10px",
            color: "#64748b",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#eff6ff";
            e.currentTarget.style.color = "#2563eb";
            e.currentTarget.style.borderColor = "#93c5fd";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#64748b";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          <Icon d={Icons.eye} size={13} /> Детали
        </button>
      </td>
    </tr>
  );
};

// ── DetailDrawer ───────────────────────────────────────────────
const DetailDrawer = ({ ret, onClose, loadingDetail }: any) => {
  if (!ret) return null;

  const rows = [
    ["GUID", ret.guid],
    ["Return ID", ret.return_id],
    ["Номер возврата", ret.return_number],
    ["Тип", <TypeBadge type={ret.return_type} />],
    ["Статус", <StatusBadge status={ret.status} />],
    ["Причина", ret.return_reason],
    ["Дата возврата", fmtDateTime(ret.return_date)],
    ["Номер отправления", ret.posting_number],
    ["Артикул (offer_id)", ret.product_offer_id],
    ["SKU", ret.product_sku],
    ["ID заказа маркетплейса", ret.marketplace_order_id],
    ["Количество", ret.qty],
    ["Создан", fmtDateTime(ret.created_at)],
    ["Обновлён", fmtDateTime(ret.updated_at)],
  ];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.35)",
          backdropFilter: "blur(2px)",
          zIndex: 40,
          animation: "fadeIn 0.2s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: 480,
          background: "#fff",
          zIndex: 50,
          boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          animation: "slideIn 0.25s cubic-bezier(0.16,1,0.3,1)",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            borderBottom: "1px solid #e2e8f0",
            background: "linear-gradient(135deg, #f8fafc 0%, #fff 100%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#dbeafe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2563eb",
                }}
              >
                <Icon d={Icons.undo} size={16} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                Детали возврата
              </span>
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 13,
                color: "#64748b",
              }}
            >
              {ret.return_number || `#${ret.return_id}`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.color = "#64748b";
            }}
          >
            <Icon d={Icons.x} size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {loadingDetail ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    width: "40%",
                    height: 12,
                    borderRadius: 6,
                    background: "#f1f5f9",
                    animation: "pulse 1.2s ease infinite",
                  }}
                />
                <div
                  style={{
                    width: "55%",
                    height: 12,
                    borderRadius: 6,
                    background: "#f1f5f9",
                    animation: "pulse 1.2s ease infinite",
                    animationDelay: "0.1s",
                  }}
                />
              </div>
            ))
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {rows.map(([k, v], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td
                      style={{
                        padding: "10px 0",
                        width: "45%",
                        fontSize: 12,
                        color: "#94a3b8",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        verticalAlign: "top",
                        paddingTop: 12,
                      }}
                    >
                      {k}
                    </td>
                    <td
                      style={{
                        padding: "10px 0 10px 12px",
                        fontSize: 13,
                        color: "#1e293b",
                        verticalAlign: "top",
                        paddingTop: 12,
                      }}
                    >
                      {typeof v === "string" || typeof v === "number" ? (
                        <span
                          style={{
                            fontFamily:
                              typeof v === "string" && v.length > 15
                                ? "'DM Mono', monospace"
                                : "inherit",
                          }}
                        >
                          {v ?? "—"}
                        </span>
                      ) : (
                        v ?? "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
            OZON Marketplace · Returns
          </div>
        </div>
      </div>
    </>
  );
};

// ── StatusBar ──────────────────────────────────────────────────
const StatusBar = ({ byStatus, total, loading }: any) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 14,
      border: "1px solid #e2e8f0",
      padding: "16px 20px",
      flex: "0 0 260px",
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 12,
      }}
    >
      По статусам
    </div>
    {loading
      ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div
              style={{
                height: 11,
                width: "80%",
                borderRadius: 6,
                background: "#f1f5f9",
                marginBottom: 6,
                animation: "pulse 1.2s ease infinite",
              }}
            />
            <div
              style={{
                height: 5,
                borderRadius: 99,
                background: "#f1f5f9",
                animation: "pulse 1.2s ease infinite",
              }}
            />
          </div>
        ))
      : (byStatus || []).map(({ label, count }: any) => {
          const cfg = STATUS_CONFIG[label] || { label, color: "#64748b" };
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={label} style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 12, color: "#475569" }}>
                  {cfg.label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: cfg.color,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {count.toLocaleString("ru-RU")}
                </span>
              </div>
              <div
                style={{
                  height: 5,
                  background: "#f1f5f9",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: cfg.color,
                    borderRadius: 99,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
  </div>
);

// ══════════════════════════════════════════════════════════════
// ── MAIN PAGE ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
export default function ReturnsPage() {
  // ── data state ──
  const [returns, setReturns] = useState<any>([]);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState<any>({
    total: 0,
    page: 1,
    limit: 15,
    total_pages: 1,
  });

  // ── ui state ──
  const [loadingList, setLoadingList] = useState<any>(false);
  const [loadingStats, setLoadingStats] = useState<any>(false);
  const [loadingDetail, setLoadingDetail] = useState<any>(false);
  const [syncing, setSyncing] = useState<any>(false);
  const [toasts, setToasts] = useState<any>([]);
  const [detailRet, setDetailRet] = useState<any>(null);
  const [selected, setSelected] = useState<any>(new Set());
  const [showFilters, setShowFilters] = useState<any>(false);

  // ── filter state ──
  const [search, setSearch] = useState<any>("");
  const [filterType, setFilterType] = useState<any>("");
  const [filterStatus, setFilterStatus] = useState<any>("");
  const [dateFrom, setDateFrom] = useState<any>("");
  const [dateTo, setDateTo] = useState<any>("");
  const [page, setPage] = useState<any>(1);
  const LIMIT = 15;

  const debouncedSearch = useDebounce(search, 450);

  // ── Toast helper ──
  const addToast = useCallback((message: any, type: any = "info") => {
    const id = Date.now();
    setToasts((p: any) => [...p, { id, message, type }]);
    setTimeout(
      () => setToasts((p: any) => p.filter((t: any) => t.id !== id)),
      4000
    );
  }, []);

  // ══ Fetch returns list ═════════════════════════════════════
  const fetchReturns = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await api.getReturns({
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        type: filterType || undefined,
        status: filterStatus || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      if (data.success) {
        setReturns(data.returns || []);
        setPagination(
          data.pagination || { total: 0, page: 1, limit: LIMIT, total_pages: 1 }
        );
      } else {
        throw new Error(data.error || "Ошибка загрузки");
      }
    } catch (err: any) {
      addToast(`Ошибка загрузки списка: ${err.message}`, "error");
      setReturns([]);
    } finally {
      setLoadingList(false);
    }
  }, [page, debouncedSearch, filterType, filterStatus, dateFrom, dateTo]);

  // ══ Fetch stats ════════════════════════════════════════════
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await api.getStats();
      if (data.success) setStats(data);
      else throw new Error(data.error || "Ошибка статистики");
    } catch (err: any) {
      addToast(`Ошибка статистики: ${err.message}`, "error");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ══ View detail (fetch fresh from API) ════════════════════
  const handleView = useCallback(async (ret: any) => {
    setDetailRet(ret); // показываем drawer сразу с кэшированными данными
    setLoadingDetail(true);
    try {
      const data = await api.getById(ret.guid);
      if (data.success) setDetailRet(data.return);
    } catch (err: any) {
      addToast(`Ошибка загрузки деталей: ${err.message}`, "error");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // ══ Sync ══════════════════════════════════════════════════
  const handleSync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    addToast("Синхронизация запущена...", "info");
    try {
      const data = await api.sync();
      if (data.success) {
        const r = data.result;
        const msg = [
          r?.fbo_fbs &&
            `FBO/FBS: +${r.fbo_fbs.created ?? 0} / ~${r.fbo_fbs.updated ?? 0}`,
          r?.rfbs && `rFBS: +${r.rfbs.created ?? 0} / ~${r.rfbs.updated ?? 0}`,
        ]
          .filter(Boolean)
          .join(" · ");
        addToast(`Синхронизация завершена. ${msg}`, "success");
        await Promise.all([fetchReturns(), fetchStats()]);
      } else {
        throw new Error(data.error || "Ошибка");
      }
    } catch (err: any) {
      addToast(`Ошибка синхронизации: ${err.message}`, "error");
    } finally {
      setSyncing(false);
    }
  }, [syncing, fetchReturns, fetchStats]);

  // ══ Effects ════════════════════════════════════════════════
  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  // сбрасываем страницу при изменении фильтров
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterType, filterStatus, dateFrom, dateTo]);

  // ── Helpers ──
  const toggleSelect = (guid: any) => {
    setSelected((prev: any) => {
      const s = new Set(prev);
      s.has(guid) ? s.delete(guid) : s.add(guid);
      return s;
    });
  };

  const toggleAll = () => {
    if (selected.size === returns.length) setSelected(new Set());
    else setSelected(new Set(returns.map((r: any) => r.guid)));
  };

  const resetFilters = () => {
    setSearch("");
    setFilterType("");
    setFilterStatus("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasFilters = filterType || filterStatus || dateFrom || dateTo;
  const hasAnyFilter = search || hasFilters;
  const totalPages = pagination.total_pages || 1;

  // ── Pagination pages array ──
  const pageNumbers = (() => {
    const total = totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", total];
    if (page >= total - 3)
      return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "…", page - 1, page, page + 1, "…", total];
  })();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        @keyframes fadeIn    { from { opacity: 0 }            to { opacity: 1 } }
        @keyframes slideIn   { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes slideInRight { from { transform: translateX(120%); opacity:0 } to { transform: translateX(0); opacity:1 } }
        @keyframes spin      { to { transform: rotate(360deg) } }
        @keyframes pulse     { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
        input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
      `}</style>

      <div style={{ margin: "0 auto" }}>
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon d={Icons.undo} size={18} stroke="#fff" />
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                }}
              >
                Возвраты
              </h1>
              {!loadingList && (
                <span
                  style={{
                    background: "#dbeafe",
                    color: "#2563eb",
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "2px 10px",
                    borderRadius: 20,
                    border: "1px solid #93c5fd",
                  }}
                >
                  {pagination.total.toLocaleString("ru-RU")}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
              Управление возвратами · OZON Marketplace
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: syncing ? "#eff6ff" : "#fff",
              border: `1px solid ${syncing ? "#93c5fd" : "#e2e8f0"}`,
              borderRadius: 9,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: syncing ? "#2563eb" : "#475569",
              cursor: syncing ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!syncing) {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }
            }}
            onMouseLeave={(e) => {
              if (!syncing) {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }
            }}
          >
            <span
              style={{
                display: "inline-block",
                animation: syncing ? "spin 0.9s linear infinite" : "none",
              }}
            >
              <Icon d={Icons.sync} size={14} />
            </span>
            {syncing ? "Синхронизация..." : "Синхронизировать"}
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <StatCard
            label="Всего возвратов"
            value={stats?.totals?.total}
            icon={Icons.total}
            accent="#2563eb"
            loading={loadingStats}
          />
          <StatCard
            label="FBO"
            value={stats?.totals?.fbo}
            icon={Icons.package}
            accent="#0369a1"
            loading={loadingStats}
          />
          <StatCard
            label="FBS"
            value={stats?.totals?.fbs}
            icon={Icons.package}
            accent="#059669"
            loading={loadingStats}
          />
          <StatCard
            label="rFBS"
            value={stats?.totals?.rfbs}
            icon={Icons.package}
            accent="#7c3aed"
            loading={loadingStats}
          />
          <StatusBar
            byStatus={stats?.by_status}
            total={stats?.totals?.total || 1}
            loading={loadingStats}
          />
        </div>

        {/* ── Toolbar ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "12px 16px",
            marginBottom: 12,
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* search */}
          <div
            style={{ position: "relative", flex: "1 1 280px", minWidth: 200 }}
          >
            <span
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
            >
              <Icon d={Icons.search} size={15} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по артикулу, SKU, отправлению, причине..."
              style={{
                width: "100%",
                paddingLeft: 34,
                paddingRight: search ? 30 : 12,
                height: 36,
                borderRadius: 9,
                border: "1px solid #e2e8f0",
                fontSize: 13,
                color: "#0f172a",
                background: "#f8fafc",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#93c5fd")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 0,
                }}
              >
                <Icon d={Icons.x} size={14} />
              </button>
            )}
          </div>

          {/* type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              height: 36,
              borderRadius: 9,
              padding: "0 12px",
              fontSize: 13,
              outline: "none",
              cursor: "pointer",
              border: `1px solid ${filterType ? "#93c5fd" : "#e2e8f0"}`,
              background: filterType ? "#eff6ff" : "#f8fafc",
              color: filterType ? "#0f172a" : "#94a3b8",
            }}
          >
            <option value="">Все типы</option>
            <option value="FBO">FBO</option>
            <option value="FBS">FBS</option>
            <option value="rFBS">rFBS</option>
          </select>

          {/* status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              height: 36,
              borderRadius: 9,
              padding: "0 12px",
              fontSize: 13,
              outline: "none",
              cursor: "pointer",
              border: `1px solid ${filterStatus ? "#93c5fd" : "#e2e8f0"}`,
              background: filterStatus ? "#eff6ff" : "#f8fafc",
              color: filterStatus ? "#0f172a" : "#94a3b8",
            }}
          >
            <option value="">Все статусы</option>
            {Object.entries(STATUS_CONFIG)
              .filter(([k]: any) => k !== "unknown")
              .map(([k, v]: any) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
          </select>

          {/* period */}
          <button
            onClick={() => setShowFilters((v: any) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              borderRadius: 9,
              padding: "0 12px",
              border: `1px solid ${
                showFilters || dateFrom || dateTo ? "#93c5fd" : "#e2e8f0"
              }`,
              background:
                showFilters || dateFrom || dateTo ? "#eff6ff" : "#f8fafc",
              color: showFilters || dateFrom || dateTo ? "#2563eb" : "#64748b",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Icon d={Icons.calendar} size={14} />
            Период
            {(dateFrom || dateTo) && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#2563eb",
                }}
              />
            )}
          </button>

          {/* reset */}
          {hasAnyFilter && (
            <button
              onClick={resetFilters}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                height: 36,
                borderRadius: 9,
                padding: "0 10px",
                border: "1px solid #fecaca",
                background: "#fff5f5",
                color: "#dc2626",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Icon d={Icons.x} size={12} /> Сбросить
            </button>
          )}

          <div
            style={{
              marginLeft: "auto",
              fontSize: 13,
              color: "#94a3b8",
              whiteSpace: "nowrap",
            }}
          >
            {loadingList
              ? "Загрузка..."
              : `${pagination.total.toLocaleString("ru-RU")} записей`}
          </div>
        </div>

        {/* date range */}
        {showFilters && (
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 12,
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              animation: "fadeIn 0.15s ease",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6" }}>
              Период:
            </span>
            {[
              ["От", dateFrom, setDateFrom],
              ["До", dateTo, setDateTo],
            ].map(([lbl, val, setter]) => (
              <div
                key={lbl}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <label style={{ fontSize: 12, color: "#64748b" }}>{lbl}</label>
                <input
                  type="date"
                  value={val}
                  onChange={(e) => {
                    setter(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    height: 32,
                    border: "1px solid #93c5fd",
                    borderRadius: 8,
                    padding: "0 10px",
                    fontSize: 13,
                    background: "#fff",
                    color: "#0f172a",
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* batch bar */}
        {selected.size > 0 && (
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 10,
              padding: "10px 16px",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 12,
              animation: "fadeIn 0.15s ease",
            }}
          >
            <span style={{ fontSize: 13, color: "#2563eb", fontWeight: 600 }}>
              Выбрано: {selected.size}
            </span>
            <div style={{ width: 1, height: 18, background: "#bfdbfe" }} />
            <button
              style={{
                background: "#fff",
                border: "1px solid #bfdbfe",
                borderRadius: 7,
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "#2563eb",
                cursor: "pointer",
              }}
            >
              Экспорт
            </button>
            <button
              onClick={() => setSelected(new Set())}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Снять выделение
            </button>
          </div>
        )}

        {/* ── Table ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 1050,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <th style={{ padding: "10px 8px 10px 20px", width: 40 }}>
                    <div
                      onClick={toggleAll}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        border: `2px solid ${
                          selected.size > 0 && selected.size === returns.length
                            ? "#2563eb"
                            : "#cbd5e1"
                        }`,
                        background:
                          selected.size > 0 && selected.size === returns.length
                            ? "#2563eb"
                            : "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      {selected.size > 0 &&
                        selected.size === returns.length && (
                          <svg
                            width={10}
                            height={10}
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="#fff"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                    </div>
                  </th>
                  {[
                    "Номер возврата",
                    "Тип",
                    "Отправление",
                    "Артикул / SKU",
                    "Причина",
                    "Кол-во",
                    "Дата",
                    "Статус",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingList ? (
                  Array.from({ length: LIMIT }).map((_: any, i: any) => (
                    <SkeletonRow key={i} />
                  ))
                ) : returns.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <div
                        style={{
                          padding: 60,
                          textAlign: "center",
                          color: "#94a3b8",
                        }}
                      >
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#475569",
                            marginBottom: 4,
                          }}
                        >
                          Возвраты не найдены
                        </div>
                        <div style={{ fontSize: 13 }}>
                          Попробуйте изменить фильтры или запустите
                          синхронизацию
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  returns.map((ret: any) => (
                    <ReturnRow
                      key={ret.guid}
                      ret={ret}
                      selected={selected.has(ret.guid)}
                      onSelect={toggleSelect}
                      onView={handleView}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 20px",
                borderTop: "1px solid #e2e8f0",
                background: "#f8fafc",
              }}
            >
              <span style={{ fontSize: 13, color: "#94a3b8" }}>
                Страница {page} из {totalPages} ·{" "}
                {pagination.total.toLocaleString("ru-RU")} записей
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => setPage((p: any) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: page === 1 ? "#cbd5e1" : "#475569",
                  }}
                >
                  <Icon d={Icons.arrowL} size={14} />
                </button>
                {pageNumbers.map((p: any, i: any) =>
                  p === "…" ? (
                    <span
                      key={`e${i}`}
                      style={{
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#94a3b8",
                        fontSize: 13,
                      }}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: `1px solid ${
                          page === p ? "#93c5fd" : "#e2e8f0"
                        }`,
                        background: page === p ? "#eff6ff" : "#fff",
                        color: page === p ? "#2563eb" : "#475569",
                        fontSize: 13,
                        fontWeight: page === p ? 700 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setPage((p: any) => Math.min(totalPages, p + 1))
                  }
                  disabled={page === totalPages}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: page === totalPages ? "#cbd5e1" : "#475569",
                  }}
                >
                  <Icon d={Icons.arrowR} size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Top Reasons ── */}
        {stats?.top_reasons?.length > 0 && (
          <div
            style={{
              marginTop: 16,
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              padding: "16px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              Топ-5 причин возвратов
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {stats.top_reasons.map(({ label, count }: any, i: any) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "8px 14px",
                    flex: "1 1 160px",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      flexShrink: 0,
                      background: [
                        "#dbeafe",
                        "#dcfce7",
                        "#fef3c7",
                        "#ede9fe",
                        "#fee2e2",
                      ][i],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      color: [
                        "#2563eb",
                        "#16a34a",
                        "#d97706",
                        "#7c3aed",
                        "#dc2626",
                      ][i],
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#374151",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {count.toLocaleString("ru-RU")} шт.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Drawer ── */}
      <DetailDrawer
        ret={detailRet}
        onClose={() => setDetailRet(null)}
        loadingDetail={loadingDetail}
      />

      {/* ── Toasts ── */}
      <Toast toasts={toasts} />
    </div>
  );
}
