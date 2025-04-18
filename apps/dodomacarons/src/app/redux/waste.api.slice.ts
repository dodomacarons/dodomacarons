import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Waste, WasteFieldValues } from '../types';

export interface WastesApiResponse {
  message: string;
  data: Waste[];
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
      Waste[],
      { page?: number; limit?: number } & Partial<Waste>
    >({
      query: ({ page = 1, limit = 100, ...restParams }) =>
        `waste?page=${page}&limit=${limit}&${new URLSearchParams(
          restParams as any
        ).toString()}`,
      transformResponse: (response: WastesApiResponse) => response.data,
    }),

    getAggregate1: builder.query<any, any>({
      query: ({ displayDateFrom, displayDateTo }) =>
        `aggregate1?${new URLSearchParams({
          displayDateFrom,
          displayDateTo,
        }).toString()}`,
      transformResponse: (response: any) => response.data,
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
              draft.unshift(waste);
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
