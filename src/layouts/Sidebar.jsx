import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Coins, 
  CreditCard, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Bell, 
  Settings,
  LogOut,
  ShieldCheck,
  Activity,
  Database,
  History,
  User as UserIcon,
  HelpCircle,
  TrendingUp,
  Wallet,
  FileText
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import sdrsLogo from '../assets/sdrs_logo_seal.png';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // Define menu items for all roles
  const menuConfig = {
    SUPER_ADMIN: [
      { name: t('Dashboard'), icon: LayoutDashboard, path: '/super-admin/dashboard' },
      { name: t('Analytics'), icon: BarChart3, path: '/super-admin/analytics' },
      { name: t('Activity Logs'), icon: Activity, path: '/super-admin/activity-logs' },
      { name: t('Security Center'), icon: ShieldCheck, path: '/super-admin/security' },
      { name: t('Reports'), icon: BarChart3, path: '/super-admin/reports' },
    ],
    ADMIN: [
      { name: t('Dashboard'), icon: LayoutDashboard, path: '/admin/dashboard' },
      { name: t('Customers'), icon: Users, path: '/admin/customers' },
      { name: t('Loans'), icon: Coins, path: '/admin/loans' },
      { name: t('Loan Payments'), icon: CreditCard, path: '/admin/loan-payments' },
      { name: t('Loan Approvals'), icon: ShieldCheck, path: '/admin/gold-loan/approvals' },
      { name: t('KYC Management'), icon: UserIcon, path: '/admin/kyc-management' },
      { name: t('Jewelry Orders'), icon: ShoppingBag, path: '/admin/jewelry-orders' },
      { name: t('Chit Fund'), icon: Wallet, path: '/admin/chit-fund' },
      { name: t('Support Inbox'), icon: HelpCircle, path: '/admin/support' },
      { name: t('Reports'), icon: FileText, path: '/admin/reports' },
      { name: t('Settings'), icon: Settings, path: '/admin/settings' },
    ],
    CUSTOMER: [
      { name: t('Dashboard'), icon: LayoutDashboard, path: '/customer/dashboard' },
      { name: t('My Loans'), icon: Coins, path: '/customer/my-loans' },
      { name: t('My Chits'), icon: Wallet, path: '/customer/my-chits' },
      { name: t('Payments'), icon: CreditCard, path: '/customer/payments' },
      { name: t('KYC Verification'), icon: ShieldCheck, path: '/customer/kyc-verification' },
      { name: t('Support'), icon: HelpCircle, path: '/customer/support' },
      { name: t('Profile'), icon: UserIcon, path: '/customer/profile' },
    ]
  };

  const menuItems = menuConfig[user?.role] || [];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 0 }}
      className="fixed left-0 top-0 h-screen bg-[#c2932e] text-white z-50 overflow-hidden lg:relative lg:block shadow-xl shadow-gray-200/50 flex flex-col"
    >
      <div className="p-5 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/10 overflow-hidden p-0.5">
          <img src={sdrsLogo} alt="SDRS Logo" className="w-full h-full object-contain drop-shadow-md" />
        </div>
        <span className="text-xl font-display font-bold tracking-tight text-white">SDRS <span className="text-white">GOLD FINANCE</span></span>
      </div>

      <nav className="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            onClick={() => window.innerWidth < 1024 && toggleSidebar()}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-2.5 transition-all duration-300 ease-in-out hover:translate-x-[2px] group ${
                isActive 
                ? 'bg-gradient-to-r from-white to-[#f8f5ee] text-[#1f2937] rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] font-bold' 
                : 'rounded-xl text-white/90 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <item.icon size={20} className="transition-transform group-hover:scale-110" />
            <span className="whitespace-nowrap text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/20 flex-shrink-0">
        <button 
          onClick={() => {
            if (window.innerWidth < 1024) toggleSidebar();
            dispatch(logout());
          }}
          className="flex items-center gap-4 w-full px-4 py-2.5 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">{t('Logout')}</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
