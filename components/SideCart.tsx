
import React, { useState } from 'react';
import { CartItem, CustomerInfo } from '../types';
import { PixPaymentModal } from './PixPaymentModal';
import { recordOrderInSheet } from '../services/orderService';

interface SideCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  consultantName: string;
  consultantPhone: string;
  onOrderComplete: () => void;
}

export const SideCart: React.FC<SideCartProps> = ({ 
  isOpen, onClose, items, onRemove, onUpdateQuantity, consultantName, consultantPhone, onOrderComplete 
}) => {
  const [isPixOpen, setIsPixOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customer, setCustomer] = useState<CustomerInfo>({ name: '', address: '', whatsapp: '' });
  const [showErrors, setShowErrors] = useState(false);

  const total = items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

  const errors = {
    name: customer.name.trim().length < 3,
    address: customer.address.trim().length < 5,
    whatsapp: customer.whatsapp.trim().length < 8
  };

  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (items.length === 0) return;
    
    if (errors.name || errors.address || errors.whatsapp) {
      setShowErrors(true);
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }
      return;
    }
    
    setShowErrors(false);
    setIsSaving(true);

    try {
      console.log("Iniciando checkout para:", customer.name);
      await recordOrderInSheet(items, consultantName, customer);
      setIsPixOpen(true);
    } catch (error) {
      console.error("Erro no checkout:", error);
      setIsPixOpen(true); 
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative w-screen max-w-full md:max-w-6xl h-screen bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          <header className="h-12 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0 z-20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeWidth="2.5"/></svg>
              </div>
              <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-tighter">Checkout Final</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:block">Consultor: {consultantName}</span>
              <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors active:scale-90">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </header>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4 md:p-6 custom-scrollbar">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Sua Cesta ({items.length} itens)</h3>
                  <button onClick={() => onOrderComplete()} className="text-[8px] font-bold text-rose-400 hover:text-rose-600 uppercase transition-colors active:scale-95">Limpar Tudo</button>
                </div>

                <div className="space-y-2">
                  {items.length === 0 ? (
                    <div className="py-12 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
                      <p className="text-slate-300 text-[9px] font-black uppercase tracking-widest">Vazio</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 group hover:shadow-sm transition-all animate-in slide-in-from-left duration-200">
                        <div className="flex-1">
                          <h4 className="text-[10px] font-black text-slate-800 uppercase leading-tight truncate max-w-[200px]">{item.description}</h4>
                          <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">CÓDIGO: {item.code}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 p-0.5">
                              <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-75">-</button>
                              <span className="w-5 text-center text-[10px] font-black text-slate-900">{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-emerald-500 active:scale-75">+</button>
                           </div>
                           <div className="text-right min-w-[60px]">
                              <p className="text-[11px] font-black text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</p>
                           </div>
                           <button onClick={() => onRemove(item.id)} className="text-slate-200 hover:text-rose-500 transition-colors active:scale-75">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <aside className="w-full md:w-[380px] bg-white border-t md:border-t-0 md:border-l border-slate-100 p-6 flex flex-col justify-between z-10 overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div className="space-y-4">
                  <header>
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-md flex items-center justify-center text-[9px]">01</span>
                      Dados de Entrega
                    </h3>
                  </header>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <label className="block text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1 ml-1">Quem recebe?</label>
                      <input 
                        type="text" 
                        value={customer.name}
                        onChange={e => setCustomer({...customer, name: e.target.value})}
                        className={`w-full px-4 py-3 bg-slate-50 border-2 ${showErrors && errors.name ? 'border-rose-500 bg-rose-50/30 ring-2 ring-rose-500/20 animate-[shake_0.5s_ease-in-out]' : 'border-slate-50'} rounded-xl text-[11px] font-bold uppercase outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900`}
                        placeholder="NOME DO CLIENTE"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1 ml-1">Endereço Completo</label>
                      <input 
                        type="text" 
                        value={customer.address}
                        onChange={e => setCustomer({...customer, address: e.target.value})}
                        className={`w-full px-4 py-3 bg-slate-50 border-2 ${showErrors && errors.address ? 'border-rose-500 bg-rose-50/30 ring-2 ring-rose-500/20 animate-[shake_0.5s_ease-in-out]' : 'border-slate-50'} rounded-xl text-[11px] font-bold uppercase outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900`}
                        placeholder="RUA, NÚMERO, BAIRRO..."
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1 ml-1">WhatsApp</label>
                      <input 
                        type="tel" 
                        value={customer.whatsapp}
                        onChange={e => setCustomer({...customer, whatsapp: e.target.value})}
                        className={`w-full px-4 py-3 bg-slate-50 border-2 ${showErrors && errors.whatsapp ? 'border-rose-500 bg-rose-50/30 ring-2 ring-rose-500/20 animate-[shake_0.5s_ease-in-out]' : 'border-slate-50'} rounded-xl text-[11px] font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900`}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#0A0A0B] rounded-[2.5rem] text-white relative overflow-hidden group border border-white/5">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total do Pedido</p>
                    <span className="bg-blue-600/20 text-blue-400 text-[7px] font-black px-1.5 py-0.5 rounded uppercase">PMC</span>
                  </div>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-sm font-black text-blue-500">R$</span>
                    <span className="text-3xl font-black tracking-tighter">{total.toFixed(2)}</span>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    {showErrors && (
                      <p className="text-[8px] font-black text-rose-400 uppercase tracking-[0.2em] text-center animate-pulse">
                        Preencha os dados de entrega (*)
                      </p>
                    )}
                    
                    <button 
                      onClick={handleCheckout} 
                      disabled={items.length === 0 || isSaving}
                      className="w-full py-5 bg-[#1B9340] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:brightness-110 active:scale-[0.96] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <span>Gerar Pagamento</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 opacity-40">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[7px] font-black text-slate-200 uppercase tracking-[0.2em]">Pagamento via Pix Liberado</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Ambiente Seguro Droga Vega</p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <PixPaymentModal 
        isOpen={isPixOpen} 
        onClose={() => setIsPixOpen(false)} 
        items={items} 
        total={total}
        consultantName={consultantName}
        consultantPhone={consultantPhone}
        customer={customer}
        onSuccess={() => {
          setIsPixOpen(false);
          onClose();
          onOrderComplete();
        }}
      />
    </>
  );
};
