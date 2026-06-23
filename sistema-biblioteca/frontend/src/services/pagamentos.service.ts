import api from './api';

export type FormaPagto = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'picpay' | 'pix';

export interface Pagamento {
  _id?: string;
  idMult?: string;
  idExemplar?: string;
  idAssoc?: string;
  valPagto: number;
  dscFormPagto: FormaPagto;
  valDescPagto: number;
}

export const getPagamentos   = ()                                 => api.get<Pagamento[]>('/pagamentos');
export const getPagamento    = (id: string)                       => api.get<Pagamento>(`/pagamentos/${id}`);
export const createPagamento = (data: Omit<Pagamento, '_id'>)    => api.post<Pagamento>('/pagamentos', data);
export const updatePagamento = (id: string, data: Partial<Pagamento>) => api.put<Pagamento>(`/pagamentos/${id}`, data);
export const deletePagamento = (id: string)                       => api.delete(`/pagamentos/${id}`);
