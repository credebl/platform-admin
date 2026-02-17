import { Store, combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";

import organizationReducer from "./organizationSlice";
import storage from "redux-persist/lib/storage";
import userReducer from "./userSlice";
import userRegistrationSlice from "./userRegistrationSlice";
import sessionSlice from "./sessionSlice";

const rootReducer = combineReducers({
  session: sessionSlice,
  organization: organizationReducer,
  user: userReducer,
  userRegistartion: userRegistrationSlice
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["session", "organization", "user", "userRegistartion"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = (): Store =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/PURGE", "persist/FLUSH"],
        },
      }),
  });

export const persistor = persistStore(makeStore());

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
