
import React, { useState, useEffect } from 'react';
import { fetchStaffData } from '../services/sheetService';
import { ConsultantSession } from '../types';

interface AccessGateProps {
  onGrantAccess: (session: any) => void;
}

export const AccessGate: React.FC<AccessGateProps> = ({ onGrantAccess }) => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputValue.trim().toLowerCase();
    if (!cleanInput) return;

    setLoading(true);
    setError('');
    
    try {
      const staffList = await fetchStaffData();
      
      const matchedStaff = staffList.find(
        member => member.accessCode.trim().toLowerCase() === cleanInput
      );
      
      if (matchedStaff) {
        if (matchedStaff.status === 'PENDENTE') {
          setError('SEU CADASTRO ESTÁ EM ANÁLISE. AGUARDE A APROVAÇÃO DO DR. LUIS OU DR. HENRIQUE.');
          triggerShake();
        } else if (matchedStaff.status === 'RECUSADO') {
          setError('ACESSO NEGADO. ENTRE EM CONTATO COM O ADMINISTRADOR.');
          triggerShake();
        } else {
          onGrantAccess({
            name: matchedStaff.name,
            user: matchedStaff.accessCode,
            phone: matchedStaff.user, 
            role: matchedStaff.role
          });
        }
      } else {
        setError('CÓDIGO DE CONSULTOR NÃO ENCONTRADO. VERIFIQUE SE DIGITOU CORRETAMENTE.');
        triggerShake();
      }
    } catch (err) {
      setError('ERRO AO CONECTAR COM A PLANILHA. VERIFIQUE SUA INTERNET E TENTE NOVAMENTE.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[5000] flex items-center justify-center p-4 transition-all duration-1000 ${isVisible ? 'opacity-100 backdrop-blur-3xl' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-[#0A0A0B]/98"></div>

      <div className={`relative w-full max-w-lg bg-white rounded-[3.5rem] p-10 md:p-16 shadow-[0_0_150px_rgba(227,30,36,0.3)] border border-white/10 text-center overflow-hidden transition-transform duration-300 ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            75% { transform: translateX(-10px); }
          }
        `}</style>
        
        <div className="flex justify-center mb-10">
          <div className="w-20 h-20 relative animate-pulse">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <rect x="35" y="10" width="30" height="80" fill="#E31E24" rx="4" />
              <rect x="10" y="35" width="80" height="30" fill="#E31E24" rx="4" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Acesso Exclusivo</h2>
        <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] mb-12">Droga Vega - Sistema de Consultoria</p>

        <form onSubmit={handleValidation} className="space-y-8">
          <div className="relative">
            <input 
              type="text" 
              required
              autoFocus
              autoComplete="off"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-8 py-7 bg-slate-50 border-2 border-slate-100 rounded-3xl text-slate-900 text-3xl font-black uppercase outline-none focus:ring-8 focus:ring-rose-600/5 focus:border-[#E31E24] transition-all text-center tracking-[0.1em] placeholder:text-slate-200"
              placeholder="CÓDIGO"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-3xl animate-in fade-in slide-in-from-top-2">
              <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !inputValue}
            className="w-full py-7 bg-[#1B9340] text-white rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-4 active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Validando...</span>
              </>
            ) : (
              <span>Entrar na Loja</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
