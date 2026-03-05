import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// RTK Query API для карточек
export const cardsApi = createApi({
  reducerPath: "cardsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://nazar-backend.333.kg/api/" }),
  endpoints: (builder) => ({
    getCards: builder.query<any, { updatedAt?: string; nmID?: number } | void>({
      query: (cursor) => ({
        url: "/wb/content/cards/list",
        method: "POST",
        body: cursor || {},
      }),
    }),
  }),
});

export const { useGetCardsQuery, useLazyGetCardsQuery } = cardsApi;
