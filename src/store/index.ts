import { configureStore } from "@reduxjs/toolkit";
import { ozonBaseApi } from "./api/ozonBaseApi";
import { wbDictionariesApi } from "./api/wbDirectory";
import { cardsApi } from "./api/cardsApi";
import { wbOrderApi } from "./api/wbOrdersApi";

export const store = configureStore({
  reducer: {
    [ozonBaseApi.reducerPath]: ozonBaseApi.reducer,
    [wbDictionariesApi.reducerPath]: wbDictionariesApi.reducer,
    [cardsApi.reducerPath]: cardsApi.reducer,
    [wbOrderApi.reducerPath]: wbOrderApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      ozonBaseApi.middleware,
      wbDictionariesApi.middleware,
      cardsApi.middleware,
      wbOrderApi.middleware
    ),
});
