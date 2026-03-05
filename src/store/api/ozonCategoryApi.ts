import { ozonBaseApi } from "./ozonBaseApi";

/**
 * Типы можно потом вынести в отдельный файл
 */
export interface OzonProductImportItem {
  offer_id: string;
  name: string;
  barcode?: string;
  description_category_id: number;
  type_id: number;

  price: string;
  old_price?: string;
  currency_code: "RUB";

  vat: string;

  weight: number;
  weight_unit: "g" | "kg";

  width: number;
  height: number;
  depth: number;
  dimension_unit: "mm" | "cm";

  images?: string[];
  primary_image?: string;

  attributes: {
    id: number;
    complex_id: number;
    values: {
      value?: string;
      dictionary_value_id?: number;
    }[];
  }[];

  complex_attributes?: any[];
  promotions?: {
    type: string;
    operation: string;
  }[];
}

export const ozonCategoryApi = ozonBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🌳 Дерево категорий
    getDescriptionCategoryTree: builder.mutation<any, any>({
      query: (body = {}) => ({
        url: "/v1/description-category/tree",
        method: "POST",
        body,
      }),
    }),

    // 🧩 Характеристики
    getDescriptionCategoryAttributes: builder.mutation<any, any>({
      query: (body: any) => ({
        url: "/v1/description-category/attribute",
        method: "POST",
        body: {
          language: "DEFAULT",
          ...body,
        },
      }),
    }),

    // 📦 Создание / обновление товара
    importProducts: builder.mutation<
      { result: { task_id: string } },
      { items: OzonProductImportItem[] }
    >({
      query: (body: any) => ({
        url: "/v3/product/import",
        method: "POST",
        body,
      }),
    }),

    // ⏳ Статус импорта
    getImportProductStatus: builder.mutation<any, { task_id: string }>({
      query: (body: any) => ({
        url: "/v1/product/import/info",
        method: "POST",
        body,
      }),
    }),
    createOrUpdateProduct: builder.mutation({
      query: (body: any) => ({
        url: "/v2/product/import",
        method: "POST",
        body,
      }),
    }),
    getProductImportInfo: builder.mutation<any, { task_id: string }>({
      query: (body: any) => ({
        url: "/v1/product/import/info",
        method: "POST",
        body,
      }),
    }),

    getProductInfoStok: builder.mutation<any, any>({
      query: (body: any) => ({
        url: "/v4/product/info/stocks",
        method: "POST",
        body,
      }),
    }),

    getProductInfoStoks: builder.mutation<any, any>({
      query: () => ({
        url: "/v1/product/info/warehouse/stocks",
        method: "POST",
        body: {
          cursor: "",
          limit: 1000,
          warehouse_id: 1020000882941000,
        },
      }),
    }),
    getProductInfoWare: builder.mutation<any, any>({
      query: () => ({
        url: "/v2/product/info/stocks-by-warehouse/fbs",
        method: "POST",
        body: {
          cursor: "",
          offer_id: [
            749971546, 750795175, 752089448, 754387638, 754577765, 754628234,
          ],
          limit: 1000,
        },
      }),
    }),
    getProductList: builder.mutation<
      any,
      { filter?: any; last_id?: string; limit?: number }
    >({
      query: (body) => ({
        url: "/v3/product/list",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetDescriptionCategoryTreeMutation,
  useGetDescriptionCategoryAttributesMutation,
  useImportProductsMutation,
  useGetImportProductStatusMutation,
  useCreateOrUpdateProductMutation,
  useGetProductImportInfoMutation,
  useGetProductListMutation,
  useGetProductInfoStokMutation,
  useGetProductInfoWareMutation,
  useGetProductInfoStoksMutation,
} = ozonCategoryApi;
