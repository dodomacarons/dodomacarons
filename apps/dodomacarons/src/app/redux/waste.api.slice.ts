import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  Aggregate1ApiResponse,
  Aggregate2ApiResponse,
  Waste,
  WasteFieldValues,
} from '../types';
import { GridSortModel } from '@mui/x-data-grid';

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
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_WASTE_API_BASE_URL,
  }),
  endpoints: (builder) => ({
    getWastes: builder.query<
      { data: Waste[]; total: number },
      {
        page?: number;
        pageSize?: number;
        sortModel?: GridSortModel;
      } & Partial<Waste>
    >({
      query: ({ page = 0, pageSize = 100, sortModel, ...restParams }) =>
        `waste?page=${page}&pageSize=${pageSize}${
          sortModel ? '&sortModel=' + JSON.stringify(sortModel) : ''
        }${
          Object.keys(restParams).length > 0
            ? '&' + new URLSearchParams(restParams as any).toString()
            : ''
        }`,
      transformResponse: (response: WastesApiResponse) => ({
        data: response.data,
        total: response.total,
      }),
    }),

    getAggregate1: builder.query<
      Aggregate1ApiResponse[],
      { dateFrom: string; dateTo: string }
    >({
      query: ({ dateFrom, dateTo }) =>
        `aggregate1?${new URLSearchParams({
          dateFrom,
          dateTo,
        }).toString()}`,
      transformResponse: (response: { data: Aggregate1ApiResponse[] }) =>
        response.data,
    }),

    getAggregate2: builder.query<
      Aggregate2ApiResponse[],
      { dateFrom: string; dateTo: string }
    >({
      query: ({ dateFrom, dateTo }) =>
        `aggregate2?${new URLSearchParams({
          dateFrom,
          dateTo,
        }).toString()}`,
      transformResponse: (response: { data: Aggregate2ApiResponse[] }) =>
        response.data,
    }),

    createWaste: builder.mutation<Waste, WasteFieldValues>({
      query: (newWaste) => ({
        url: 'waste',
        method: 'POST',
        body: newWaste,
      }),
      transformResponse: (response: WasteApiResponse) => response.data,
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data: waste } = await queryFulfilled;
          dispatch(
            wasteApi.util.updateQueryData('getWastes', {}, (draft) => {
              draft.data.unshift(waste);
            })
          );
        } catch (error) {
          console.error('Error updating cache after creating waste:', error);
        }
      },
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
} = wasteApi;
export default wasteApi;
