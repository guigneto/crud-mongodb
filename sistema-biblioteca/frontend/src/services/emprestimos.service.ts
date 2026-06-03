import api from './api';

export interface Emprestimo {
  _id?: string;
  idAssoc: string;
  idExemplar: string;
  datRetEmpr: string;
  datPrevEntrEmpr: string;
  datEfetEntrEmpr?: string | null;
}

export const getEmprestimos   = ()                                => api.get<Emprestimo[]>('/emprestimos');
export const getEmprestimo    = (id: string)                      => api.get<Emprestimo>(`/emprestimos/${id}`);
export const createEmprestimo = (data: Omit<Emprestimo, '_id'>)  => api.post<Emprestimo>('/emprestimos', data);
export const updateEmprestimo = (id: string, data: Partial<Emprestimo>) => api.put<Emprestimo>(`/emprestimos/${id}`, data);
export const deleteEmprestimo = (id: string)                      => api.delete(`/emprestimos/${id}`);
