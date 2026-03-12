import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// RTK Query API для карточек
export const goodsApi = createApi({
  reducerPath: "goodsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://nazar-backend.333.kg/api/" }),
  tagTypes: ["goods"],
  endpoints: (builder) => ({
    getgoods: builder.query<any, void>({
      query: () => "goods/list", // путь к API, который возвращает JSON с карточками
      providesTags: ["goods"],
    }),
    getAllgoods: builder.query<any, void>({
      query: () => "directory/good/list", // путь к API, который возвращает JSON с карточками
      providesTags: ["goods"],
    }),
    updateGoods: builder.mutation<any, any>({
      query: (data: any) => {
        return {
          url: "good/update",
          method: "POST",
          body: data,
        };
      }, // путь к API, который возвращает JSON с карточками
      invalidatesTags: ["goods"],
    }),
    updateStock: builder.mutation<any, any>({
      query: (data: any) => {
        return {
          url: "lk/goods/update",
          method: "POST",
          body: data,
        };
      }, // путь к API, который возвращает JSON с карточками
      invalidatesTags: ["goods"],
    }),
    updateMarketplace: builder.mutation<any, any>({
      query: (data: any) => {
        return {
          url: "mp/goods/update",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["goods"],
    }),
  }),
});

export const {
  useGetgoodsQuery,
  useGetAllgoodsQuery,
  useUpdateGoodsMutation,
  useUpdateStockMutation,
  useUpdateMarketplaceMutation,
} = goodsApi;
