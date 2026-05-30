import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import kycApi from '../../api/kyc.api';

export const fetchKycStatus = createAsyncThunk('kyc/fetchStatus', async (_, { rejectWithValue }) => {
  try {
    const response = await kycApi.getKycStatus();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC status');
  }
});

export const submitKycDocs = createAsyncThunk('kyc/submit', async (formData, { rejectWithValue }) => {
  try {
    const response = await kycApi.submitKyc(formData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to submit KYC');
  }
});

const kycSlice = createSlice({
  name: 'kyc',
  initialState: {
    status: 'PENDING',
    isVerified: false,
    documents: {},
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    resetKycState: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKycStatus.pending, (state) => { state.loading = true; })
      .addCase(fetchKycStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.kycStatus;
        state.isVerified = action.payload.isKycVerified;
        state.documents = action.payload.kycDocuments;
      })
      .addCase(fetchKycStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitKycDocs.pending, (state) => { state.loading = true; })
      .addCase(submitKycDocs.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.status = 'PENDING';
      })
      .addCase(submitKycDocs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetKycState } = kycSlice.actions;
export default kycSlice.reducer;
