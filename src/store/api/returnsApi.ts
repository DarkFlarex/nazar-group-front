// src/services/returnsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = "https://nazar-backend.333.kg/api/returns";

export const returnsApi = createApi({
  reducerPath: "returnsApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ["Returns", "ReturnStats"],
  endpoints: (builder) => ({
    getReturns: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return `?${queryParams}`;
      },
      providesTags: ["Returns"],
    }),
    getReturnStats: builder.query({
      query: () => "/stats",
      providesTags: ["ReturnStats"],
    }),
    getReturnById: builder.query({
      query: (guid) => `/${guid}`,
      providesTags: (result, error, guid) => [{ type: "Returns", id: guid }],
    }),
    syncReturns: builder.mutation({
      query: () => ({
        url: "/sync",
        method: "POST",
      }),
      invalidatesTags: ["Returns"],
    }),
  }),
});

export const {
  useGetReturnsQuery,
  useGetReturnStatsQuery,
  useGetReturnByIdQuery,
  useSyncReturnsMutation,
} = returnsApi;
