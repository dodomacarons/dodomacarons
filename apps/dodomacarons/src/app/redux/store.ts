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
import { flavorSlice, FlavorState, initialState } from './flavor.slice';
import { wasteSlice } from './waste.slice';
import wasteApi from './waste.api.slice';

type PersistedFlavorState = Pick<FlavorState, 'recentlyUsedFlavors'>;

const flavorTransform = createTransform<FlavorState, PersistedFlavorState>(
  (inboundState: FlavorState) => ({
    recentlyUsedFlavors: inboundState.recentlyUsedFlavors,
  }),

  (outboundState: PersistedFlavorState) => ({
    ...initialState,
    recentlyUsedFlavors: outboundState.recentlyUsedFlavors,
  }),

  { whitelist: ['flavor'] }
);

const persistConfig = {
  key: 'root',
  storage,
  transforms: [flavorTransform],
  blacklist: ['waste', 'wasteApi', '_persist'],
};

const rootReducer = combineReducers({
  [flavorSlice.name]: flavorSlice.reducer,
  [wasteSlice.name]: wasteSlice.reducer,
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
