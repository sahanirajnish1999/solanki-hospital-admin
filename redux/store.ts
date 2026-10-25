import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { adminApi } from "./api/adminApi";
import { specializationApi } from "./api/specializationApi";
import { doctorApi } from "./api/doctorApi";
import authReducer from "./features/authSlice";

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [adminApi.reducerPath]: adminApi.reducer,
      [specializationApi.reducerPath]: specializationApi.reducer,
      [doctorApi.reducerPath]: doctorApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(
        adminApi.middleware,
        specializationApi.middleware,
        doctorApi.middleware
      ),
    devTools: process.env.NODE_ENV !== "production",
  });

  setupListeners(store.dispatch);
  return store;
};

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
