import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, createOrder } from '../../store/slices/jewelryOrderSlice';
import { fetchCustomers } from '../../store/slices/customerSlice';
import { fetchLiveRates } from '../../store/slices/liveRateSlice';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  X,
  ChevronRight,
  User,
  Hash,
  Coins,
  Scale
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const OrderList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.jewelryOrders);
  const { customers } = useSelector((state) => state.customers);
  const { rates } = useSelector((state) => state.liveRate);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    jewelryType: '',
    weight: '',
    purity: '22K',
    goldRateAtPurchase: '',
    totalAmount: ''
  });

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchCustomers());
    dispatch(fetchLiveRates());
  }, [dispatch]);

  const handlePurityChange = (purityValue) => {
    let rate = formData.goldRateAtPurchase;
    if (purityValue === '22K' && rates.gold22k) rate = rates.gold22k;
    if (purityValue === '18K' && rates.gold18k) rate = rates.gold18k;
    if (purityValue === '24K' && rates.gold24k) rate = rates.gold24k;
    
    const calcTotal = formData.weight && rate ? (parseFloat(formData.weight) * parseFloat(rate)).toFixed(2) : formData.totalAmount;

    setFormData({ 
      ...formData, 
      purity: purityValue, 
      goldRateAtPurchase: rate,
      totalAmount: calcTotal
    });
  };

  const handleWeightChange = (newWeight) => {
    const calcTotal = newWeight && formData.goldRateAtPurchase 
      ? (parseFloat(newWeight) * parseFloat(formData.goldRateAtPurchase)).toFixed(2) 
      : formData.totalAmount;
    setFormData({ ...formData, weight: newWeight, totalAmount: calcTotal });
  };

  const handleRateChange = (newRate) => {
    const calcTotal = formData.weight && newRate 
      ? (parseFloat(formData.weight) * parseFloat(newRate)).toFixed(2) 
      : formData.totalAmount;
    setFormData({ ...formData, goldRateAtPurchase: newRate, totalAmount: calcTotal });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      await dispatch(createOrder(payload)).unwrap();
      toast.success(t('Jewelry order placed successfully!'));
      setIsModalOpen(false);
      setFormData({ customerId: '', jewelryType: '', weight: '', purity: '22K', goldRateAtPurchase: '', totalAmount: '' });
    } catch (error) {
      toast.error(error || t('Failed to place order'));
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gold/10 text-gold border-gold/20';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">
            {t('Jewelry')} <span className="text-gold">{t('Orders')}</span> <ShoppingBag className="text-gold inline-block mb-1" size={28} />
          </h1>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">{t('Track sales, custom orders, and customer deliveries')}</p>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-gold-gradient text-black px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-gold/20"
        >
          <Plus size={20} strokeWidth={3} />
          {t('NEW SALE / ORDER')}
        </motion.button>
      </div>

      {/* Orders List */}
      <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-dark-card border-b border-dark-border">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Order Details')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Customer')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Specs')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Amount')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Status')}</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/50">
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center text-gold animate-pulse font-black uppercase tracking-widest">{t('Loading transactions...')}</td></tr>
              ) : (
                orders.map((order, idx) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gold/5 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-dark-card rounded-xl border border-dark-border flex items-center justify-center text-gold">
                          <ShoppingBag size={20} />
                        </div>
                        <div>
                          <p className="text-white font-black text-sm">{order.jewelryType}</p>
                          <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1 uppercase"><Hash size={10}/> {order.orderNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gold/10 text-gold rounded-full flex items-center justify-center font-black">
                           {order.customer?.firstName?.[0]}
                         </div>
                         <div>
                            <p className="text-white font-bold text-sm">{order.customer?.firstName} {order.customer?.lastName}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{order.customer?.mobile}</p>
                         </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-gray-300 font-black flex items-center gap-1 uppercase"><Scale size={10} className="text-gold"/> {order.weight}g</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase">{order.purity} {t('Gold')}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-white font-black text-sm">₹{parseFloat(order.totalAmount).toLocaleString()}</p>
                       <p className="text-[10px] text-gray-500 font-medium uppercase">{t('Rate:')} ₹{order.goldRateAtPurchase}/g</p>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                         {t(order.status)}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="p-2 text-gray-500 hover:text-gold transition-colors">
                          <ChevronRight size={20} />
                       </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-4xl bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8 bg-dark-card border-b border-dark-border flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gold-gradient rounded-xl flex items-center justify-center text-black">
                      <Plus size={24} strokeWidth={3} />
                   </div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">{t('Generate')} <span className="text-gold">{t('Sales Order')}</span></h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-dark-card rounded-full text-gray-500">
                   <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Select Customer')}</label>
                  <select required className="w-full bg-dark-card border border-dark-border rounded-xl px-6 py-4 text-white outline-none focus:border-gold" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                    <option value="">{t('Choose a customer...')}</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.mobile})</option>)}
                  </select>
                </div>



                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Jewelry Type / Item')}</label>
                  <input required className="w-full bg-dark-card border border-dark-border rounded-xl px-6 py-4 text-white outline-none focus:border-gold" value={formData.jewelryType} onChange={e => setFormData({...formData, jewelryType: e.target.value})} placeholder={t('e.g., Heavy Bridal Necklace')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Weight (Grams)')}</label>
                    <input required type="number" step="0.001" className="w-full bg-dark-card border border-dark-border rounded-xl px-6 py-4 text-white outline-none focus:border-gold" value={formData.weight} onChange={e => handleWeightChange(e.target.value)} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Purity')}</label>
                    <select className="w-full bg-dark-card border border-dark-border rounded-xl px-6 py-4 text-white outline-none focus:border-gold" value={formData.purity} onChange={e => handlePurityChange(e.target.value)}>
                      <option>22K</option>
                      <option>18K</option>
                      <option>24K</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Gold Rate (₹/g)')}</label>
                    <input required type="number" className="w-full bg-dark-card border border-dark-border rounded-xl px-6 py-4 text-white outline-none focus:border-gold" value={formData.goldRateAtPurchase} onChange={e => handleRateChange(e.target.value)} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Total Bill Amount (₹)')}</label>
                    <input required type="number" className="w-full bg-dark-card border border-dark-border rounded-xl px-6 py-4 text-white outline-none focus:border-gold font-black text-gold" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} />
                  </div>
                </div>

                <div className="md:col-span-2 pt-6">
                  <button type="submit" className="w-full py-6 bg-gold-gradient text-black font-black text-sm tracking-widest uppercase rounded-2xl shadow-2xl shadow-gold/30 hover:scale-[1.02] transition-all">
                    {t('CONFIRM TRANSACTION & PLAIN ORDER')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderList;
