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
  tagTypes: ['Waste', 'Reason', 'Flavor', 'Aggregate1', 'Aggregate2'],
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
      } & Partial<Omit<Waste, 'flavor'> & { flavor: string }>
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
        dateFilterField: 'manufacturingDate' | 'displayDate';
        page: number;
        pageSize: number;
        sortModel?: GridSortModel;
      }
    >({
      query: ({
        dateFrom,
        dateTo,
        dateFilterField,
        page,
        pageSize,
        sortModel,
      }) =>
        `aggregate1?${new URLSearchParams({
          dateFrom,
          dateTo,
          dateFilterField,
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
      providesTags: ['Aggregate1'],
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
      providesTags: ['Aggregate2'],
    }),

    createWaste: builder.mutation<Waste, WasteFieldValues>({
      query: (newWaste) => ({
        url: 'waste',
        method: 'POST',
        body: newWaste,
      }),
      transformResponse: (response: WasteApiResponse) => response.data,
      invalidatesTags: ['Waste', 'Aggregate1', 'Aggregate2'],
    }),

    deleteWaste: builder.mutation<void, string>({
      query: (wasteId) => ({
        url: `waste/${wasteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Waste', 'Aggregate1', 'Aggregate2'],
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
      { _id: string; name: string; createdAt: string },
      { name: string }
    >({
      query: (newReason) => ({
        url: 'reason',
        method: 'POST',
        body: newReason,
      }),
      transformResponse: (response: {
        data: { _id: string; name: string; createdAt: string };
      }) => response.data,
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        try {
          const { data: addedReason } = await queryFulfilled;
          dispatch(
            wasteApi.util.updateQueryData(
              'getReasons',
              undefined,
              (draftReasons) => {
                draftReasons.push(addedReason);
                draftReasons.sort((a, b) => a.name.localeCompare(b.name));
              },
            ),
          );
        } catch (error) {
          console.error('failed to create reason', error);
        }
      },
    }),

    getFlavors: builder.query<{ _id: string; name: string }[], void>({
      query: () => `flavor`,
      transformResponse: (response: {
        data: { _id: string; name: string }[];
      }) => response.data,
      providesTags: ['Flavor'],
    }),

    createFlavor: builder.mutation<
      { _id: string; name: string; createdAt: string },
      { name: string }
    >({
      query: (newFlavor) => ({
        url: 'flavor',
        method: 'POST',
        body: newFlavor,
      }),
      transformResponse: (response: {
        data: { _id: string; name: string; createdAt: string };
      }) => response.data,
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        try {
          const { data: addedFlavor } = await queryFulfilled;
          dispatch(
            wasteApi.util.updateQueryData(
              'getFlavors',
              undefined,
              (draftFlavors) => {
                draftFlavors.push(addedFlavor);
                draftFlavors.sort((a, b) => a.name.localeCompare(b.name));
              },
            ),
          );
        } catch (error) {
          console.error('failed to create flavor', error);
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
  useDeleteWasteMutation,
  useUpdateWasteMutation,
  useGetReasonsQuery,
  useLazyGetReasonsQuery,
  useCreateReasonMutation,
  useGetFlavorsQuery,
  useLazyGetFlavorsQuery,
  useCreateFlavorMutation,
} = wasteApi;
export default wasteApi;
