import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  Aggregate1ApiResponse,
  Aggregate2ApiResponse,
  Waste,
  WasteFieldValues,
} from '../types';
import { GridSortModel } from '@mui/x-data-grid';
import { RootState } from './store';

export interface WastesApiResponse {
  message: string;
  data: Waste[];
  total: number;
}

export interface WasteApiResponse {
  message: string;
  data: Waste;
}

const wasteApi = createApi({
  reducerPath: 'wasteApi',
  tagTypes: ['Waste', 'Reason'],
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_WASTE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getWastes: builder.query<
      { data: Waste[]; total: number },
      {
        page: number;
        pageSize: number;
        sortModel?: GridSortModel;
      } & Partial<Waste>
    >({
      query: ({ page = 0, pageSize = 100, sortModel, ...restParams }) =>
        `waste?page=${page}&pageSize=${pageSize}${
          sortModel ? '&sortModel=' + JSON.stringify(sortModel) : ''
        }${
          Object.keys(restParams).length > 0
            ? '&' +
              new URLSearchParams(
                restParams as Record<string, string>,
              ).toString()
            : ''
        }`,
      transformResponse: (response: WastesApiResponse) => ({
        data: response.data,
        total: response.total,
      }),
      providesTags: ['Waste'],
    }),

    getAggregate1: builder.query<
      {
        items: Aggregate1ApiResponse[];
        total: number;
      },
      {
        dateFrom: string;
        dateTo: string;
        page: number;
        pageSize: number;
        sortModel?: GridSortModel;
      }
    >({
      query: ({ dateFrom, dateTo, page, pageSize, sortModel }) =>
        `aggregate1?${new URLSearchParams({
          dateFrom,
          dateTo,
          page: String(page),
          pageSize: String(pageSize),
          sortModel: JSON.stringify(sortModel),
        }).toString()}`,
      transformResponse: (response: {
        data: {
          items: Aggregate1ApiResponse[];
          total: number;
        };
      }) => ({
        ...response.data,
      }),
    }),

    getAggregate2: builder.query<
      {
        items: Aggregate2ApiResponse[];
        total: number;
      },
      {
        dateFrom: string;
        dateTo: string;
        page: number;
        pageSize: number;
        sortModel?: GridSortModel;
      }
    >({
      query: ({ dateFrom, dateTo, page, pageSize, sortModel }) =>
        `aggregate2?${new URLSearchParams({
          dateFrom,
          dateTo,
          page: String(page),
          pageSize: String(pageSize),
          sortModel: JSON.stringify(sortModel),
        }).toString()}`,
      transformResponse: (response: {
        data: {
          items: Aggregate2ApiResponse[];
          total: number;
        };
      }) => ({
        ...response.data,
      }),
    }),

    createWaste: builder.mutation<Waste, WasteFieldValues>({
      query: (newWaste) => ({
        url: 'waste',
        method: 'POST',
        body: newWaste,
      }),
      transformResponse: (response: WasteApiResponse) => response.data,
      invalidatesTags: ['Waste'],
    }),

    deleteWaste: builder.mutation<void, string>({
      query: (wasteId) => ({
        url: `waste/${wasteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Waste'],
    }),

    updateWaste: builder.mutation<
      void,
      { wasteId: string; updatedWaste: WasteFieldValues }
    >({
      query: ({ wasteId, updatedWaste }) => ({
        url: `waste/${wasteId}`,
        method: 'PATCH',
        body: updatedWaste,
      }),
      invalidatesTags: ['Waste'],
    }),

    getReasons: builder.query<{ _id: string; name: string }[], void>({
      query: () => `reason`,
      transformResponse: (response: {
        data: { _id: string; name: string }[];
      }) => response.data,
      providesTags: ['Reason'],
    }),

    createReason: builder.mutation<
      { name: string; createdAt: string },
      { name: string }
    >({
      query: (newReason) => ({
        url: 'reason',
        method: 'POST',
        body: newReason,
      }),
      transformResponse: (response: {
        data: { name: string; createdAt: string };
      }) => response.data,
      invalidatesTags: ['Reason'],
    }),
  }),
});

export const {
  useGetWastesQuery,
  useLazyGetWastesQuery,
  useGetAggregate1Query,
  useLazyGetAggregate1Query,
  useGetAggregate2Query,
  useLazyGetAggregate2Query,
  useCreateWasteMutation,
  useDeleteWasteMutation,
  useUpdateWasteMutation,
  useGetReasonsQuery,
  useLazyGetReasonsQuery,
  useCreateReasonMutation,
} = wasteApi;
export default wasteApi;
