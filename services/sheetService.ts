
import { Product, StaffMember, Order } from '../types';
import { TABS, SHEET_ID, IMMUTABLE_ADMINS } from '../constants';

const cleanValue = (val: string | undefined) => {
  if (!val) return '';
  return val.replace(/^"|"$/g, '').replace(/\r/g, '').trim();
};

const parseCSVLine = (line: string): string[] => {
  if (!line) return [];
  const semiCount = (line.match(/;/g) || []).length;
  const commaCount = (line.match(/,/g) || []).length;
  const delimiter = semiCount >= commaCount ? ';' : ',';
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else current += char;
  }
  result.push(current);
  return result.map(v => cleanValue(v));
};

const parsePrice = (raw: string): number => {
  if (!raw) return 0;
  let clean = raw.replace(/R\$\s?/g, '').replace(/[^\d.,-]/g, '').trim();
  if (!clean) return 0;
  const lastComma = clean.lastIndexOf(',');
  const lastDot = clean.lastIndexOf('.');
  if (lastComma > lastDot) clean = clean.replace(/\./g, '').replace(',', '.');
  else if (lastComma !== -1 && lastDot === -1) clean = clean.replace(',', '.');
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
};

export const fetchStaffData = async (): Promise<StaffMember[]> => {
  try {
    const cacheBuster = `&cb=${Date.now()}`;
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Equipe${cacheBuster}`;
    const response = await fetch(url);
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter(l => l.trim() !== '');
    const staff: StaffMember[] = [];
    for (let i = 1; i < lines.length; i++) {
      const col = parseCSVLine(lines[i]);
      if (col.length < 5) continue;
      
      const userVal = col[2]; 
      const statusVal = col[5] ? col[5].toUpperCase() : 'ATIVO'; 
      const payStatusVal = col[6] ? col[6].toUpperCase() : 'PENDENTE'; 
      
      const sanitizedUserPhone = userVal.replace(/\D/g, '');
      const isImmutable = IMMUTABLE_ADMINS.some(adm => sanitizedUserPhone.includes(adm) || adm.includes(sanitizedUserPhone));
      
      staff.push({
        id: col[0], 
        name: col[1], 
        user: userVal,
        pass: col[3],
        accessCode: col[4],
        role: isImmutable ? 'ADM' : 'CONSULTOR',
        status: statusVal as any,
        paymentStatus: payStatusVal as any
      });
    }
    console.log(`[Equipe] Carregados ${staff.length} membros.`);
    return staff;
  } catch (error) {
    console.error("Erro ao carregar equipe:", error);
    return []; 
  }
};

export const fetchOrdersData = async (): Promise<Order[]> => {
  try {
    const cacheBuster = `&cb=${Date.now()}`;
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=pedidos${cacheBuster}`;
    const response = await fetch(url);
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) return [];

    const orders: Order[] = [];
    for (let i = 1; i < lines.length; i++) {
      const col = parseCSVLine(lines[i]);
      // Flexibilidade: aceitar linhas com menos colunas se o consultor e valor estiverem presentes
      if (col.length < 3) continue; 
      
      orders.push({
        date: col[0] || '',          
        consultant: col[1] || '',    
        product: col[2] || '',       
        quantity: parseInt(col[3]) || 0,
        unitValue: parsePrice(col[4]),
        totalValue: parsePrice(col[6]), 
        unitCost: parsePrice(col[7]),   
        totalCost: parsePrice(col[10]), 
        code: col[8] || ''           
      });
    }
    console.log(`[Pedidos] Carregados ${orders.length} registros.`);
    return orders;
  } catch (err) {
    console.error("Erro ao carregar pedidos:", err);
    return [];
  }
};

const fetchTabContent = async (sheetName: string): Promise<Product[]> => {
  const systemTabs = ['pedidos', 'Equipe', 'RESUMO', 'DASHBOARD', 'historico de pagamentos'];
  if (systemTabs.includes(sheetName)) return [];

  try {
    const cacheBuster = `&cb=${Date.now()}`;
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}${cacheBuster}`;
    const response = await fetch(url);
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) return [];

    const products: Product[] = [];
    for (let i = 1; i < lines.length; i++) {
      const col = parseCSVLine(lines[i]);
      if (col.length < 11) continue;
      const desc = col[2];
      const pmc = parsePrice(col[6]);
      if (!desc || pmc <= 0) continue;

      products.push({
        id: `${sheetName}-${col[0]}-${i}`,
        code: col[0] || 'S/C',
        name: desc.split(' ')[0], 
        description: desc,
        category: sheetName,
        price: pmc,
        costPrice: parsePrice(col[10]),
        manufacturer: col[1] || 'DROGA VEGA',
        image: '',
        requiresPrescription: ['ÉTICOS', 'GENERICO', 'TERMOLABEIS'].includes(sheetName.toUpperCase())
      });
    }
    return products;
  } catch (err) {
    return [];
  }
};

export const fetchSpreadsheetData = async (): Promise<Product[]> => {
  const results = await Promise.all(TABS.map(tab => fetchTabContent(tab)));
  return results.flat().filter(p => !!p && p.price > 0);
};
