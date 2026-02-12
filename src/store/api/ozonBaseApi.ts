import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ozonBaseApi = createApi({
  reducerPath: "ozonApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api-seller.ozon.ru",
    prepareHeaders: (headers) => {
      headers.set("Api-Key", "f0046df8-bbc0-480f-95ae-3dfecbea0058");
      headers.set("Client-Id", "1243062");
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: () => ({}),
});
