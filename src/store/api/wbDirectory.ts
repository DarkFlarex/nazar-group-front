// src/services/wbDictionariesApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ===== Типы ===== */

export interface WbColor {
  id: number;
  name: string;
}

export interface WbCountry {
  id: number;
  name: string;
  isoCode?: string;
}

/* ===== API ===== */

export const wbDictionariesApi = createApi({
  reducerPath: "wbDictionariesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://nazar-backend.333.kg/api", // ← подставь нужный домен
  }),
  endpoints: (builder) => ({
    getColors: builder.query<WbColor[], void>({
      query: () => "/wb/content/colors",
    }),

    getCategories: builder.query<any[], void>({
      query: () => "/wb/content/parents",
    }),

    getChars: builder.query<any[], void>({
      query: (id) => "/wb/content/charcs/" + id,
    }),

    getSubjects: builder.query<any[], void>({
      query: () => "/wb/content/all",
    }),

    getCountries: builder.query<WbCountry[], void>({
      query: () => "/wb/content/countries",
    }),
  }),
});

export const {
  useGetColorsQuery,
  useGetSubjectsQuery,
  useGetCategoriesQuery,
  useGetCountriesQuery,
  useGetCharsQuery,
} = wbDictionariesApi;
