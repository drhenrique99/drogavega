
import React, { useState } from 'react';
import { CartItem, CustomerInfo } from '../types';
import { CONTACT_WHATSAPP } from '../constants';
import { generatePixPayload, getPixQrCodeUrl } from '../services/pixService';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  consultantName?: string;
  consultantPhone?: string;
  customer?: CustomerInfo;
  onSuccess?: () => void;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  total, 
  consultantName, 
  consultantPhone,
  customer, 
  onSuccess 
}) => {
  const [copied, setCopied] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [notifiedConsultant, setNotifiedConsultant] = useState(false);
  const [notifiedAdmin, setNotifiedAdmin] = useState(false);

  const validTotal = isNaN(total) ? 0 : total;
  const pixPayload = generatePixPayload(validTotal);
  const qrCodeUrl = getPixQrCodeUrl(pixPayload);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendOrderToAdmin = () => {
    const itemsSummary = items.map(i => `- ${i.quantity}x ${i.description}`).join('\n');
    const message = `💊 *NOVO PEDIDO - DROGA VEGA*\n\nOlá, gostaria de confirmar meu pedido intermediado pelo consultor *${consultantName}*.\n\n*Cliente:* ${customer?.name}\n*Endereço:* ${customer?.address}\n\n*Itens:*\n${itemsSummary}\n\n*Total:* R$ ${validTotal.toFixed(2)}\n\n_Por favor, aguardem o comprovante que enviarei a seguir._`;
    
    window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank');
    setNotifiedAdmin(true);
  };

  const sendProofToConsultant = () => {
    if (!consultantPhone) return;
    const message = `✅ *PAGAMENTO REALIZADO*\n\nOlá ${consultantName}!\nAcabei de realizar o pagamento via PIX para o meu pedido na Droga Vega.\n\n*Cliente:* ${customer?.name}\n*Valor:* R$ ${validTotal.toFixed(2)}\n\nEstou enviando o comprovante em anexo para você acompanhar minha entrega!`;
    
    const cleanPhone = consultantPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    setNotifiedConsultant(true);
    setShowThankYou(true);
  };

  const finishProcess = () => {
    setShowThankYou(false);
    onSuccess?.(); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isOpen) return null;

  if (showThankYou) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#0A0A0B]/95 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[4rem] w-full max-w-lg p-16 text-center shadow-[0_0_100px_rgba(27,147,64,0.3)] border border-white/20">
          <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-600 mx-auto mb-10 border-2 border-emerald-100">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Sucesso!</h2>
          <p className="text-[11px] text-[#1B9340] font-black uppercase tracking-[0.3em] mb-10">Pedido e Pagamento Notificados</p>
          <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] mb-10 text-left">
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Resumo da operação:</p>
             <p className="text-sm text-slate-900 font-bold leading-relaxed">A central administrativa recebeu os detalhes do seu pedido e o seu consultor foi avisado do pagamento.</p>
          </div>
          <button onClick={finishProcess} className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl active:scale-95 transition-all hover:bg-black">
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-100">
        
        {/* Lado Esquerdo - PIX */}
        <div className="md:w-1/2 p-10 bg-slate-50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Pague via PIX</h3>
            <p className="text-[10px] text-[#1B9340] font-black uppercase tracking-widest mt-1">Aprovação Prioritária</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 mb-6">
            <img src={qrCodeUrl} alt="QR Code PIX" className="w-48 h-48" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Valor Total</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">R$ {validTotal.toFixed(2)}</p>
          </div>
          <button 
            onClick={handleCopy}
            className={`mt-6 w-full py-3 rounded-xl flex items-center justify-center gap-3 font-black uppercase text-[9px] tracking-widest transition-all ${copied ? 'bg-[#1B9340] text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
          >
            {copied ? 'Código Copiado!' : 'Copiar Chave Pix'}
          </button>
        </div>

        {/* Lado Direito - Notificações */}
        <div className="md:w-1/2 p-10 flex flex-col justify-between relative text-black">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-md flex items-center justify-center text-[8px]">01</span>
                Informar Central (Adm)
              </h4>
              <button 
                onClick={sendOrderToAdmin}
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest transition-all ${notifiedAdmin ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' : 'bg-white border-2 border-slate-100 text-slate-800 hover:border-blue-600 hover:text-blue-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {notifiedAdmin ? 'Pedido Enviado à Central' : 'Enviar Pedido p/ Central'}
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-600 text-white rounded-md flex items-center justify-center text-[8px]">02</span>
                Informar Consultor
              </h4>
              <button 
                onClick={sendProofToConsultant}
                className={`w-full py-6 bg-[#1B9340] text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 ${notifiedConsultant ? 'opacity-90' : ''}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.6-2.8-23.5-8.7-44.8-27.7-16.6-14.8-27.8-33-31.1-38.6-3.3-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                <span>{notifiedConsultant ? 'Pagamento Notificado' : 'Enviar Comprovante ao Consultor'}</span>
              </button>
            </div>

            <p className="mt-4 text-[8px] text-center text-slate-400 font-bold uppercase leading-relaxed max-w-[200px] mx-auto">
              Ao enviar o comprovante, seu consultor validará a venda para liberação imediata.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
