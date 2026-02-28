import { configureStore } from "@reduxjs/toolkit";
import { ozonBaseApi } from "./api/ozonBaseApi";
import { wbDictionariesApi } from "./api/wbDirectory";
import { cardsApi } from "./api/cardsApi";
import { wbOrderApi } from "./api/wbOrdersApi";
import { goodsApi } from "./api/goodsApi";
import { directoryApi } from "./api/directoryApi";
import { warehouseApi } from "./api/invoiceApi";
import { ozonApi } from "./api/ozonProduct";

export const store = configureStore({
  reducer: {
    [ozonBaseApi.reducerPath]: ozonBaseApi.reducer,
    [wbDictionariesApi.reducerPath]: wbDictionariesApi.reducer,
    [ozonApi.reducerPath]: ozonApi.reducer,
    [cardsApi.reducerPath]: cardsApi.reducer,
    [wbOrderApi.reducerPath]: wbOrderApi.reducer,
    [goodsApi.reducerPath]: goodsApi.reducer,
    [directoryApi.reducerPath]: directoryApi.reducer,
    [warehouseApi.reducerPath]: warehouseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      ozonApi.middleware,
      ozonBaseApi.middleware,
      wbDictionariesApi.middleware,
      cardsApi.middleware,
      wbOrderApi.middleware,
      goodsApi.middleware,
      directoryApi.middleware,
      warehouseApi.middleware
    ),
});
