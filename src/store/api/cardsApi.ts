import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// RTK Query API для карточек
export const cardsApi = createApi({
  reducerPath: "cardsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://nazar-backend.333.kg/api/" }),
  endpoints: (builder) => ({
    getCards: builder.query({
      query: () => "wb/content/cards/list", // путь к API, который возвращает JSON с карточками
    }),
  }),
});

export const { useGetCardsQuery } = cardsApi;
