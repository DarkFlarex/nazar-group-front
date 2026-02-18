import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// RTK Query API для карточек
export const goodsApi = createApi({
  reducerPath: "goodsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://nazar-backend.333.kg/api/" }),
  endpoints: (builder) => ({
    getgoods: builder.query<any, void>({
      query: () => "goods/list", // путь к API, который возвращает JSON с карточками
    }),
  }),
});

export const { useGetgoodsQuery } = goodsApi;
