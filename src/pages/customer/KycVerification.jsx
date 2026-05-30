import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  User, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Camera,
  PenTool,
  Loader2
} from 'lucide-react';
import { fetchKycStatus, submitKycDocs, resetKycState } from '../../store/slices/kycSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const KycVerification = () => {
  const dispatch = useDispatch();
  const { status, isVerified, loading, error, success } = useSelector((state) => state.kyc);
  
  const [formData, setFormData] = useState({
    aadharNumber: '',
    panNumber: ''
  });

  const [files, setFiles] = useState({
    kycAadharFront: null,
    kycAadharBack: null,
    kycPanCard: null
  });

  const [previews, setPreviews] = useState({});

  useEffect(() => {
    dispatch(fetchKycStatus());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('KYC Documents submitted successfully!');
      dispatch(resetKycState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetKycState());
    }
  }, [success, error, dispatch]);

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [key]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [key]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('aadharNumber', formData.aadharNumber);
    data.append('panNumber', formData.panNumber);
    
    Object.keys(files).forEach(key => {
      if (files[key]) data.append(key, files[key]);
    });

    dispatch(submitKycDocs(data));
  };

  if (isVerified) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-green-200"
        >
          <ShieldCheck size={48} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-black">KYC Fully Verified</h1>
          <p className="text-gray-500 text-lg">Your identity has been successfully authenticated. You have full access to all gold finance services.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
           <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-3">
              <CheckCircle className="text-green-500" />
              <span className="font-bold text-sm">Aadhaar Verified</span>
           </div>
           <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-3">
              <CheckCircle className="text-green-500" />
              <span className="font-bold text-sm">PAN Verified</span>
           </div>
           <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-3">
              <CheckCircle className="text-green-500" />
              <span className="font-bold text-sm">Biometrics Matched</span>
           </div>
        </div>
      </div>
    );
  }

  if (status === 'PENDING' && !loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-8">
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Clock size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-black">Verification in Progress</h1>
          <p className="text-gray-500 text-lg">Our compliance team is reviewing your documents. This usually takes 12-24 hours.</p>
        </div>
        <div className="p-8 bg-blue-50 text-blue-700 rounded-[2.5rem] inline-block font-bold">
           Reference ID: #KYC-{Math.floor(100000 + Math.random() * 900000)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12 pb-32">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-display font-black tracking-tight">Identity Verification</h1>
        <p className="text-gray-500 text-lg">Upload your Aadhaar and PAN card documents to unlock gold loan services.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-10">
          {/* Document Section 1: Aadhaar */}
          <div className="glass-card p-10 rounded-[3rem] space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                 <CreditCard size={24} />
              </div>
              <h3 className="text-2xl font-bold">Aadhaar Card Details</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">Aadhaar Number (12 Digits)</label>
                <input 
                  type="text"
                  maxLength="12"
                  required
                  placeholder="0000 0000 0000"
                  value={formData.aadharNumber}
                  onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-gold rounded-2xl p-5 font-bold text-xl outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">Aadhaar Front</label>
                  <label className="relative cursor-pointer group">
                    <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 group-hover:border-gold rounded-[2rem] flex flex-col items-center justify-center gap-3 overflow-hidden transition-all">
                       {previews.kycAadharFront ? (
                         <img src={previews.kycAadharFront} className="w-full h-full object-cover" />
                       ) : (
                         <>
                           <Upload className="text-gray-300 group-hover:text-gold transition-colors" size={32} />
                           <span className="text-sm font-bold text-gray-400">Click to upload Front</span>
                         </>
                       )}
                    </div>
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'kycAadharFront')} required />
                  </label>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">Aadhaar Back</label>
                  <label className="relative cursor-pointer group">
                    <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 group-hover:border-gold rounded-[2rem] flex flex-col items-center justify-center gap-3 overflow-hidden transition-all">
                       {previews.kycAadharBack ? (
                         <img src={previews.kycAadharBack} className="w-full h-full object-cover" />
                       ) : (
                         <>
                           <Upload className="text-gray-300 group-hover:text-gold transition-colors" size={32} />
                           <span className="text-sm font-bold text-gray-400">Click to upload Back</span>
                         </>
                       )}
                    </div>
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'kycAadharBack')} required />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Document Section 2: PAN Card */}
          <div className="glass-card p-10 rounded-[3rem] space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                 <FileText size={24} />
              </div>
              <h3 className="text-2xl font-bold">PAN Card Details</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">PAN Number</label>
                <input 
                  type="text"
                  required
                  placeholder="ABCDE1234F"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-gold rounded-2xl p-5 font-bold text-xl outline-none transition-all"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="space-y-4">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">PAN Card Copy</label>
                  <label className="relative cursor-pointer group">
                    <div className="w-full h-64 bg-gray-50 border-2 border-dashed border-gray-200 group-hover:border-gold rounded-[2.5rem] flex flex-col items-center justify-center gap-3 overflow-hidden transition-all">
                       {previews.kycPanCard ? (
                         <img src={previews.kycPanCard} className="w-full h-full object-cover" />
                       ) : (
                         <>
                           <Upload className="text-gray-300 group-hover:text-gold transition-colors" size={40} />
                           <span className="text-sm font-bold text-gray-400">Upload high-resolution PAN copy</span>
                         </>
                       )}
                    </div>
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'kycPanCard')} required />
                  </label>
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-xl mx-auto">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
            <AlertCircle className="text-yellow-600 shrink-0" size={20} />
            <p className="text-xs text-yellow-800 font-medium leading-relaxed">
              Ensure all documents are original copies and clearly readable. Blurry or cropped images will lead to immediate rejection.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gold text-black rounded-[2rem] font-black shadow-2xl shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={24} /> Submit KYC Verification</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KycVerification;
