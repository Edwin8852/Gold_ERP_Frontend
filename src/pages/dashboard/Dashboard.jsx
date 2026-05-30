import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Coins, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Gem,
  Plus,
  Building,
  ShieldCheck,
  UserCheck,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoans }          from '../../store/slices/loanSlice';
import { fetchCustomers }      from '../../store/slices/customerSlice';
import { fetchLiveRates }      from '../../store/slices/liveRateSlice';
import { fetchLatestGoldRate } from '../../store/slices/goldRateSlice';
import { useTranslation }      from 'react-i18next';
import { useNavigate }         from 'react-router-dom';
import GoldRateWidget          from '../../components/dashboard/GoldRateWidget';

const data = [
  { name: 'Jan', revenue: 4000, loans: 2400 },
  { name: 'Feb', revenue: 3000, loans: 1398 },
  { name: 'Mar', revenue: 2000, loans: 9800 },
  { name: 'Apr', revenue: 2780, loans: 3908 },
  { name: 'May', revenue: 1890, loans: 4800 },
  { name: 'Jun', revenue: 2390, loans: 3800 },
];

const StatCard = ({ title, value, trend, icon: Icon, color, trendUp }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500"
  >
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all duration-500" />
    
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
        {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </div>
    </div>
    
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
    <h3 className="text-3xl font-black mt-1 tracking-tight">{value}</h3>
  </motion.div>
);


const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loans = [], loading: loansLoading, error: loansError } = useSelector(state => state.loans);
  const { customers = [] } = useSelector(state => state.customers);
  const { rates: liveRates } = useSelector(state => state.liveRate);

  const loadData = () => {
    console.log('[AdminDashboard] Refreshing dashboard data...');
    dispatch(fetchLoans());
    dispatch(fetchCustomers());
    dispatch(fetchLiveRates());
    dispatch(fetchLatestGoldRate()); // Keep goldRate slice in sync for loan calculations
  };

  useEffect(() => {
    document.title = "Dashboard | SDRS Gold Finance";
    console.log("[AdminDashboard] Mounting dashboard...");
    loadData();

    // Polling every 20 seconds for real-time updates
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleRetry = () => {
    loadData();
  };

  useEffect(() => {
    if (loans && loans.length > 0) {
      console.log("[AdminDashboard] Loans Loaded:", loans);
    }
  }, [loans]);

  const activeLoans = (loans || []).filter(l => l && (l.status === 'ACTIVE' || l.status === 'APPROVED'));
  const pendingRequests = (loans || []).filter(l => l && l.status === 'PENDING_APPROVAL');
  const pendingKyc = (customers || []).filter(c => c && (c.kycStatus === 'PENDING' || !c.isKycVerified));
  const totalDisbursed = activeLoans.reduce((acc, loan) => acc + parseFloat(loan?.loanAmount || 0), 0);


  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING_APPROVAL':
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 flex items-center gap-1.5 w-fit"><Clock size={12}/> {t('Pending')}</span>;
      case 'ACTIVE':
      case 'APPROVED':
        return <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-1.5 w-fit"><CheckCircle size={12}/> {t('Approved')}</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100 flex items-center gap-1.5 w-fit"><XCircle size={12}/> {t('Rejected')}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 w-fit">{t(status)}</span>;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">{t('Dashboard')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">{t('Dashboard Description')}</p>
        </div>
        <button 
          onClick={() => navigate('/admin/loans')}
          className="btn-gold flex items-center justify-center gap-2 group w-full md:w-auto"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          {t('New Gold Loan')}
        </button>
      </div>

      {/* Gold Market Overview — Live Rate Widget */}
      <GoldRateWidget />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title={t('Total Disbursed')} 
          value={totalDisbursed > 0 ? `₹${(totalDisbursed / 100000).toFixed(2)}L` : '₹0.00'}
          trend="+12.5%" 
          trendUp={true}
          icon={Coins} 
          color="bg-gold" 
        />
        <StatCard 
          title={t('Active Loans')} 
          value={activeLoans.length.toString()} 
          trend="+8.2%" 
          trendUp={true}
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title={t('Pending Requests')} 
          value={pendingRequests.length.toString()} 
          trend={pendingRequests.length > 0 ? t("Action Required") : t("All Clear")} 
          trendUp={pendingRequests.length === 0}
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          title={t('Pending KYC')} 
          value={pendingKyc.length.toString()} 
          trend={pendingKyc.length > 0 ? t("Verification Needed") : t("Verified")} 
          trendUp={pendingKyc.length === 0}
          icon={UserCheck} 
          color="bg-purple-500" 
        />
      </div>


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Recent Loan Requests Table */}
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] overflow-hidden flex flex-col">
          <div className="p-4 md:p-8 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-gradient-to-r from-white to-gray-50/50">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gold/10 rounded-xl text-gold">
                <FileText size={20} />
              </div>
              {t('Recent Loan Requests')}
            </h3>
            <button 
              onClick={() => navigate('/admin/gold-loan/approvals')}
              className="text-gold font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
            >
              {t('View Approvals')} <ArrowRight size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-dark-card/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Customer')}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Gold Details')}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Amount')}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Status')}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {loansLoading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-gold" size={32} />
                        <p className="text-gray-500 font-medium">{t('Loading requests...')}</p>
                      </div>
                    </td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-50">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <FileText size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">{t('No loan applications found')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  loans.slice(0, 6).map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-card/50 transition-colors cursor-pointer group" onClick={() => navigate(`/admin/gold-loan/approvals`)}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center font-bold">
                            {loan.customer?.firstName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{loan.customer?.firstName} {loan.customer?.lastName}</p>
                            <p className="text-xs text-gray-500">{loan.loanNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-bold text-gray-900">{loan.goldPurity} Gold</p>
                        <p className="text-[10px] font-medium text-gray-500">{loan.goldWeight} Grams</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-black text-gray-900">₹{parseFloat(loan.loanAmount).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-5">
                        {getStatusBadge(loan.status)}
                      </td>
                      <td className="px-8 py-5 text-xs text-gray-500 font-medium">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>


          <div className="glass-card p-8 rounded-[2.5rem] bg-gold/5 border-gold/20">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gold rounded-2xl text-black">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h4 className="font-black text-sm">{t('SDRS SECURE')}</h4>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('Pledge & Repledge')}</p>
                </div>
             </div>
             <p className="text-xs text-gray-600 leading-relaxed mb-6">
               {t('Your gold assets are insured and stored in enterprise-grade vaults with 24/7 surveillance.')}
             </p>
             <div className="flex items-center justify-between text-[10px] font-black text-gold-dark uppercase tracking-widest">
                <span>{t('GST Verified')}</span>
                <span>{t('ISO Certified')}</span>
             </div>
          </div>
        </div>
      
      {/* Business Info Section */}
      <div className="glass-card p-5 md:p-8 rounded-[2.5rem] bg-gradient-to-br from-white to-gold/5 dark:from-dark-card dark:to-gold/5 border-gold/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gold rounded-3xl flex items-center justify-center text-black shadow-gold group">
              <Building size={32} className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">SDRS GOLD FINANCE</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><UserCheck size={14} className="text-gold" /> {t('Proprietor')}: D. Sekar</span>
                <span className="flex items-center gap-1"><FileText size={14} className="text-gold" /> {t('GSTIN')}: 33BIXPS6851D1ZQ</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 bg-white dark:bg-dark-bg p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
              <div className="p-2 bg-gold/10 rounded-xl text-gold font-bold">
                +91 98432 57757
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

