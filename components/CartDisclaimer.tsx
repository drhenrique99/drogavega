
import React from 'react';

interface CartDisclaimerProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export const CartDisclaimer: React.FC<CartDisclaimerProps> = ({ isOpen, onAccept, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-[#0A0A0B]/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[3.5rem] w-full max-w-xl shadow-[0_0_100px_rgba(27,147,64,0.2)] border border-white/20 overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        
        <header className="p-8 border-b border-slate-50 text-center relative">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4 border border-emerald-100">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Termos de Compra</h2>
          <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.3em] mt-1">Droga Vega - Transparência Total</p>
          
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="p-10 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div className="space-y-4 text-slate-600 text-[12px] leading-relaxed font-medium">
            
            <section className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="shrink-0 text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <div>
                <p className="font-black text-slate-900 uppercase text-[10px] mb-1">Estoque e Substituição</p>
                <p>A disponibilidade imediata do estoque total não é garantida. Ao prosseguir, você autoriza a substituição por medicamentos genéricos ou similares, com o devido ajuste de valores (pagamento ou estorno da diferença).</p>
              </div>
            </section>

            <section className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="shrink-0 text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="font-black text-slate-900 uppercase text-[10px] mb-1">Envio e Logística</p>
                <p>O prazo de postagem é de até <strong>1 dia útil</strong> após a confirmação do pagamento. Lembramos que os custos de frete são de responsabilidade do cliente.</p>
              </div>
            </section>

            <section className="flex gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <div className="shrink-0 text-rose-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <p className="font-black text-rose-900 uppercase text-[10px] mb-1">Medicamentos Controlados</p>
                <p className="text-rose-800">Itens que exigem receita médica só serão entregues após a validação obrigatória com nosso farmacêutico responsável.</p>
              </div>
            </section>

          </div>
        </div>

        <footer className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
          <button 
            onClick={onAccept}
            className="w-full py-6 bg-[#1B9340] text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span>Concordo e Continuar</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Em caso de dúvidas, não hesite em falar com seu consultor antes de finalizar.
          </p>
        </footer>
      </div>
    </div>
  );
};
