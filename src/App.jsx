import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages - Auth
import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';
import ErrorPage from './pages/ErrorPage';

// Pages - Super Admin
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import ActivityLogs from './pages/super-admin/ActivityLogs';
import SecurityCenter from './pages/super-admin/SecurityCenter';
import ExecutiveDashboard from './pages/super-admin/ExecutiveDashboard';
import Reports from './pages/reports/Reports';
import LoanPaymentReports from './pages/reports/LoanPaymentReports';
import ChitPaymentReports from './pages/reports/ChitPaymentReports';

// Pages - Admin
import Dashboard from './pages/dashboard/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import CreateLoan from './pages/loans/CreateLoan';

import OrderList from './pages/orders/OrderList';
import Settings from './pages/dashboard/Settings';
import ChitDashboard from './pages/chitFund/ChitDashboard';
import SchemeManagement from './pages/chitFund/SchemeManagement';
import SchemeDetails from './pages/chitFund/SchemeDetails';
import SubscriberLedger from './pages/chitFund/SubscriberLedger';
import SupportManagement from './pages/admin/SupportManagement';
import AdminKycManagement from './pages/goldLoan/AdminKycManagement';
import AdminLoanApprovals from './pages/goldLoan/AdminLoanApprovals';
import LoanPaymentsCollection from './pages/loanPayments/LoanPaymentsCollection';

// Pages - Customer
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerProfile from './pages/customer/CustomerProfile';
import KycVerification from './pages/customer/KycVerification';
import SupportCenter from './pages/customer/SupportCenter';
import MyLoans from './pages/customer/MyLoans';
import PaymentHistory from './pages/customer/PaymentHistory';
import ServicesOverview from './pages/customer/ServicesOverview';
import GoldLoanApply from './pages/goldLoan/GoldLoanApply';
import GoldLoanDashboard from './pages/goldLoan/GoldLoanDashboard';
import CustomerLoanHistory from './pages/goldLoan/CustomerLoanHistory';
import MyChits from './pages/customer/MyChits';

// Styles
import './styles/global.css';

function App() {
  return (
    <>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/unauthorized" element={<ErrorPage title="Access Denied" code="403" type="unauthorized" />} />
        </Route>
        
        {/* Home Redirect */}
        <Route path="/" element={<HomeRedirect />} />
        
        {/* SUPER_ADMIN Routes */}
        <Route path="/super-admin" element={<DashboardLayout allowedRoles={['SUPER_ADMIN']} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="analytics" element={<ExecutiveDashboard />} />
          <Route path="activity-logs" element={<ActivityLogs />} />
          <Route path="security" element={<SecurityCenter />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/loan-payments" element={<LoanPaymentReports />} />
          <Route path="reports/chit-payments" element={<ChitPaymentReports />} />
        </Route>

        {/* ADMIN Routes */}
        <Route path="/admin" element={<DashboardLayout allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="loans" element={<CreateLoan />} />
          <Route path="jewelry-orders" element={<OrderList />} />
          <Route path="chit-fund" element={<ChitDashboard />} />
          <Route path="chit-fund/schemes" element={<SchemeManagement />} />
          <Route path="chit-fund/scheme/:id" element={<SchemeDetails />} />
          <Route path="chit-fund/subscriber/:id" element={<SubscriberLedger />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/loan-payments" element={<LoanPaymentReports />} />
          <Route path="reports/chit-payments" element={<ChitPaymentReports />} />
          <Route path="support" element={<SupportManagement />} />
          <Route path="kyc-management" element={<AdminKycManagement />} />
          <Route path="gold-loan/approvals" element={<AdminLoanApprovals />} />
          <Route path="loan-payments" element={<LoanPaymentsCollection />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* CUSTOMER Routes */}
        <Route path="/customer" element={<DashboardLayout allowedRoles={['CUSTOMER']} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="my-loans" element={<MyLoans />} />
          <Route path="my-chits" element={<MyChits />} />
          <Route path="payments" element={<PaymentHistory />} />
          <Route path="services" element={<ServicesOverview />} />
          <Route path="services/loan" element={<GoldLoanApply />} />
          <Route path="gold-loan/dashboard" element={<GoldLoanDashboard />} />
          <Route path="gold-loan/history" element={<CustomerLoanHistory />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="kyc-verification" element={<KycVerification />} />
          <Route path="support" element={<SupportCenter />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<ErrorPage title="Page Not Found" code="404" />} />
      </Routes>
      
      <ToastContainer position="top-right" theme="colored" />
    </>
  );
}

const HomeRedirect = () => {
  const userString = localStorage.getItem('user');
  if (!userString || userString === "undefined") return <Navigate to="/login" replace />;
  
  try {
    const user = JSON.parse(userString);
    const role = (user.role || '').toUpperCase();
    if (role === 'SUPER_ADMIN') return <Navigate to="/super-admin/dashboard" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />;
    return <Navigate to="/login" replace />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
};

export default App;
