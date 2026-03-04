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
  tagTypes: ["Tasks", "LIST"],
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
    getTasks: builder.query<any, void>({
      query: () => "ozon/pick-tasks",
      transformResponse: (response: any) => response.tasks || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ guid }: any) => ({ type: "Tasks", id: guid })),
              { type: "Tasks", id: "LIST" },
            ]
          : [{ type: "Tasks", id: "LIST" }],
    }),
    // Печать этикетки �� возвращает PDF blob
    getPackageLabel: builder.mutation<Blob, { posting_guid: string }>({
      query: ({ posting_guid }) => ({
        url: `posting/${posting_guid}/label`,
        method: "GET",
        responseHandler: async (response) => {
          // Проверяем Content-Type
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/pdf")) {
            return await response.blob();
          }
          // Если не PDF — значит ошибка в JSON
          const json = await response.json();
          throw json;
        },
      }),
    }),

    // Пакетная печать этикеток — до 20 штук
    getPackageLabelsBatch: builder.mutation<Blob, { posting_guids: string[] }>({
      query: ({ posting_guids }) => ({
        url: "postings/labels",
        method: "POST",
        body: { posting_guids },
        responseHandler: async (response) => {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/pdf")) {
            return await response.blob();
          }
          const json = await response.json();
          throw json;
        },
      }),
    }),

    // Взять задачу в работу
    assignTask: builder.mutation<
      { success: boolean; message: string },
      { task_guid: string; picker_guid?: string }
    >({
      query: ({ task_guid, picker_guid }) => ({
        url: `pick-task/${task_guid}/start`,
        method: "POST",
        body: { picker_guid },
      }),
      invalidatesTags: ["Tasks"],
    }),

    // Завершить сборку
    completeTask: builder.mutation<{ success: boolean }, { task_guid: string }>(
      {
        query: ({ task_guid }) => ({
          url: `pick-task/${task_guid}/complete`,
          method: "POST",
        }),
        invalidatesTags: ["Tasks"],
      }
    ),
  }),
});

export const {
  useGetProductPricesMutation,
  useGetProductAttributesQuery,
  useGetTasksQuery,
  useGetPackageLabelMutation,
  useGetPackageLabelsBatchMutation,
  useAssignTaskMutation,
  useCompleteTaskMutation,
} = ozonApi;
