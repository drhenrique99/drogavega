
import React, { useState } from 'react';
import { requestAffiliate } from '../services/orderService';

interface AffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStep = 'contract' | 'form' | 'success';

export const AffiliateModal: React.FC<AffiliateModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<ModalStep>('contract');
  const [formData, setFormData] = useState({ name: '', pix: '', pass: '', access: '' });
  const [loading, setLoading] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const id = `AF-${Date.now()}-${formData.name.split(' ')[0].toUpperCase()}`;
    const ok = await requestAffiliate({
      id,
      name: formData.name,
      user: formData.pix,
      pass: formData.pass,
      accessCode: formData.access
    });

    if (ok) {
      setStep('success');
      setTimeout(() => {
        onClose();
        // Reset para o próximo uso
        setStep('contract');
        setHasAgreed(false);
        setFormData({ name: '', pix: '', pass: '', access: '' });
      }, 5000);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[3.5rem] w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Fixo */}
        <header className="p-8 border-b border-slate-100 shrink-0">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              {step === 'contract' ? 'Termos de Parceria' : step === 'form' ? 'Seja um Afiliado' : 'Solicitação Enviada'}
            </h2>
            <p className="text-[9px] text-[#1B9340] font-black uppercase tracking-[0.3em] mt-1">
              DROGA VEGA & DR VB
            </p>
          </div>
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </header>

        {/* Conteúdo com Scroll se necessário */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {step === 'contract' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed font-medium">
                <h3 className="font-black text-slate-900 mb-4 text-center border-b border-slate-200 pb-2 uppercase tracking-widest">Contrato de Adesão e Intermediação Digital</h3>
                
                <div className="space-y-4">
                  <section>
                    <p className="font-black text-slate-800 mb-1 uppercase text-[10px]">1. CLÁUSULA DE AUTONOMIA (INEXISTÊNCIA DE VÍNCULO EMPREGATÍCIO)</p>
                    <p>As partes declaram, para todos os fins de direito, a total ausência de vínculo empregatício, afastando-se os requisitos dos arts. 2º e 3º da CLT.</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li><strong>1.1. SEM SUBORDINAÇÃO:</strong> O Consultor não está sujeito a ordens, horários fixos, controle de jornada ou metas impostas pela Contratante.</li>
                      <li><strong>1.2. SEM SALÁRIO FIXO:</strong> A remuneração dar-se-á exclusivamente por êxito (comissão) sobre as vendas intermediadas e efetivamente pagas.</li>
                      <li><strong>1.3. LIVRE ATUAÇÃO:</strong> O Consultor tem liberdade para atuar com outras marcas e produtos, não havendo exclusividade.</li>
                    </ul>
                  </section>

                  <section>
                    <p className="font-black text-slate-800 mb-1 uppercase text-[10px]">2. NATUREZA DA ATIVIDADE</p>
                    <p>A atividade do Consultor restringe-se à divulgação do catálogo digital e captação de clientes (intermediação).</p>
                    <p className="mt-2 bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-100 font-bold">
                      <strong>2.1. VEDAÇÃO SANITÁRIA:</strong> É vedado ao Consultor manusear medicamentos, interpretar receitas médicas, indicar tratamentos ou realizar diagnósticos. Dúvidas técnicas devem ser encaminhadas imediatamente ao Farmacêutico Responsável.
                    </p>
                  </section>

                  <section>
                    <p className="font-black text-slate-800 mb-1 uppercase text-[10px]">3. REMUNERAÇÃO</p>
                    <p>O Consultor fará jus à comissão sobre o lucro da venda, conforme tabela vigente no painel administrativo, pagável mediante PIX conforme periodicidade acordada.</p>
                  </section>

                  <section>
                    <p className="font-black text-slate-800 mb-1 uppercase text-[10px]">4. RESCISÃO</p>
                    <p>Este contrato pode ser rescindido por qualquer das partes, a qualquer tempo, sem ônus ou indenizações, bastando o descredenciamento do código de acesso no sistema.</p>
                  </section>
                </div>
              </div>

              <label className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] font-black text-emerald-900 uppercase tracking-widest group-hover:text-emerald-700 transition-colors">Li e concordo com os termos do contrato</span>
              </label>

              <button 
                disabled={!hasAgreed}
                onClick={() => setStep('form')}
                className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Prosseguir para Cadastro
              </button>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold uppercase outline-none focus:border-emerald-500 focus:bg-white transition-all text-black" placeholder="COMO SERÁ CHAMADO NA LOJA?" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Chave PIX (WhatsApp)</label>
                <input required type="tel" value={formData.pix} onChange={e => setFormData({...formData, pix: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all text-black" placeholder="DDD + NÚMERO (PARA RECEBER COMISSÃO)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Admin</label>
                  <input required type="password" value={formData.pass} onChange={e => setFormData({...formData, pass: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all text-black" placeholder="****" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Acesso Desejado</label>
                  <input required type="text" value={formData.access} onChange={e => setFormData({...formData, access: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase outline-none focus:border-emerald-500 focus:bg-white transition-all text-black" placeholder="COD-123" />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={() => setStep('contract')}
                  className="px-6 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-200 transition-all"
                >
                  Voltar
                </button>
                <button 
                  disabled={loading} 
                  type="submit" 
                  className="flex-1 py-5 bg-[#1B9340] text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl active:scale-95 transition-all hover:bg-emerald-700 flex items-center justify-center gap-3"
                >
                  {loading ? 'Processando...' : 'Enviar Solicitação'}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-10 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase">Solicitação Enviada!</h3>
              <p className="text-sm text-slate-500 mt-4 leading-relaxed px-4">
                Sua proposta e o aceite do contrato foram registrados com sucesso. <br/>
                <strong>Dr. Luis</strong> ou <strong>Dr. Henrique</strong> entrarão em contato para liberar seu código após a auditoria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
