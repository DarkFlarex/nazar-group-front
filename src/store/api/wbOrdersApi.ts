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
    getWBOrders: builder.query<any, void>({
      query: () => {
        return {
          url: "/wb/orders",
        };
      },
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
  }),
});

export const {
  useGetWBOrdersQuery,
  useGetOzonOrdersQuery,
  useGetOzonPostQuery,
} = wbOrderApi;
