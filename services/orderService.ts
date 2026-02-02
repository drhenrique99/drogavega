
import { CartItem, CustomerInfo, StaffMember } from '../types';
import { ORDERS_WEBHOOK_URL } from '../constants';

const postToWebhook = async (payload: any) => {
  if (!ORDERS_WEBHOOK_URL) {
    console.error("❌ Erro: URL do Webhook não configurada.");
    return false;
  }

  try {
    console.log(`📤 Webhook Action: ${payload._action} | Target: ${payload.sheetName || 'N/A'}`);
    
    // Google Apps Script exige no-cors para evitar erros de redirecionamento em posts diretos do browser
    await fetch(ORDERS_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar para planilha:", error);
    return false;
  }
};

export const recordOrderInSheet = async (items: CartItem[], consultantName: string, customer: CustomerInfo) => {
  const timestamp = new Date().toLocaleString('pt-BR');
  const orders = items.map(item => ({
    data: timestamp,           
    consultor: consultantName.trim(), 
    produto: item.description, 
    quantity: item.quantity, 
    valorUnitario: item.price, 
    valorTotalManual: "",      
    valorPMC: Number((item.price * item.quantity).toFixed(2)), 
    custoUnitario: item.costPrice || 0,    
    codigo: item.code,         
    clienteInfo: customer.name, 
    valorCustoTotal: Number(((item.costPrice || 0) * item.quantity).toFixed(2)), 
    clienteWhatsapp: customer.whatsapp 
  }));

  return await postToWebhook({ 
    sheetName: 'pedidos', 
    rows: orders, 
    _action: 'ADD_ORDERS' 
  });
};

/**
 * Liquidação: Comando para o backend apagar fisicamente as linhas do consultor.
 * Inclui redundância de campos para garantir que o script encontre o nome correto.
 */
export const settleConsultantPayment = async (staffId: string, consultantName: string) => {
  return await postToWebhook({
    _action: 'DELETE_ORDERS',
    sheetName: 'pedidos',
    staffId: staffId,
    consultantName: consultantName.trim(),
    consultor: consultantName.trim(), // Redundância para compatibilidade
    timestamp: new Date().toISOString()
  });
};

export const requestAffiliate = async (data: Partial<StaffMember>) => {
  return await postToWebhook({
    sheetName: 'Equipe',
    _action: 'ADD_STAFF',
    rows: [{
      id: data.id,
      nome: data.name,
      chavePix: data.user,
      senha: data.pass,
      acesso: data.accessCode,
      status: 'PENDENTE'
    }]
  });
};

export const updateStaffStatus = async (staffId: string, newStatus: 'ATIVO' | 'RECUSADO') => {
  return await postToWebhook({
    sheetName: 'Equipe',
    rows: [{ id: staffId, status: newStatus, _action: 'UPDATE_STATUS' }]
  });
};
