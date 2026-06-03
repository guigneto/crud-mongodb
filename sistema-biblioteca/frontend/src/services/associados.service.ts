import api from './api';

export interface Associado {
  _id?: string;
  nomAssoc: string;
  indSexoAssoc: 'M' | 'F';
  dscEnderecoAssoc: string;
  dscTipoAssoc: 'comum' | 'vip';
}

export const getAssociados  = ()                              => api.get<Associado[]>('/associados');
export const getAssociado   = (id: string)                    => api.get<Associado>(`/associados/${id}`);
export const createAssociado = (data: Omit<Associado, '_id'>) => api.post<Associado>('/associados', data);
export const updateAssociado = (id: string, data: Partial<Associado>) => api.put<Associado>(`/associados/${id}`, data);
export const deleteAssociado = (id: string)                   => api.delete(`/associados/${id}`);
