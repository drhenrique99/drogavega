
import { Product, CartItem, DashboardMetrics, ConsultantSession } from './types';
import { DEFAULT_LEGAL_INFO, CATEGORY_COLORS, MOCK_PRODUCTS, IMMUTABLE_ADMINS } from './constants';
import { LegalFooter } from './components/LegalFooter';
import { SideCart } from './components/SideCart';
import { Dashboard } from './components/Dashboard';
import { AccessGate } from './components/AccessGate';
import { AffiliateModal } from './components/AffiliateModal';
import { CartDisclaimer } from './components/CartDisclaimer';
import { fetchSpreadsheetData, fetchStaffData } from './services/sheetService';
import React, { useState, useEffect, useMemo, useRef } from 'react';

type View = 'store' | 'admin';

const ITEMS_PER_PAGE = 30;

const BrandLogo: React.FC<{ size?: 'sm' | 'md' | 'lg', isDark?: boolean }> = ({ size = 'md', isDark = false }) => {
  const dimensions = {
    sm: { w: 'w-8', h: 'h-8', text: 'text-lg' },
    md: { w: 'w-10', h: 'h-10', text: 'text-xl' },
    lg: { w: 'w-16', h: 'h-16', text: 'text-3xl' }
  }[size];

  return (
    <div className="flex items-center">
      <div className={`${dimensions.w} ${dimensions.h} relative flex-shrink-0`}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <rect x="35" y="10" width="30" height="80" fill="#E31E24" rx="4" />
          <rect x="10" y="35" width="80" height="30" fill="#E31E24" rx="4" />
        </svg>
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-md">
          <path d="M30,70 Q45,35 75,30 Q65,65 30,70 Z" fill="#1B9340" stroke="white" strokeWidth="2" />
          <path d="M30,70 Q50,45 75,30" fill="none" stroke="white" strokeLinecap="round" />
        </svg>
      </div>
      <div className="ml-3">
        <h1 className={`${dimensions.text} font-black ${isDark ? 'text-white' : 'text-slate-900'} leading-none tracking-tighter uppercase transition-colors duration-500`}>
          DROGA <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>VEGA</span>
        </h1>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<View>('store');
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [cartPulse, setCartPulse] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  
  const [consultant, setConsultant] = useState<ConsultantSession | null>(null);
  const [isAccessLocked, setIsAccessLocked] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const cartButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('drogavega_session');
    if (saved) {
      const parsedSession = JSON.parse(saved);
      setConsultant(parsedSession);
      setIsAccessLocked(false);
      
      if (parsedSession.role === 'ADM') {
        setIsAuthenticated(true);
        setLoginUser(parsedSession.phone || ''); 
      }
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchSpreadsheetData();
        setProducts(data);
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesSearch = lowerQuery === '' || 
        p.code.toLowerCase().includes(lowerQuery) || 
        p.description.toLowerCase().includes(lowerQuery);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const displayedProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);
  const categories = useMemo(() => ['Todos', ...new Set(products.map(p => p.category))], [products]);

  const handleOpenCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const accepted = sessionStorage.getItem('drogavega_disclaimer_accepted');
    if (accepted === 'true') {
      setIsCartOpen(true);
    } else {
      setIsDisclaimerOpen(true);
    }
  };

  const handleAcceptDisclaimer = () => {
    sessionStorage.setItem('drogavega_disclaimer_accepted', 'true');
    setIsDisclaimerOpen(false);
    setIsCartOpen(true);
  };

  const addToCart = (product: Product, event: React.MouseEvent) => {
    event.stopPropagation();
    const btn = event.currentTarget as HTMLButtonElement;
    const rect = btn.getBoundingClientRect();
    const cartBtn = cartButtonRef.current?.getBoundingClientRect();

    if (cartBtn) {
      const particle = document.createElement('div');
      particle.className = 'flying-particle';
      particle.style.left = `${rect.left + rect.width / 2}px`;
      particle.style.top = `${rect.top + rect.height / 2}px`;
      
      const targetX = cartBtn.left + cartBtn.width / 2 - (rect.left + rect.width / 2);
      const targetY = cartBtn.top + cartBtn.height / 2 - (rect.top + rect.height / 2);
      
      particle.style.setProperty('--target-x', `${targetX}px`);
      particle.style.setProperty('--target-y', `${targetY}px`);
      
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    
    setCartPulse(true);
    setLastAddedId(product.id);
    setTimeout(() => {
      setCartPulse(false);
      setLastAddedId(null);
    }, 1500);
  };

  const handleOrderComplete = () => {
    setCart([]);
    setSelectedCategory('Todos');
    setSearchQuery('');
    setCurrentView('store');
  };

  const handleConsultantAccess = (session: any) => {
    setConsultant(session);
    setIsAccessLocked(false);
    if (session.role === 'ADM') {
      setIsAuthenticated(true);
      setLoginUser(session.phone || '');
    }
    localStorage.setItem('drogavega_session', JSON.stringify(session));
  };

  const resetAccess = () => {
    localStorage.removeItem('drogavega_session');
    sessionStorage.removeItem('drogavega_disclaimer_accepted');
    setConsultant(null);
    setIsAccessLocked(true);
    setIsAuthenticated(false);
    setLoginUser('');
    setCurrentView('store');
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const staff = await fetchStaffData();
      const found = staff.find(s => 
        s.user.trim() === loginUser.trim() && 
        s.pass.trim().toLowerCase() === loginPass.trim().toLowerCase()
      );
      if (found) {
        if (found.status === 'PENDENTE') {
          setLoginError('Sua conta ainda está em análise.');
        } else if (found.status === 'RECUSADO') {
          setLoginError('Seu acesso foi recusado pela administração.');
        } else {
          setIsAuthenticated(true);
        }
      } else {
        setLoginError('Credenciais Admin Inválidas.');
      }
    } catch (err) {
      setLoginError('Erro de servidor.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isAdminView = currentView === 'admin';

  if (isAccessLocked) {
    return <AccessGate onGrantAccess={handleConsultantAccess} />;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 ${isAdminView ? 'bg-[#020617] text-white' : 'bg-[#befeae] text-slate-900'}`}>
      <header className={`backdrop-blur-xl sticky top-0 z-[100] border-b shadow-md transition-all duration-500 ${isAdminView ? 'bg-slate-900/80 border-white/10' : 'bg-white/70 border-black/5'}`}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center group cursor-pointer" onClick={() => setCurrentView('store')}>
              <BrandLogo size="md" isDark={isAdminView} />
              <div className="ml-2 hidden lg:block">
                <p className={`text-[8px] font-black ${isAdminView ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-widest mt-1`}>
                  Atendimento: <span className="text-emerald-600">{consultant?.name}</span>
                  {consultant?.role === 'ADM' && <span className="ml-2 text-rose-600 font-black">[ADM]</span>}
                </p>
              </div>
            </div>
            {/* Menu Desktop */}
            <nav className={`hidden md:flex space-x-1 p-1 rounded-2xl border items-center transition-colors ${isAdminView ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
              <button onClick={() => setCurrentView('store')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 ${currentView === 'store' ? 'bg-white text-black shadow-sm' : (isAdminView ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black')}`}>Loja</button>
              <button onClick={() => setIsAffiliateModalOpen(true)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 ${isAdminView ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-emerald-600 hover:bg-emerald-600/10'}`}>Seja um Afiliado</button>
              <button onClick={() => setCurrentView('admin')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 ${currentView === 'admin' ? 'bg-white text-black shadow-sm' : (isAdminView ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black')}`}>Admin</button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-5">
            <button onClick={resetAccess} className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border transition-all active:scale-90 ${isAdminView ? 'text-slate-300 border-white/10 hover:bg-white/10' : 'text-slate-500 border-black/10 hover:text-slate-900'}`}>Sair</button>
            <button 
              ref={cartButtonRef}
              onClick={handleOpenCart} 
              className={`relative p-3 rounded-2xl transition-all active:scale-90 shadow-sm ${isAdminView ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-black/10 hover:bg-slate-50'} ${cartPulse ? 'animate-cart-bump shadow-[0_0_20px_rgba(27,147,64,0.4)]' : ''}`}
            >
              <svg className={`w-6 h-6 ${isAdminView ? 'text-white' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeWidth="2.5"/></svg>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#E31E24] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-in zoom-in">{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Navegação Mobile FIXA E VISÍVEL */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[500] bg-white/90 backdrop-blur-2xl border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-4 py-3 pb-8">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => setCurrentView('store')} 
            className={`flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl transition-all ${currentView === 'store' ? 'text-emerald-600 font-black' : 'text-slate-400'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="2.5"/></svg>
            <span className="text-[9px] uppercase tracking-tighter">Início</span>
          </button>

          <button 
            onClick={() => setIsAffiliateModalOpen(true)} 
            className="flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl text-slate-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2.5"/></svg>
            <span className="text-[9px] uppercase tracking-tighter">Afiliado</span>
          </button>

          <button 
            onClick={() => setCurrentView('admin')} 
            className={`flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl transition-all ${currentView === 'admin' ? 'text-rose-600 font-black' : 'text-slate-400'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2.5"/></svg>
            <span className="text-[9px] uppercase tracking-tighter">Admin</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 pb-40">
        {currentView === 'admin' ? (
          isAuthenticated ? (
            <Dashboard 
              metrics={{cac: 0, ltv: 0, totalRevenue: 0, affiliateRanking: []}} 
              products={products} 
              currentUserPhone={loginUser}
            />
          ) : (
            <div className="max-w-md mx-auto mt-10 md:mt-20 p-8 md:p-12 bg-slate-900 rounded-[3rem] shadow-2xl border border-white/10">
              <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                   <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2.5" /></svg>
                   </div>
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Acesso Admin</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase mt-2">Droga Vega - Gestão Estratégica</p>
              </div>
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <input type="text" placeholder="Usuário (Telefone)" value={loginUser} onChange={e => setLoginUser(e.target.value)} className="w-full p-4 bg-white/5 rounded-2xl text-white font-bold outline-none border border-white/10 focus:border-white/30" />
                <input type="password" placeholder="Senha" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="w-full p-4 bg-white/5 rounded-2xl text-white font-bold outline-none border border-white/10 focus:border-white/30" />
                {loginError && <p className="text-rose-600 text-[10px] font-black uppercase text-center">{loginError}</p>}
                <button type="submit" className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-rose-900/20">{isLoggingIn ? 'Acessando...' : 'Entrar'}</button>
              </form>
            </div>
          )
        ) : (
          <div className="space-y-10">
            <div className="max-w-3xl mx-auto relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Pesquisar por nome ou código..." className="w-full pl-14 pr-6 py-5 bg-white border border-black/5 rounded-[2rem] text-slate-900 shadow-xl shadow-green-900/5 focus:ring-4 focus:ring-[#1B9340]/20 outline-none" />
              <svg className="absolute left-5 top-5 h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5"/></svg>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => { setSelectedCategory(cat); setVisibleCount(ITEMS_PER_PAGE); }} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase border transition-all active:scale-95 ${selectedCategory === cat ? 'bg-white text-black shadow-lg border-transparent' : 'bg-white/40 text-slate-600 border-black/5 hover:bg-white/60 hover:text-black'}`}>{cat}</button>
              ))}
            </div>

            {loading ? (
              <div className="py-40 text-center">
                 <div className="w-12 h-12 border-4 border-[#1B9340]/20 border-t-[#1B9340] rounded-full animate-spin mx-auto mb-6"></div>
                 <p className="text-slate-600 font-black uppercase text-xs tracking-widest">Carregando Estoque...</p>
              </div>
            ) : (
              <>
                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {displayedProducts.map(p => (
                    <div key={p.id} className="bg-white rounded-[2.5rem] p-6 flex flex-col group hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all border border-slate-100 relative h-full">
                      <div className="flex justify-between items-start mb-4 shrink-0">
                        <span className="bg-slate-50 px-3 py-1.5 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-tighter border border-slate-100">Cód: {p.code}</span>
                        {p.requiresPrescription && (
                          <span className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-rose-100">Receita</span>
                        )}
                      </div>
                      <div className="flex-grow flex flex-col mb-4">
                        <p className="text-[10px] font-black text-[#1B9340] uppercase tracking-widest mb-1.5 shrink-0">{p.manufacturer || 'N/D'}</p>
                        <h3 className="text-[14px] font-black text-slate-800 uppercase leading-tight break-words">{p.description}</h3>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-50">
                        <div className="flex items-baseline gap-1 mb-5">
                          <span className="text-[11px] font-black text-slate-400 uppercase">R$</span>
                          <p className="text-3xl font-black text-slate-900 tracking-tighter">{p.price.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={(e) => addToCart(p, e)} 
                          className={`w-full py-5 text-white text-[11px] font-black uppercase rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 border-b-4 ${lastAddedId === p.id ? 'bg-emerald-600 border-emerald-800' : 'bg-gradient-to-r from-[#1B9340] to-[#0F5B26] border-[#083816] shadow-emerald-900/10'}`}
                        >
                          {lastAddedId === p.id ? (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              <span>Adicionado!</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                              <span>Adicionar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </section>

                {filteredProducts.length > visibleCount && (
                  <div className="mt-12 flex justify-center">
                    <button 
                      onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                      className="px-10 py-5 bg-white border-2 border-emerald-600 text-emerald-600 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-emerald-600 hover:text-white active:scale-95 transition-all flex items-center gap-4 group"
                    >
                      <span>Carregar Mais Itens</span>
                      <svg className="w-4 h-4 transform group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <SideCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={id => setCart(prev => prev.filter(i => i.id !== id))} 
        onUpdateQuantity={(id, d) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} 
        consultantName={consultant?.name || 'Geral'} 
        consultantPhone={consultant?.phone || ''}
        onOrderComplete={handleOrderComplete} 
      />
      <AffiliateModal isOpen={isAffiliateModalOpen} onClose={() => setIsAffiliateModalOpen(false)} />
      <CartDisclaimer isOpen={isDisclaimerOpen} onAccept={handleAcceptDisclaimer} onClose={() => setIsDisclaimerOpen(false)} />
      <LegalFooter 
        info={DEFAULT_LEGAL_INFO} 
        onOpenAffiliate={() => setIsAffiliateModalOpen(true)}
      />
    </div>
  );
};

export default App;
