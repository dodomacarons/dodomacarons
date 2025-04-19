import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Aggregate1ApiResponse, Waste, WasteFieldValues } from '../types';
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
      { displayDateFrom: string; displayDateTo: string }
    >({
      query: ({ displayDateFrom, displayDateTo }) =>
        `aggregate1?${new URLSearchParams({
          displayDateFrom,
          displayDateTo,
        }).toString()}`,
      transformResponse: (response: { data: Aggregate1ApiResponse[] }) =>
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
  useCreateWasteMutation,
} = wasteApi;
export default wasteApi;
