import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Invoice {
  guid: string;
  doc_number: string;
  doc_date: string;
  supplier: string;
  warehouse: string;
  total_sum: number;
  created_at: string;
  status: number | string; // статус может быть 'draft', поэтому добавил string
  invoice_type_name: string;
}

export interface InvoiceItem {
  guid: string;
  goodid: string; // <-- ДОБАВЛЕНО (ОБЯЗАТЕЛЬНО возвращать с бэка!)
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
      invalidatesTags: ["Goods", "Invoice"],
    }),

    getInvoices: builder.query<Invoice[], GetInvoicesParams | undefined>({
      query: (params) => ({
        url: "invoice/income",
        params: params ?? undefined,
      }),
      providesTags: ["Invoice"],
    }),
    postInvoice: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (guid) => ({
        url: `invoice/${guid}/post`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, guid) => [
        "Invoice",
        "Goods",
        { type: "InvoiceItems", id: guid },
      ],
    }),
    getInvoiceItems: builder.query<InvoiceItem[], string>({
      query: (guid) => `invoice/${guid}/items`,
      providesTags: (_result, _error, guid) => [
        { type: "InvoiceItems", id: guid },
      ],
    }),

    // ===============================
    // 💰 Расход товара (Создание)
    // ===============================
    goodsExpense: builder.mutation({
      query: (body) => ({
        url: "new/goods/expence",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Goods", "Invoice"],
    }),

    // ===============================
    // 💰 Расход товара (Редактирование)
    // ===============================
    updateGoodsExpense: builder.mutation({
      query: ({ guid, ...body }) => ({
        url: `goods/expence/${guid}`,
        method: "PUT",
        body,
      }),
      // Инвалидируем все связанные данные, чтобы интерфейс сам перезапросил актуальную инфу
      invalidatesTags: (_result, _error, { guid }) => [
        "Goods",
        "Invoice",
        { type: "InvoiceItems", id: guid },
      ],
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
  useUpdateGoodsExpenseMutation, // <--- Экспортируем новый хук
  usePostInvoiceMutation, // ✅ НОВЫЙ
  useAddClientMutation,
  useUpdateClientMutation,
  useAddManufacturerMutation,
  useUpdateManufacturerMutation,
  useGetInvoicesQuery,
  useLazyGetInvoiceItemsQuery,
} = warehouseApi;
