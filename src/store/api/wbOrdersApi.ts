// src/services/wbDictionariesApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ===== Типы ===== */

export interface WbColor {
  id: number;
  name: string;
}

export interface WbCategory {
  id: number;
  name: string;
}

export interface WbCountry {
  id: number;
  name: string;
  isoCode?: string;
}

/* ===== API ===== */

export const wbOrderApi = createApi({
  reducerPath: "wbOrderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://nazar-backend.333.kg/api", // ← подставь нужный домен
  }),
  endpoints: (builder) => ({
    getWBOrders: builder.query<any, any>({
      query: (data) => {
        return {
          url: "/wb/orders",
          params: data,
        };
      },
    }),

    getWBOrdersNew: builder.query<any, void>({
      query: () => {
        return {
          url: "/wb/orders/new",
        };
      },
    }),
    getWBOrdersStatus: builder.mutation<any, { orders: string[] }>({
      query: (body) => ({
        url: "/wildberries/orders/status",
        method: "POST",
        body,
      }),
    }),
    getOzonOrders: builder.query<any, void>({
      query: () => {
        return {
          url: "/ozon/orders",
        };
      },
    }),
    getOzonPost: builder.query<any, void>({
      query: () => {
        return {
          url: "/posting/fbs/list",
        };
      },
    }),
    getWBOrderMetadata: builder.mutation<any, { orderId: number }>({
      query: ({ orderId }) => ({
        url: `/wildberries/orders/metadata`,
        method: "POST", // или GET если API GET
        params: { orderId },
      }),
    }),
    getWBSupplies: builder.query({
      query: ({ next = 4, limit = 100 }: any) => ({
        url: `/wildberries/supplies`,
        params: { next, limit },
      }),
    }),
    createWBSupply: builder.mutation<any, { name: string }>({
      query: ({ name }) => ({
        url: "/wildberries/supplies",
        method: "POST",
        body: { name },
      }),
    }),
    deleteWBSupply: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/wildberries/supplies/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetWBOrdersQuery,
  useGetWBOrdersNewQuery,
  useGetOzonOrdersQuery,
  useGetWBOrdersStatusMutation,
  useGetOzonPostQuery,
  useGetWBOrderMetadataMutation,
  useGetWBSuppliesQuery,
  useCreateWBSupplyMutation,
  useDeleteWBSupplyMutation,
} = wbOrderApi;
