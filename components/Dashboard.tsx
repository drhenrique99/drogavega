
import React, { useState, useEffect, useMemo } from 'react';
import { StaffMember, Product, Order, DashboardMetrics } from '../types';
import { fetchStaffData, fetchOrdersData } from '../services/sheetService';
import { settleConsultantPayment } from '../services/orderService';
import { IMMUTABLE_ADMINS } from '../constants';

interface DashboardProps {
  metrics: DashboardMetrics;
  products: Product[]; 
  currentUserPhone: string;
}

// Componente Interno para Confirmação Visual
const ConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}> = ({ isOpen, title, message, onConfirm, onCancel, isDanger }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${isDanger ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDanger ? 'text-rose-600' : 'text-slate-900'}`}>{title}</h3>
          <p className="text-[11px] text-slate-500 font-bold leading-relaxed mb-8 uppercase tracking-wide">{message}</p>
          <div className="flex flex-col gap-3">
             <button onClick={onConfirm} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all ${isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>Confirmar Ação</button>
             <button onClick={onCancel} className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all">Cancelar</button>
          </div>
       </div>
    </div>
  );
};

// Componente Interno para Alertas Curtos
const AlertModal: React.FC<{
  isOpen: boolean;
  message: string;
  onClose: () => void;
}> = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-3xl w-full max-w-xs p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <p className="text-[10px] text-slate-800 font-black uppercase tracking-widest mb-6 leading-relaxed">{message}</p>
          <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">Entendido</button>
       </div>
    </div>
  );
};

const normalize = (str: string) => {
  if (!str) return '';
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

export const Dashboard: React.FC<DashboardProps> = ({ products, currentUserPhone }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'performance' | 'equipe' | 'seguranca'>('performance');
  
  // Estados para os novos modais
  const [settleConfirmTarget, setSettleConfirmTarget] = useState<StaffMember | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const cleanPhone = currentUserPhone.replace(/\D/g, '');
  
  const isMasterAdmin = useMemo(() => {
    return IMMUTABLE_ADMINS.some(adm => cleanPhone.includes(adm) || adm.includes(cleanPhone));
  }, [cleanPhone]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffData, ordersData] = await Promise.all([
        fetchStaffData(),
        fetchOrdersData()
      ]);
      setStaff(staffData);
      setOrders(ordersData);
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const getMemberStats = (name: string) => {
    if (!name) return { sales: 0, costs: 0, profit: 0, consultantShare: 0, orders: [] as Order[] };
    const searchName = normalize(name);
    const memberOrders = orders.filter(o => normalize(o.consultant) === searchName);

    const sales = memberOrders.reduce((acc, o) => acc + o.totalValue, 0);
    const costs = memberOrders.reduce((acc, o) => acc + (o.totalCost || 0), 0);
    const profit = Math.max(0, sales - costs);

    return {
      sales,
      costs,
      profit,
      consultantShare: profit * 0.20,
      orders: memberOrders
    };
  };

  const loggedConsultantName = useMemo(() => {
    const found = staff.find(s => s.user.replace(/\D/g, '').includes(cleanPhone) || cleanPhone.includes(s.user.replace(/\D/g, '')));
    return found ? found.name : '';
  }, [staff, cleanPhone]);

  const myStats = useMemo(() => {
    if (!loggedConsultantName) return { sales: 0, costs: 0, profit: 0, consultantShare: 0, orders: [] as Order[] };
    return getMemberStats(loggedConsultantName);
  }, [orders, loggedConsultantName]);

  const executeSettle = async (member: StaffMember) => {
    setSettleConfirmTarget(null);
    setProcessingId(member.id);

    const searchName = normalize(member.name);
    const ordersBeforeCleanup = [...orders];
    setOrders(prev => prev.filter(o => normalize(o.consultant) !== searchName));

    try {
      const success = await settleConsultantPayment(member.id, member.name);
      if (success) {
        setTimeout(async () => {
          await loadData();
          setProcessingId(null);
        }, 7000);
      } else {
        throw new Error("Erro no servidor");
      }
    } catch (err) {
      setAlertMsg("ERRO NA PLANILHA. DADOS RESTAURADOS.");
      setOrders(ordersBeforeCleanup);
      setProcessingId(null);
      loadData();
    }
  };

  const tabs = ['performance', 'equipe', 'seguranca'].filter(tab => {
    if (tab === 'equipe') return isMasterAdmin;
    return true;
  });

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>
              {tab === 'seguranca' ? 'Auditoria' : tab === 'performance' ? 'Financeiro' : 'Equipe'}
            </button>
          ))}
        </div>
        <button onClick={loadData} className="p-3 bg-white/5 rounded-2xl border border-white/10 active:scale-90 transition-all">
          <svg className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2.5"/></svg>
        </button>
      </div>

      {activeTab === 'performance' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 p-8 rounded-[3rem] border border-emerald-500/20 shadow-2xl">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Consultor: {loggedConsultantName}</p>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">Vendas Pendentes</p>
                <p className="text-4xl font-black text-white">R$ {myStats.sales.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-500 p-6 rounded-[2rem] shadow-xl shadow-emerald-500/20">
                <p className="text-emerald-900 text-[9px] font-black uppercase mb-1">Comissão (20%)</p>
                <p className="text-2xl font-black text-white">R$ {myStats.consultantShare.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white/5 rounded-[2.5rem] p-8 border border-white/10">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Detalhamento de Vendas em Aberto</h3>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="text-[9px] font-black text-slate-500 uppercase border-b border-white/10">
                  <tr>
                    <th className="pb-4 px-4">Data / Produto</th>
                    <th className="pb-4 px-4">Valor Total (R$)</th>
                    <th className="pb-4 px-4 text-emerald-400">Ganhos (R$)</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold">
                  {myStats.orders.length === 0 ? (
                    <tr><td colSpan={3} className="py-24 text-center text-slate-500 uppercase tracking-widest opacity-30 italic">Sem vendas em aberto.</td></tr>
                  ) : myStats.orders.map((o, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-5 px-4"><p className="text-white uppercase">{o.product}</p><p className="text-[9px] text-slate-500 mt-1">{o.date}</p></td>
                      <td className="py-5 px-4 text-slate-300">R$ {o.totalValue.toFixed(2)}</td>
                      <td className="py-5 px-4 text-emerald-400 font-black">R$ {((o.totalValue - (o.totalCost || 0)) * 0.2).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'equipe' && isMasterAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in zoom-in-95 duration-500">
          {staff.map(member => {
            const mStats = getMemberStats(member.name);
            const isProcessing = processingId === member.id;
            return (
              <div key={member.id} className={`bg-white/5 p-8 rounded-[2.5rem] border ${isProcessing ? 'border-emerald-500' : 'border-white/10'} relative overflow-hidden group hover:bg-white/10 transition-all`}>
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/95 z-20 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Limpando Planilha...</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-2">Apagando registros de {member.name}</p>
                  </div>
                )}
                
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h4 className="text-lg font-black text-white uppercase truncate">{member.name}</h4>
                    <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest mt-2 block">{member.user}</span>
                  </div>

                  <div className="flex-grow space-y-3 py-6 border-y border-white/5 mb-8">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[9px] font-black text-slate-500 uppercase">Total Vendas:</span>
                      <span className="text-sm font-black text-white">R$ {mStats.sales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[9px] font-black text-emerald-500 uppercase">Comissão:</span>
                      <span className="text-lg font-black text-emerald-400">R$ {mStats.consultantShare.toFixed(2)}</span>
                    </div>
                  </div>

                  <button 
                    disabled={isProcessing || mStats.sales === 0}
                    onClick={() => {
                      if (mStats.orders.length === 0) {
                        setAlertMsg("ESTE CONSULTOR NÃO POSSUI VENDAS ABERTAS.");
                      } else {
                        setSettleConfirmTarget(member);
                      }
                    }}
                    className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 shadow-xl ${mStats.sales > 0 ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-white/10 text-slate-500 opacity-20'}`}
                  >
                    Liquidar e Apagar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAIS DE INTERAÇÃO (Substituem Alert/Confirm) */}
      <ConfirmModal 
        isOpen={!!settleConfirmTarget}
        title="Exclusão Permanente"
        message={`Isso apagará fisicamente todos os registros de venda de ${settleConfirmTarget?.name} na planilha. Esta ação não pode ser desfeita.`}
        isDanger={true}
        onConfirm={() => settleConfirmTarget && executeSettle(settleConfirmTarget)}
        onCancel={() => setSettleConfirmTarget(null)}
      />

      <AlertModal 
        isOpen={!!alertMsg}
        message={alertMsg || ''}
        onClose={() => setAlertMsg(null)}
      />
    </div>
  );
};

export default Dashboard;
