import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyGoldLoans } from '../../store/slices/goldLoanSlice';
import { fetchLoanPayments } from '../../store/slices/paymentSlice';
import { 
  Gem, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  Coins, 
  TrendingUp,
  AlertTriangle,
  FileText,
  CreditCard,
  Download,
  Loader2,
  ShieldCheck,
  User as UserIcon,
  Scale,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import goldLoanApi from '../../api/goldLoan.api';
import { toast } from 'react-toastify';

const CustomerLoanHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loans, loading } = useSelector((state) => state.goldLoan);
  const { payments, loading: paymentsLoading } = useSelector((state) => state.payments);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMyGoldLoans());
  }, [dispatch]);

  // Fetch payments & history when a loan is selected
  useEffect(() => {
    if (selectedLoan?.id) {
      dispatch(fetchLoanPayments(selectedLoan.id));
      
      setHistoryLoading(true);
      goldLoanApi.fetchLoanHistory(selectedLoan.id)
        .then(res => {
          setHistory(res.data.data || []);
        })
        .catch(err => console.error('Failed to fetch history:', err))
        .finally(() => setHistoryLoading(false));
    }
  }, [selectedLoan, dispatch]);

  // Sync selected loan when loans update
  useEffect(() => {
    if (selectedLoan && loans.length > 0) {
      const updated = loans.find(l => l.id === selectedLoan.id);
      if (updated) setSelectedLoan(updated);
    }
  }, [loans]);

  const handleDownloadInvoice = async (loanId) => {
    setDownloadingId(loanId);
    try {
      const response = await goldLoanApi.fetchLoanInvoices(loanId);
      const invoices = response.data.data;
      if (invoices && invoices.length > 0) {
        const inv = invoices[0];
        const pdfResponse = await goldLoanApi.downloadInvoicePDF(inv.id);
        const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice-${inv.invoiceNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Invoice downloaded successfully');
      } else {
        toast.info('Invoice is being generated. Please wait.');
      }
    } catch (err) {
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING_APPROVAL': 'bg-blue-50 text-blue-600',
      'APPROVED': 'bg-green-50 text-green-600',
      'ACTIVE': 'bg-emerald-50 text-emerald-600',
      'OVERDUE': 'bg-red-50 text-red-600',
      'CLOSED': 'bg-gray-100 text-gray-500'
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] || 'bg-gray-50 text-gray-500'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 hover:bg-gray-100 rounded-full transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold">Loan Ledger & History</h1>
            <p className="text-gray-500">Track your repayment schedules and interest cycles.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/customer/services/loan')}
          className="btn-gold px-8 py-4 rounded-2xl font-black shadow-lg shadow-gold/20 flex items-center gap-2"
        >
          New Loan Request
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Loan List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 px-2">Your Applications</h3>
          <div className="space-y-3">
            {loans.length === 0 && !loading && (
              <div className="p-10 text-center bg-gray-50 rounded-[2rem] text-gray-400">
                 No loans found
              </div>
            )}
            {loans.map((loan) => (
              <button
                key={loan.id}
                onClick={() => setSelectedLoan(loan)}
                className={`w-full text-left p-6 rounded-[2rem] transition-all border-2 ${
                  selectedLoan?.id === loan.id 
                  ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' 
                  : 'bg-white border-transparent hover:border-gold/20 hover:shadow-xl'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${selectedLoan?.id === loan.id ? 'bg-gold text-black' : 'bg-gold/10 text-gold'}`}>
                    <Gem size={20} />
                  </div>
                  {getStatusBadge(loan.status)}
                </div>
                <h4 className="font-bold text-lg">{loan.loanNumber}</h4>
                <p className={`text-sm mt-1 ${selectedLoan?.id === loan.id ? 'text-gray-400' : 'text-gray-500'}`}>
                  ₹{Number(loan.approvedAmount || loan.loanAmount || 0).toLocaleString()} • {loan.goldWeight}g
                </p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold opacity-60">
                  <Calendar size={12} />
                  {new Date(loan.loanDate).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Loan Details View */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selectedLoan ? (
              <motion.div
                key={selectedLoan.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-10 rounded-[3rem] space-y-10"
              >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <h2 className="text-4xl font-display font-black tracking-tight">{selectedLoan.loanNumber}</h2>
                      {getStatusBadge(selectedLoan.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                       <span className="flex items-center gap-1.5"><UserIcon size={16} className="text-gold" /> {selectedLoan.customerName}</span>
                       <span className="flex items-center gap-1.5"><Calendar size={16} className="text-gold" /> Applied: {new Date(selectedLoan.createdAt).toLocaleDateString()}</span>
                       <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-gold" /> Verified Asset</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {(selectedLoan.status === 'ACTIVE' || selectedLoan.status === 'APPROVED') && (
                      <button 
                        onClick={() => handleDownloadInvoice(selectedLoan.id)}
                        className="px-6 py-3 bg-black text-white rounded-2xl font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
                      >
                        {downloadingId === selectedLoan.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        Download Official Invoice
                      </button>
                    )}
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Interest Rate</p>
                      <p className="text-2xl font-black text-gold-dark">{selectedLoan.interestRate}% <span className="text-xs text-gray-400 font-normal">P.A.</span></p>
                    </div>
                  </div>
                </div>

                {/* Financial Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className="p-8 bg-gray-50 rounded-[2rem] border border-transparent hover:border-gold/20 transition-all">
                      <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">Approved Amount</p>
                      <p className="text-2xl font-black text-gray-900">₹{Number(selectedLoan.approvedAmount || selectedLoan.loanAmount).toLocaleString()}</p>
                   </div>
                   <div className="p-8 bg-gray-50 rounded-[2rem] border border-transparent hover:border-gold/20 transition-all">
                      <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">Monthly EMI</p>
                      <p className="text-2xl font-black text-gray-900">₹{Number(selectedLoan.monthlyInterest).toLocaleString()}</p>
                   </div>
                   <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                      <p className="text-[10px] text-emerald-600 font-black uppercase mb-1 tracking-widest">Paid Total</p>
                      <p className="text-2xl font-black text-emerald-700">₹{Number(selectedLoan.totalPaid || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-8 bg-gold/5 rounded-[2rem] border border-gold/10">
                      <p className="text-[10px] text-gold-dark font-black uppercase mb-1 tracking-widest">Outstanding</p>
                      <p className="text-2xl font-black text-gold-dark">₹{Number(selectedLoan.remainingPrincipal).toLocaleString()}</p>
                   </div>
                </div>

                {/* Detailed Loan Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                   <div className="space-y-6">
                      <h4 className="text-lg font-black flex items-center gap-2">
                        <Gem size={20} className="text-gold" /> Asset Information
                      </h4>
                      <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-4">
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Gold Purity</span>
                            <span className="font-black">{selectedLoan.goldPurity}</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Net Weight</span>
                            <span className="font-black">{selectedLoan.goldWeight} Grams</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Ornament Type</span>
                            <span className="font-black">{selectedLoan.ornamentType || 'Standard Jewels'}</span>
                         </div>
                         <div className="flex justify-between items-center py-2">
                            <span className="text-gray-500 font-medium">Estimated Value</span>
                            <span className="font-black text-gold-dark">₹{Number(selectedLoan.goldValue).toLocaleString()}</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-lg font-black flex items-center gap-2">
                        <Clock size={20} className="text-gold" /> Tenure & Schedule
                      </h4>
                      <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-4">
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Loan Date</span>
                            <span className="font-black">{new Date(selectedLoan.loanDate).toLocaleDateString()}</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Due Date</span>
                            <span className="font-black text-red-600">{new Date(selectedLoan.dueDate).toLocaleDateString()}</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Loan Duration</span>
                            <span className="font-black">{selectedLoan.loanDuration || 12} Months</span>
                         </div>
                         <div className="flex justify-between items-center py-2">
                            <span className="text-gray-500 font-medium">Status</span>
                            <span className="font-black text-emerald-600 uppercase text-xs">{selectedLoan.status}</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Repayment Action */}
                {selectedLoan.status === 'ACTIVE' && (
                  <div className="pt-6">
                    <div className="bg-black text-white p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                       <div className="z-10 space-y-2">
                          <h4 className="text-2xl font-black">Ready to Repay?</h4>
                          <p className="text-gray-400 font-medium">Make a payment towards your interest or principal balance.</p>
                       </div>
                       <button 
                         onClick={() => navigate('/customer/my-loans')}
                         className="z-10 bg-gold text-black px-10 py-5 rounded-2xl font-black shadow-xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                       >
                          <CreditCard size={20} /> Proceed to Payment
                       </button>
                       <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-gold/10 rounded-full blur-[100px]" />
                    </div>
                  </div>
                )}

                {/* Payments & Timeline Lifecycle History (Bilingual) */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 pt-10 border-t border-gray-100">
                   {/* Left Column: Payment History */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-black flex items-center gap-2">
                          <CreditCard size={24} className="text-gold" /> Payment History / கட்டண வரலாறு
                        </h4>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{payments.length} Transactions</span>
                      </div>

                      <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50/50">
                            <tr>
                              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Type</th>
                              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Method</th>
                              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {paymentsLoading ? (
                              <tr>
                                <td colSpan="5" className="px-6 py-10 text-center">
                                  <Loader2 className="animate-spin text-gold mx-auto" size={24} />
                                </td>
                              </tr>
                            ) : payments.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="px-6 py-16 text-center text-gray-400 font-medium">
                                  No payments recorded for this loan yet.
                                </td>
                              </tr>
                            ) : (
                              payments.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-5">
                                    <p className="font-bold text-sm">{new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">{new Date(p.paymentDate || p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </td>
                                  <td className="px-6 py-5">
                                    <p className="font-black text-gray-900">₹{parseFloat(p.paymentAmount).toLocaleString()}</p>
                                  </td>
                                  <td className="px-6 py-5">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-[9px] font-bold uppercase">{p.paymentType}</span>
                                  </td>
                                  <td className="px-6 py-5">
                                    <p className="text-xs font-bold text-gray-600">{p.paymentMethod}</p>
                                  </td>
                                  <td className="px-6 py-5">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                      <ShieldCheck size={14} /> {p.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                   </div>

                   {/* Right Column: Loan Lifecycle Timeline */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-black flex items-center gap-2">
                          <Clock size={24} className="text-gold" /> Loan History Logs / கடன் வரலாற்றுப் பதிவுகள்
                        </h4>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{history.length} Event Logs</span>
                      </div>

                      <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 overflow-hidden relative bg-white">
                         {historyLoading ? (
                            <div className="py-20 text-center">
                              <Loader2 className="animate-spin text-gold mx-auto" size={24} />
                            </div>
                         ) : history.length === 0 ? (
                            <div className="py-16 text-center text-gray-400 font-medium">
                              No history logs recorded yet.
                            </div>
                         ) : (
                            <div className="relative pl-6 space-y-8 border-l-2 border-gold/20 ml-2">
                               {history.map((h) => {
                                  // Get custom icons and colors for actions
                                  let icon = <Clock size={12} />;
                                  let color = 'bg-amber-500 text-black';
                                  let labelEn = h.action;
                                  let labelTa = '';
                                  
                                  if (h.action === 'REQUEST_CREATED') {
                                    icon = <FileText size={12} className="text-black" />;
                                    color = 'bg-amber-400 text-black';
                                    labelEn = 'Request Submitted';
                                    labelTa = 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது';
                                  } else if (h.action === 'ADMIN_APPROVED') {
                                    icon = <ShieldCheck size={12} className="text-white" />;
                                    color = 'bg-blue-600 text-white';
                                    labelEn = 'Online Pre-Approved';
                                    labelTa = 'முன் அனுமதி வழங்கப்பட்டது';
                                  } else if (h.action === 'CUSTOMER_VISITED_SHOP') {
                                    icon = <UserIcon size={12} className="text-white" />;
                                    color = 'bg-purple-600 text-white';
                                    labelEn = 'Shop Visit Verification';
                                    labelTa = 'நேரடி நகைச் சரிபார்ப்பு';
                                  } else if (h.action === 'LOAN_DISBURSED') {
                                    icon = <Coins size={12} className="text-black" />;
                                    color = 'bg-emerald-400 text-black';
                                    labelEn = 'Loan Fully Disbursed';
                                    labelTa = 'கடன் வழங்கப்பட்டது';
                                  } else if (h.action === 'INTEREST_PAID') {
                                    icon = <CreditCard size={12} className="text-white" />;
                                    color = 'bg-indigo-600 text-white';
                                    labelEn = 'Repayment Received';
                                    labelTa = 'தவணை செலுத்தப்பட்டது';
                                  } else if (h.action === 'LOAN_CLOSED') {
                                    icon = <CheckCircle size={12} className="text-white" />;
                                    color = 'bg-gray-800 text-white';
                                    labelEn = 'Loan Closed';
                                    labelTa = 'கணக்கு மூடப்பட்டது';
                                  }

                                  return (
                                    <div key={h.id} className="relative">
                                      {/* Timeline Circle */}
                                      <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center ${color} shadow-md`}>
                                        {icon}
                                      </div>
                                      
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <p className="font-black text-sm text-gray-900">{labelEn}</p>
                                          <p className="text-[10px] text-gray-400 font-bold">
                                            {new Date(h.createdAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                        {labelTa && (
                                          <p className="text-xs text-gold font-bold italic">{labelTa}</p>
                                        )}
                                        {h.remarks && (
                                          <p className="text-xs text-gray-500 mt-1 leading-relaxed bg-gray-50/70 p-3 rounded-2xl border border-gray-100">{h.remarks}</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                               })}
                            </div>
                         )}
                      </div>
                   </div>
                </div>

              </motion.div>
            ) : (
              <div className="glass-card p-32 rounded-[3rem] text-center space-y-6">
                <div className="w-24 h-24 bg-gold/5 rounded-full flex items-center justify-center mx-auto text-gold/20">
                  <TrendingUp size={48} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black">Select a Loan to View History</h4>
                  <p className="text-gray-500">Detailed breakdown of your financial journey with SDRS Gold.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CustomerLoanHistory;
