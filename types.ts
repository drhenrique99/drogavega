
export interface LegalInfo {
  razaoSocial: string;
  cnpj: string;
  afeAnvisa: string;
  licencaSanitaria: string;
  endereco: string;
  horarioFuncionamento: string;
  farmaceuticoResponsavel: string;
  crf: string;
  linkCrf: string;
  telefoneTecnico: string;
}

export interface Product {
  id: string;
  code: string; 
  name: string; 
  description: string; 
  price: number; // Coluna G (Venda)
  costPrice: number; // Coluna K (Custo)
  category: string; 
  image: string;
  requiresPrescription: boolean;
  manufacturer: string; 
}

export interface Order {
  date: string;
  consultant: string;
  product: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  unitCost: number; // Custo Unitário na hora da venda
  totalCost: number; // Custo Total na hora da venda
  code: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  address: string;
  whatsapp: string;
}

export type StaffRole = 'ADM' | 'CONSULTOR';

export interface StaffMember {
  id: string;
  name: string;
  user: string; 
  pass: string; 
  accessCode: string; 
  role: StaffRole;
  status?: 'PENDENTE' | 'ATIVO' | 'RECUSADO'; 
  paymentStatus?: 'PAGO' | 'PENDENTE'; 
}

export interface DashboardMetrics {
  cac: number;
  ltv: number;
  totalRevenue: number;
  affiliateRanking: { name: string; sales: number }[];
}

export interface ConsultantSession {
  name: string;
  user: string;
  role: StaffRole;
}
