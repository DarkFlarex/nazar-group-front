import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ─────────────────────────────────────────────
// 📦 Типы
// ─────────────────────────────────────────────

export interface WbClaim {
  guid: string;
  claim_id: string;
  claim_type: string | null;
  status: string;
  return_reason: string | null;
  return_date: string | null;
  product_sku: string | null;
  product_offer_id: string | null;
  user_comment: string | null;
  created_at: string;
  updated_at: string | null;
  good_name: string | null;
}

export interface WbClaimsStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  unknown_status: number;
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Query параметры ──────────────────────────
export interface GetClaimsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  claim_type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─── Ответы от сервера ───────────────────────
interface ApiListResponse {
  success: boolean;
  data: WbClaim[];
  pagination: Pagination;
}

interface ApiSingleResponse {
  success: boolean;
  data: WbClaim;
}

interface ApiStatsResponse {
  success: boolean;
  data: WbClaimsStats;
}

interface ApiActionResponse {
  success: boolean;
  message: string;
}

// ─── Аргументы мутаций ───────────────────────
interface ApproveClaimArg {
  claimId: string;
}

interface RejectClaimArg {
  claimId: string;
  reason: string;
}

// ─────────────────────────────────────────────
// 🚀 RTK Query API
// ─────────────────────────────────────────────

export const wbClaimsApi = createApi({
  reducerPath: "wbClaimsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://nazar-backend.333.kg/api/claim/",
    // Если у вас есть JWT — раскомментируйте:
    // prepareHeaders: (headers, { getState }) => {
    //   const token = (getState() as RootState).auth.token;
    //   if (token) headers.set('Authorization', `Bearer ${token}`);
    //   return headers;
    // },
  }),

  // Теги для автоматической инвалидации кэша
  tagTypes: ["WbClaim", "WbClaimsStats"],

  endpoints: (builder) => ({
    // ── GET /wb-claims — Список с фильтрами ──
    getWbClaims: builder.query<ApiListResponse, GetClaimsParams>({
      query: (params) => ({
        url: "/wb-claims",
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          ...(params.status && { status: params.status }),
          ...(params.claim_type && { claim_type: params.claim_type }),
          ...(params.search && { search: params.search }),
          ...(params.dateFrom && { dateFrom: params.dateFrom }),
          ...(params.dateTo && { dateTo: params.dateTo }),
        },
      }),
      // Инвалидируем кэш списка при любом изменении заявки
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ guid }) => ({
                type: "WbClaim" as const,
                id: guid,
              })),
              { type: "WbClaim", id: "LIST" },
            ]
          : [{ type: "WbClaim", id: "LIST" }],
    }),

    // ── GET /wb-claims/:guid — Одна заявка ──
    getWbClaimById: builder.query<ApiSingleResponse, string>({
      query: (guid) => `/wb-claims/${guid}`,
      providesTags: (_result, _err, guid) => [{ type: "WbClaim", id: guid }],
    }),

    // ── GET /wb-claims-stats — Статистика ───
    getWbClaimsStats: builder.query<ApiStatsResponse, void>({
      query: () => "/wb-claims-stats",
      providesTags: ["WbClaimsStats"],
    }),

    // ── POST /wb-claims/:claimId/approve ────
    approveWbClaim: builder.mutation<ApiActionResponse, ApproveClaimArg>({
      query: ({ claimId }) => ({
        url: `/wb-claims/${claimId}/approve`,
        method: "POST",
      }),
      // После одобрения — обновить список и статистику
      invalidatesTags: [{ type: "WbClaim", id: "LIST" }, "WbClaimsStats"],
    }),

    // ── POST /wb-claims/:claimId/reject ─────
    rejectWbClaim: builder.mutation<ApiActionResponse, RejectClaimArg>({
      query: ({ claimId, reason }) => ({
        url: `/wb-claims/${claimId}/reject`,
        method: "POST",
        body: { reason },
      }),
      // После отклонения — обновить список и статистику
      invalidatesTags: [{ type: "WbClaim", id: "LIST" }, "WbClaimsStats"],
    }),
  }),
});

// ─────────────────────────────────────────────
// 📤 Экспорт хуков (авто-генерация RTK Query)
// ─────────────────────────────────────────────
export const {
  useGetWbClaimsQuery,
  useGetWbClaimByIdQuery,
  useGetWbClaimsStatsQuery,
  useApproveWbClaimMutation,
  useRejectWbClaimMutation,
} = wbClaimsApi;
