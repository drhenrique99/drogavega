
import { PIX_KEY, MERCHANT_NAME, MERCHANT_CITY } from '../constants';

/**
 * Calcula o Checksum CRC16 CCITT-FALSE
 * Algoritmo exato exigido pelo Banco Central do Brasil para o PIX.
 */
function calculateCRC16(data: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Gera o payload oficial do PIX (EMV QR Code)
 */
export const generatePixPayload = (amount: number) => {
  const formattedAmount = amount.toFixed(2);
  
  // Função para formatar os campos no padrão EMV (ID + Tamanho + Valor)
  const f = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  // 1. Informações da Conta do Recebedor (ID 26)
  // Sub-tag 00: GUI (br.gov.bcb.pix)
  // Sub-tag 01: Chave PIX (Telefone deve ter +55)
  const merchantAccount = f('00', 'br.gov.bcb.pix') + f('01', PIX_KEY);

  // 2. Construção do Payload Base
  let payload = f('00', '01'); // Payload Format Indicator
  payload += f('26', merchantAccount); // Merchant Account Information
  payload += f('52', '0000'); // Merchant Category Code
  payload += f('53', '986'); // Currency Code (BRL)
  payload += f('54', formattedAmount); // Transaction Amount
  payload += f('58', 'BR'); // Country Code
  payload += f('59', MERCHANT_NAME.substring(0, 25)); // Merchant Name
  payload += f('60', MERCHANT_CITY.substring(0, 15)); // Merchant City
  
  // 3. Campo de Dados Adicionais (ID 62)
  // TXID: Identificador da transação. '***' é para dinâmico. 
  // Para estático, usamos um identificador simples sem caracteres especiais.
  payload += f('62', f('05', 'DROGAVEGA01')); 

  // 4. Preparação para o CRC16 (Tag 63)
  payload += '6304';

  // 5. Cálculo Final do CRC
  const crc = calculateCRC16(payload);
  
  return payload + crc;
};

export const getPixQrCodeUrl = (payload: string) => {
  // Gera o QR Code com margem e alta definição para garantir a leitura por câmeras de celulares
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=12&data=${encodeURIComponent(payload)}`;
};
