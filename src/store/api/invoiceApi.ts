import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Invoice {
  guid: string;
  doc_number: string;
  doc_date: string;
  supplier: string;
  warehouse: string;
  total_sum: number;
  created_at: string;
  status: number;
  invoice_type_name: string;
}

export interface InvoiceItem {
  guid: string;
  count: number;
  price: number;
  discount: number;
  total: number;
  product_name: string;
  articul: string;
}

export interface GetInvoicesParams {
  dateFrom?: string;
  dateTo?: string;
}

export const warehouseApi = createApi({
  reducerPath: "warehouseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://nazar-backend.333.kg/api/", // твой backend
  }),
  tagTypes: ["Client", "Manufacturer", "Goods", "Invoice", "InvoiceItems"],
  endpoints: (builder) => ({
    // ===============================
    // 📦 Приход товара
    // ===============================
    goodsIncome: builder.mutation({
      query: (body) => ({
        url: "goods/income",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Goods"],
    }),

    getInvoices: builder.query<Invoice[], GetInvoicesParams | undefined>({
      query: (params) => ({
        url: "invoice/income",
        params: params ?? undefined,
      }),
      providesTags: ["Invoice"],
    }),

    getInvoiceItems: builder.query<InvoiceItem[], string>({
      query: (guid) => `invoice/${guid}/items`,
      providesTags: (_result, _error, guid) => [
        { type: "InvoiceItems", id: guid },
      ],
    }),

    // ===============================
    // 💰 Расход товара
    // ===============================
    goodsExpense: builder.mutation({
      query: (body) => ({
        url: "new/goods/sale",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Goods"],
    }),

    // ===============================
    // 👤 Добавить клиента
    // ===============================
    addClient: builder.mutation({
      query: (body) => ({
        url: "client",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Client"],
    }),

    // ===============================
    // ✏️ Обновить клиента
    // ===============================
    updateClient: builder.mutation({
      query: ({ guid, ...body }) => ({
        url: `client/${guid}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Client"],
    }),

    // ===============================
    // 🏭 Добавить поставщика
    // ===============================
    addManufacturer: builder.mutation({
      query: (body) => ({
        url: "manufacturer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Manufacturer"],
    }),

    // ===============================
    // ✏️ Обновить поставщика
    // ===============================
    updateManufacturer: builder.mutation({
      query: ({ guid, ...body }) => ({
        url: `manufacturer/${guid}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Manufacturer"],
    }),
  }),
});

export const {
  useGoodsIncomeMutation,
  useGoodsExpenseMutation,
  useAddClientMutation,
  useUpdateClientMutation,
  useAddManufacturerMutation,
  useUpdateManufacturerMutation,
  useGetInvoicesQuery,
  useLazyGetInvoiceItemsQuery,
} = warehouseApi;
