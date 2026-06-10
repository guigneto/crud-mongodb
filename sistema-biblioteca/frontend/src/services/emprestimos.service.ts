import api from './api';

export interface Emprestimo {
  _id?: string;
  codEmpr?: string;
  idAssoc: string;
  idExemplar: string;
  datRetEmpr: string;
  datPrevEntrEmpr: string;
  datEfetEntrEmpr?: string | null;
  status?: string;
  renovacoes?: number;
  motivoCancelamento?: string | null;
  estadoDevolucao?: string | null;
}

export const getEmprestimos   = ()                                => api.get<Emprestimo[]>('/emprestimos');
export const getEmprestimo    = (id: string)                      => api.get<Emprestimo>(`/emprestimos/${id}`);
export const createEmprestimo = (data: Omit<Emprestimo, '_id'>)  => api.post<Emprestimo>('/emprestimos', data);
export const updateEmprestimo = (id: string, data: Partial<Emprestimo>) => api.put<Emprestimo>(`/emprestimos/${id}`, data);
export const deleteEmprestimo = (id: string)                      => api.delete(`/emprestimos/${id}`);
export const getEmprestimosAtivos = (idAssoc: string) => api.get<{ idAssoc: string; count: number }>(`/emprestimos/ativos/${idAssoc}`);
export const renovarEmprestimo = (id: string) => api.post<Emprestimo>(`/emprestimos/${id}/renovar`);
export const cancelarEmprestimo = (id: string, motivoCancelamento: string) => api.post<Emprestimo>(`/emprestimos/${id}/cancelar`, { motivoCancelamento });
