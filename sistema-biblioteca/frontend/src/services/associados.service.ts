import api from './api';

export interface Endereco {
  numCEPEnder?: string;
  dscNomeLogradouroEnder: string;
  numNumeroEnder: number | '';
  dscComplementoEnder?: string;
  dscBairroEnder: string;
  dscCidadeEnder: string;
  dscUFEnder: string;
}

export interface Associado {
  _id?: string;
  codAssoc?: string;
  nomAssoc: string;
  email?: string;
  telefone?: string;
  indSexoAssoc: 'M' | 'F';
  endereco: Endereco;
  dscTipoAssoc: 'comum' | 'vip';
  createdAt?: string;
}

export const getAssociados  = ()                              => api.get<Associado[]>('/associados');
export const getAssociado   = (id: string)                    => api.get<Associado>(`/associados/${id}`);
export const createAssociado = (data: Omit<Associado, '_id'>) => api.post<Associado>('/associados', data);
export const updateAssociado = (id: string, data: Partial<Associado>) => api.put<Associado>(`/associados/${id}`, data);
export const deleteAssociado = (id: string)                   => api.delete(`/associados/${id}`);
