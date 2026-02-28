import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* =======================
   Типы запроса
======================= */

export interface GetOzonPricesRequest {
  offer_id?: string;
  product_id?: string;
  visibility?: "ALL" | "VISIBLE" | "INVISIBLE";
  limit?: number;
  cursor?: string;
}

/* =======================
   Типы ответа
======================= */

export interface OzonPriceItem {
  offer_id: string;
  product_id: number;
  acquiring: number;
  price: {
    currency_code: string;
    price: number;
    old_price: number;
    min_price: number;
    net_price: number;
    retail_price: number;
    vat: number;
    marketing_seller_price: number;
  };
  commissions: {
    sales_percent_fbo: number;
    sales_percent_fbs: number;
    fbo_deliv_to_customer_amount: number;
    fbs_deliv_to_customer_amount: number;
  };
  marketing_actions: {
    ozon_actions_exist: boolean;
    current_period_from: string;
    current_period_to: string;
  };
}

export interface GetOzonPricesResponse {
  cursor: string;
  total: number;
  items: OzonPriceItem[];
}

/* =======================
   API
======================= */

export const ozonApi = createApi({
  reducerPath: "ozonProdApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://nazar-backend.333.kg/api/",
  }),
  endpoints: (builder) => ({
    getProductPrices: builder.mutation<
      GetOzonPricesResponse,
      GetOzonPricesRequest
    >({
      query: (body) => ({
        url: "/ozon/product/info/prices",
        method: "POST",
        body,
      }),
    }),
    getProductAttributes: builder.query({
      query: ({ sku, product_id, offer_id }) => ({
        url: "/ozon/product/info/attributes",
        method: "POST",
        body: {
          sku: sku ? [sku] : undefined,
          product_id: product_id ? [product_id] : undefined,
          offer_id: offer_id ? [offer_id] : undefined,
          visibility: "ALL",
          limit: 100,
        },
      }),
    }),
  }),
});

export const { useGetProductPricesMutation, useGetProductAttributesQuery } =
  ozonApi;
