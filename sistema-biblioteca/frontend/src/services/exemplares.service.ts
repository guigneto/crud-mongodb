import api from './api';

export interface Exemplar {
  _id?: string;
  idProd: string;
  codExemplar?: string;
  estado?: string;
}

export const getExemplares   = ()                               => api.get<Exemplar[]>('/exemplares');
export const getExemplar     = (id: string)                     => api.get<Exemplar>(`/exemplares/${id}`);
export const createExemplar  = (data: Omit<Exemplar, '_id'>)   => api.post<Exemplar>('/exemplares', data);
export const updateExemplar  = (id: string, data: Partial<Exemplar>) => api.put<Exemplar>(`/exemplares/${id}`, data);
export const deleteExemplar  = (id: string)                     => api.delete(`/exemplares/${id}`);
