import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// RTK Query API для карточек
export const directoryApi = createApi({
  reducerPath: "directoryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://nazar-backend.333.kg/api/" }),
  endpoints: (builder) => ({
    getManufacturers: builder.query<any, void>({
      query: () => "manufacturers/list", // путь к API, который возвращает JSON с карточками
    }),
    getInfoStoks: builder.query<any, void>({
      query: () => "ozon/info/stocks", // путь к API, который возвращает JSON с карточками
    }),
    changeInfoStoks: builder.mutation<any, void>({
      query: (data?: any) => {
        return {
          method: "POST",
          url: "ozon/info/stocks",
          body: data,
        };
      }, // путь к API, который возвращает JSON с карточками
    }),
  }),
});

export const {
  useGetManufacturersQuery,
  useGetInfoStoksQuery,
  useChangeInfoStoksMutation,
} = directoryApi;
