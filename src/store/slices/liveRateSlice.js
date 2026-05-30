import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

/**
 * Fetch latest rates from centralized source
 */
export const fetchLiveRates = createAsyncThunk(
  'liveRate/fetchLatest',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gold-rates/live');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch live rates'
      );
    }
  }
);

const liveRateSlice = createSlice({
  name: 'liveRate',
  initialState: {
    rates: {
      city: 'Chennai',
      gold18k: 0,
      gold22k: 0,
      gold24k: 0,
      silver: 0,
      updatedAt: null,
      isLive: false,
      source: '',
      marketStatus: 'LIVE',
      gold24k_change: 0,
      gold24k_change_percent: 0,
      gold24k_is_up: true,
      gold22k_change: 0,
      gold22k_change_percent: 0,
      gold22k_is_up: true,
      gold18k_change: 0,
      gold18k_change_percent: 0,
      gold18k_is_up: true,
      silver_change: 0,
      silver_change_percent: 0,
      silver_is_up: true
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearRates: (state) => {
      state.rates = {
        city: 'Chennai',
        gold18k: 0,
        gold22k: 0,
        gold24k: 0,
        silver: 0,
        updatedAt: null,
        isLive: false,
        source: '',
        marketStatus: 'LIVE',
        gold24k_change: 0,
        gold24k_change_percent: 0,
        gold24k_is_up: true,
        gold22k_change: 0,
        gold22k_change_percent: 0,
        gold22k_is_up: true,
        gold18k_change: 0,
        gold18k_change_percent: 0,
        gold18k_is_up: true,
        silver_change: 0,
        silver_change_percent: 0,
        silver_is_up: true
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveRates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLiveRates.fulfilled, (state, action) => {
        state.loading = false;
        // Map API response keys to state keys
        state.rates = {
          city: action.payload.city || 'Chennai',
          gold18k: action.payload.gold_18k || action.payload.gold18K,
          gold22k: action.payload.gold_22k || action.payload.gold22K,
          gold24k: action.payload.gold_24k || action.payload.gold24K,
          silver: action.payload.silver_rate || action.payload.silverRate,
          updatedAt: action.payload.updated_at || action.payload.updatedAt,
          isLive: action.payload.market_status === 'LIVE' || action.payload.isLive,
          source: action.payload.source,
          marketStatus: action.payload.market_status || (action.payload.isLive ? 'LIVE' : 'CACHED'),
          
          gold24k_change: action.payload.gold24k_change || 0,
          gold24k_change_percent: action.payload.gold24k_change_percent || 0,
          gold24k_is_up: action.payload.gold24k_is_up !== false,
          
          gold22k_change: action.payload.gold22k_change || 0,
          gold22k_change_percent: action.payload.gold22k_change_percent || 0,
          gold22k_is_up: action.payload.gold22k_is_up !== false,
          
          gold18k_change: action.payload.gold18k_change || 0,
          gold18k_change_percent: action.payload.gold18k_change_percent || 0,
          gold18k_is_up: action.payload.gold18k_is_up !== false,
          
          silver_change: action.payload.silver_change || 0,
          silver_change_percent: action.payload.silver_change_percent || 0,
          silver_is_up: action.payload.silver_is_up !== false
        };
        state.error = null;
        localStorage.setItem('lastKnownRates', JSON.stringify(state.rates));
      })
      .addCase(fetchLiveRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        
        const cached = localStorage.getItem('lastKnownRates');
        if (cached) {
          state.rates = { ...JSON.parse(cached), isLive: false, marketStatus: 'API ERROR' };
        } else {
          state.rates = {
            city: 'Chennai',
            gold18k: 0,
            gold22k: 0,
            gold24k: 0,
            silver: 0,
            updatedAt: null,
            isLive: false,
            source: 'API Unavailable',
            marketStatus: 'API ERROR',
            gold24k_change: 0,
            gold24k_change_percent: 0,
            gold24k_is_up: true,
            gold22k_change: 0,
            gold22k_change_percent: 0,
            gold22k_is_up: true,
            gold18k_change: 0,
            gold18k_change_percent: 0,
            gold18k_is_up: true,
            silver_change: 0,
            silver_change_percent: 0,
            silver_is_up: true
          };
        }
      });
  },
});


export const { clearRates } = liveRateSlice.actions;
export default liveRateSlice.reducer;
