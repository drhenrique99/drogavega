
import React, { useState } from 'react';
import { LegalInfo } from '../types';

interface LegalFooterProps {
  info: LegalInfo;
  onOpenAffiliate?: () => void;
}

interface DocModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DocModal: React.FC<DocModalProps> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-10 overflow-y-auto text-slate-600 text-sm leading-relaxed custom-scrollbar">
          {children}
        </div>
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase">Droga Vega - Departamento Jurídico</p>
        </div>
      </div>
    </div>
  );
};

export const LegalFooter: React.FC<LegalFooterProps> = ({ info, onOpenAffiliate }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (id: string) => setActiveModal(id);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="relative mt-20">
      <footer className="bg-[#0a0f1d] text-white pt-20 pb-10 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            
            {/* COLUNA 1: IDENTIDADE */}
            <div className="space-y-6">
              <h2 className="text-xl font-black italic tracking-tighter uppercase">DROGARIA VEGA LTDA</h2>
              <div className="space-y-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                <p>CNPJ: <span className="text-slate-200">{info.cnpj}</span></p>
                <p>AFE (ANVISA): <span className="text-slate-200">{info.afeAnvisa}</span></p>
                <p>LICENÇA (CMVS): <span className="text-slate-200">{info.licencaSanitaria}</span></p>
              </div>
            </div>

            {/* COLUNA 2: RESPONSÁVEL TÉCNICO */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" /></svg>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#2563eb]">Responsável Técnico</h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black uppercase">DR. VAGNER B.</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">CRF-SP 00.000</p>
              </div>
              <button className="mt-4 flex items-center gap-3 px-6 py-3 bg-[#2563eb] hover:bg-blue-700 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeWidth="2" /></svg>
                Falar com Farmacêutico
              </button>
            </div>

            {/* COLUNA 3: ENDEREÇO E HORÁRIO */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" /></svg>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#2563eb]">Endereço Físico</h3>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                  {info.endereco}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" /></svg>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#2563eb]">Horário de Atendimento</h3>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                  {info.horarioFuncionamento}
                </p>
              </div>
            </div>

            {/* COLUNA 4: COMPLIANCE & LEGAL */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" /></svg>
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500">Compliance & Legal</h3>
              </div>
              <ul className="space-y-4">
                <li>
                  <button onClick={() => openModal('termos')} className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors group tracking-[0.1em]">
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" /></svg>
                    Termos de Uso (RDC 44/09)
                  </button>
                </li>
                <li>
                  <button onClick={onOpenAffiliate} className="flex items-center gap-3 text-[10px] font-black uppercase text-[#2563eb] hover:brightness-125 transition-colors group tracking-[0.1em] text-left">
                    <svg className="w-4 h-4 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" /></svg>
                    Contrato de Consultor (Intermediação)
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('lgpd')} className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors group tracking-[0.1em]">
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2" /></svg>
                    Dados Sensíveis & LGPD
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('logistica')} className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors group tracking-[0.1em]">
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" /><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-4 0a1 1 0 001-1m-1 1H9" strokeWidth="2" /></svg>
                    Logística Sanitária
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
              © 2026 DROGARIA VEGA LTDA. TODOS OS DIREITOS RESERVADOS.
            </p>
            <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                SNGPC ATIVO
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></div>
                VENDA SOB PRESCRIÇÃO MÉDICA
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAIS DE DOCUMENTAÇÃO */}
      <DocModal title="Termos de Uso (RDC 44/09)" isOpen={activeModal === 'termos'} onClose={closeModal}>
        <p>Aguardando conteúdo jurídico para Termos de Uso conforme normas da ANVISA...</p>
      </DocModal>
      
      <DocModal title="Proteção de Dados Sensíveis & LGPD" isOpen={activeModal === 'lgpd'} onClose={closeModal}>
        <div className="space-y-8">
          <section>
            <h4 className="font-black text-slate-900 uppercase text-xs mb-3 border-l-4 border-emerald-500 pl-3">1. COLETA DE DADOS PESSOAIS</h4>
            <p>Para o processamento de pedidos e cumprimento de normas sanitárias, coletamos dados de identificação (Nome), contato (WhatsApp) e logística (Endereço). Estes dados são essenciais para a emissão de nota fiscal e rastreabilidade sanitária.</p>
          </section>

          <section className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <h4 className="font-black text-emerald-900 uppercase text-xs mb-3">2. TRATAMENTO DE DADOS SENSÍVEIS (SAÚDE)</h4>
            <p className="text-emerald-800">Medicamentos que exigem receita médica envolvem o tratamento de <strong>dados sensíveis</strong> (histórico de saúde). A Droga Vega garante que o acesso a receitas e prontuários é restrito exclusivamente ao Farmacêutico Responsável e autoridades sanitárias, sob sigilo profissional rigoroso.</p>
          </section>

          <section>
            <h4 className="font-black text-slate-900 uppercase text-xs mb-3 border-l-4 border-emerald-500 pl-3">3. COMPARTILHAMENTO E SEGURANÇA</h4>
            <p>Seus dados não são vendidos ou compartilhados with fins de marketing de terceiros. O compartilhamento ocorre apenas para: (a) Autoridades Sanitárias (ANVISA/CMVS) via SNGPC; (b) Processamento de pagamentos seguro; (c) Operadores logísticos restritos à entrega.</p>
          </section>

          <section>
            <h4 className="font-black text-slate-900 uppercase text-xs mb-3 border-l-4 border-emerald-500 pl-3">4. SEUS DIREITOS</h4>
            <p>Conforme a Lei 13.709/18, você pode solicitar a qualquer momento a confirmação da existência de tratamento, o acesso aos seus dados, ou a correção de dados incompletos. Devido a normas da ANVISA, dados referentes a receitas de medicamentos controlados devem ser mantidos por períodos específicos (ex: 2 a 5 anos) antes da exclusão definitiva.</p>
          </section>
        </div>
      </DocModal>

      <DocModal title="Logística Sanitária" isOpen={activeModal === 'logistica'} onClose={closeModal}>
        <div className="space-y-6">
          <section>
            <h4 className="font-black text-slate-900 uppercase text-xs mb-3">1. ÁREA DE COBERTURA</h4>
            <p>As entregas estão restritas ao raio de atuação permitido pela Licença Sanitária Municipal vigente. Não realizamos envios interestaduais de medicamentos controlados.</p>
          </section>
          
          <section>
            <h4 className="font-black text-slate-900 uppercase text-xs mb-3">2. INTEGRIDADE E TEMPERATURA</h4>
            <p>O transporte de medicamentos (especialmente termolábeis) segue as Boas Práticas de Transporte (RDC 430/2020), garantindo monitoramento de temperatura e integridade da embalagem até o destinatário final.</p>
          </section>

          <section>
            <h4 className="font-black text-slate-900 uppercase text-xs mb-3">3. RECEBIMENTO</h4>
            <p>Medicamentos só serão entregues a maiores de 18 anos, mediante conferência documental e, quando aplicável, entrega da receita médica original ao portador.</p>
          </section>
        </div>
      </DocModal>
    </div>
  );
};
