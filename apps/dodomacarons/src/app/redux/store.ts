import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistReducer,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  createTransform,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
  flavorSlice,
  FlavorState,
  initialState as initialFlavorState,
} from './flavor.slice';
import {
  wasteSlice,
  WasteState,
  initialState as initialWasteState,
} from './waste.slice';
import wasteApi from './waste.api.slice';
import { authSlice } from './auth.slice';
import { productTypeSlice } from './productType.slice';

type PersistedFlavorState = Pick<FlavorState, 'recentlyUsedFlavors'>;
type PersistedDateFilterDateState = Pick<
  WasteState,
  'aggregateDateFilterField'
>;

const flavorTransform = createTransform<FlavorState, PersistedFlavorState>(
  (inboundState: FlavorState) => ({
    recentlyUsedFlavors: inboundState.recentlyUsedFlavors,
  }),

  (outboundState: PersistedFlavorState) => ({
    ...initialFlavorState,
    recentlyUsedFlavors: outboundState.recentlyUsedFlavors,
  }),

  { whitelist: ['flavor'] },
);

const dateFilterDateTransform = createTransform<
  WasteState,
  PersistedDateFilterDateState
>(
  (inboundState: WasteState) => ({
    aggregateDateFilterField: inboundState.aggregateDateFilterField,
  }),

  (outboundState: PersistedDateFilterDateState) => ({
    ...initialWasteState,
    aggregateDateFilterField: outboundState.aggregateDateFilterField,
  }),

  { whitelist: ['waste'] },
);

const persistConfig = {
  key: 'root',
  storage,
  transforms: [flavorTransform, dateFilterDateTransform],
  blacklist: ['wasteApi', 'auth', '_persist'],
};

const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [flavorSlice.name]: flavorSlice.reducer,
  [wasteSlice.name]: wasteSlice.reducer,
  [productTypeSlice.name]: productTypeSlice.reducer,
  [wasteApi.reducerPath]: wasteApi.reducer,
});

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(wasteApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
