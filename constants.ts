
import { LegalInfo, Product } from './types';

export const PIX_KEY = '+5511991818307';
export const CONTACT_WHATSAPP = '5511991818307';
export const MERCHANT_NAME = 'DROGA VEGA';
export const MERCHANT_CITY = 'SAO PAULO';

export const SHEET_ID = '1igPVcP1Z7vgfy-prO-VC8meBOx7NKv3eynnDYxXaYww';

/**
 * Telefones dos Administradores Mestres.
 */
export const IMMUTABLE_ADMINS = ['11989854661', '11990123519'];

/** 
 * URL do Web App atualizada (última versão fornecida pelo usuário).
 * Esta URL aponta para o backend Google Apps Script que gerencia pedidos e equipe.
 */
export const ORDERS_WEBHOOK_URL = `https://script.google.com/macros/s/AKfycbw7em5Nym5ob31-DVQte5dgGEyocAw4H8M2HQTDie2wxnaJPvjxNJuO6eSbKLgb0g0Qdg/exec`;

export const MP_ACCESS_TOKEN = 'APP_USR-6316270570887163-122915-2f96e8108507c8005391d1e679a6134a-101150381';

export const TABS = [
  'ÉTICOS', 
  'GENERICO', 
  'DERMOCOSMETICO',
  'PERFUMARIA',
  'COSMETICOS',
  'MED ISENTOS',
  'FORMULAS',
  'OTC',
  'TERMOLABEIS'
];

export const CATEGORY_COLORS: Record<string, string> = {
  'ÉTICOS': '#be123c',
  'GENERICO': '#ca8a04',
  'DERMOCOSMETICO': '#0891b2',
  'PERFUMARIA': '#7e22ce',
  'COSMETICOS': '#db2777',
  'MED ISENTOS': '#059669',
  'FORMULAS': '#d97706',
  'OTC': '#4338ca',
  'TERMOLABEIS': '#0284c7',
  'OUTROS': '#4b5563'
};

export const DEFAULT_LEGAL_INFO: LegalInfo = {
  razaoSocial: "Farmácia Droga Vega Ltda",
  cnpj: "53.798.062/0001-57",
  afeAnvisa: "7.96835.7",
  licencaSanitaria: "25351.110786/2023-18",
  endereco: "Rua do Outono, 421 - Brasilandia - São Paulo/SP",
  horarioFuncionamento: "Segunda a Sexta, das 10:00 às 18:00",
  farmaceuticoResponsavel: "Dr. Roberto Silva",
  crf: "SP-123456",
  linkCrf: "https://crf-sp.org.br/consulta",
  telefoneTecnico: "(11) 98888-7777"
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    code: '10234',
    name: 'Dipirona Sódica 500mg',
    description: 'Dipirona Sódica 500mg - 10 Comprimidos',
    price: 12.50,
    costPrice: 6.25,
    category: 'GENERICO',
    image: '',
    requiresPrescription: false,
    manufacturer: 'Medley'
  }
];
