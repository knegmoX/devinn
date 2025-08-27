import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  FlightHotelStore,
  FlightSearchParams,
  FlightSearchResult,
  FlightOption,
  HotelSearchParams,
  HotelSearchResult,
  HotelOption,
  PriceAlert,
  PriceHistory
} from '@/types';
import { flightSearchService } from '@/services/booking/FlightSearchService';
import { hotelSearchService } from '@/services/booking/HotelSearchService';
import { logger } from '@/lib/logger';

export const useFlightHotelStore = create<FlightHotelStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Flight State
        flightSearchParams: null,
        flightResults: null,
        selectedFlights: [],
        flightLoading: false,
        flightError: null,
        
        // Hotel State
        hotelSearchParams: null,
        hotelResults: null,
        selectedHotels: [],
        hotelLoading: false,
        hotelError: null,
        
        // Price Monitoring
        priceAlerts: [],
        priceHistory: {},
        
        // Flight Actions
        searchFlights: async (params: FlightSearchParams) => {
          set({ flightLoading: true, flightError: null });
          
          try {
            logger.info('Searching flights', { params });
            const results = await flightSearchService.searchFlights(params);
            
            set({
              flightSearchParams: params,
              flightResults: results,
              flightLoading: false,
              flightError: null
            });
            
            logger.info('Flight search completed', { 
              totalResults: results.totalResults 
            });
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '航班搜索失败';
            logger.error('Flight search failed', { error, params });
            
            set({
              flightLoading: false,
              flightError: errorMessage
            });
          }
        },
        
        // Hotel Actions
        searchHotels: async (params: HotelSearchParams) => {
          set({ hotelLoading: true, hotelError: null });
          
          try {
            logger.info('Searching hotels', { params });
            const results = await hotelSearchService.searchHotels(params);
            
            set({
              hotelSearchParams: params,
              hotelResults: results,
              hotelLoading: false,
              hotelError: null
            });
            
            logger.info('Hotel search completed', { 
              totalResults: results.totalResults 
            });
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '酒店搜索失败';
            logger.error('Hotel search failed', { error, params });
            
            set({
              hotelLoading: false,
              hotelError: errorMessage
            });
          }
        },
        
        // Selection Actions
        selectFlight: (flight: FlightOption) => {
          const state = get();
          const isAlreadySelected = state.selectedFlights.some(f => f.id === flight.id);
          
          if (isAlreadySelected) {
            // 取消选择
            set({
              selectedFlights: state.selectedFlights.filter(f => f.id !== flight.id)
            });
          } else {
            // 根据航班类型处理选择逻辑
            let newSelectedFlights = [...state.selectedFlights];
            
            if (flight.type === 'OUTBOUND') {
              // 替换现有的去程航班
              newSelectedFlights = newSelectedFlights.filter(f => f.type !== 'OUTBOUND');
              newSelectedFlights.push(flight);
            } else if (flight.type === 'RETURN') {
              // 替换现有的返程航班
              newSelectedFlights = newSelectedFlights.filter(f => f.type !== 'RETURN');
              newSelectedFlights.push(flight);
            }
            
            set({ selectedFlights: newSelectedFlights });
          }
          
          logger.info('Flight selection updated', { 
            flightId: flight.id, 
            type: flight.type,
            totalSelected: get().selectedFlights.length 
          });
        },
        
        selectHotel: (hotel: HotelOption) => {
          const state = get();
          const isAlreadySelected = state.selectedHotels.some(h => h.id === hotel.id);
          
          if (isAlreadySelected) {
            // 取消选择
            set({
              selectedHotels: state.selectedHotels.filter(h => h.id !== hotel.id)
            });
          } else {
            // 添加到选择列表（支持多选）
            set({
              selectedHotels: [...state.selectedHotels, hotel]
            });
          }
          
          logger.info('Hotel selection updated', { 
            hotelId: hotel.id,
            totalSelected: get().selectedHotels.length 
          });
        },
        
        // Price Alert Actions
        createPriceAlert: async (type: 'FLIGHT' | 'HOTEL', itemId: string, targetPrice: number) => {
          try {
            let alert: PriceAlert;
            
            if (type === 'FLIGHT') {
              alert = await flightSearchService.createPriceAlert(itemId, targetPrice);
            } else {
              alert = await hotelSearchService.createPriceAlert(itemId, targetPrice);
            }
            
            set(state => ({
              priceAlerts: [...state.priceAlerts, alert]
            }));
            
            logger.info('Price alert created', { type, itemId, targetPrice });
            
          } catch (error) {
            logger.error('Failed to create price alert', { error, type, itemId });
            throw error;
          }
        },
        
        // Booking Link Generation
        generateBookingLink: async (type: 'FLIGHT' | 'HOTEL', itemId: string, provider: string): Promise<string> => {
          try {
            let deepLink;
            
            if (type === 'FLIGHT') {
              deepLink = await flightSearchService.generateDeepLink(itemId, provider);
            } else {
              deepLink = await hotelSearchService.generateDeepLink(itemId, provider);
            }
            
            logger.info('Booking link generated', { type, itemId, provider });
            return deepLink.url;
            
          } catch (error) {
            logger.error('Failed to generate booking link', { error, type, itemId });
            throw error;
          }
        },
        
        // Utility Actions
        clearResults: () => {
          set({
            flightResults: null,
            hotelResults: null,
            selectedFlights: [],
            selectedHotels: [],
            flightError: null,
            hotelError: null
          });
          
          logger.info('Search results cleared');
        },
        
        resetSearch: () => {
          set({
            flightSearchParams: null,
            flightResults: null,
            selectedFlights: [],
            flightLoading: false,
            flightError: null,
            
            hotelSearchParams: null,
            hotelResults: null,
            selectedHotels: [],
            hotelLoading: false,
            hotelError: null,
            
            priceAlerts: [],
            priceHistory: {}
          });
          
          logger.info('Flight hotel store reset');
        }
      }),
      {
        name: 'flight-hotel-store',
        partialize: (state) => ({
          // 只持久化选择的航班和酒店，搜索结果不持久化
          selectedFlights: state.selectedFlights,
          selectedHotels: state.selectedHotels,
          priceAlerts: state.priceAlerts
        }),
      }
    ),
    {
      name: 'flight-hotel-store',
    }
  )
);

// 导出便捷的 hooks
export const useFlightSearch = () => {
  const store = useFlightHotelStore();
  return {
    // State
    searchParams: store.flightSearchParams,
    results: store.flightResults,
    selectedFlights: store.selectedFlights,
    loading: store.flightLoading,
    error: store.flightError,
    
    // Actions
    searchFlights: store.searchFlights,
    selectFlight: store.selectFlight,
    createPriceAlert: (flightId: string, targetPrice: number) => 
      store.createPriceAlert('FLIGHT', flightId, targetPrice),
    generateBookingLink: (flightId: string, provider: string) =>
      store.generateBookingLink('FLIGHT', flightId, provider)
  };
};

export const useHotelSearch = () => {
  const store = useFlightHotelStore();
  return {
    // State
    searchParams: store.hotelSearchParams,
    results: store.hotelResults,
    selectedHotels: store.selectedHotels,
    loading: store.hotelLoading,
    error: store.hotelError,
    
    // Actions
    searchHotels: store.searchHotels,
    selectHotel: store.selectHotel,
    createPriceAlert: (hotelId: string, targetPrice: number) => 
      store.createPriceAlert('HOTEL', hotelId, targetPrice),
    generateBookingLink: (hotelId: string, provider: string) =>
      store.generateBookingLink('HOTEL', hotelId, provider)
  };
};

export const usePriceMonitoring = () => {
  const store = useFlightHotelStore();
  return {
    // State
    alerts: store.priceAlerts,
    history: store.priceHistory,
    
    // Actions
    createAlert: store.createPriceAlert
  };
};
