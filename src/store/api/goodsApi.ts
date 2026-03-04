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
    updateGoodsFull: builder.mutation<any, any>({
      query: (data: any) => {
        return {
          url: "goods/update",
          method: "POST",
          body: data,
        };
      }, // путь к API, который возвращает JSON с карточками
      invalidatesTags: ["goods"],
    }),
  }),
});

export const {
  useGetgoodsQuery,
  useGetAllgoodsQuery,
  useUpdateGoodsFullMutation,
} = goodsApi;
