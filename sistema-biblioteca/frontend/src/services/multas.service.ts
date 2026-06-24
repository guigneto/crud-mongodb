import api from './api';

export interface Multa {
  _id?: string;
  idEmpr: string;
<<<<<<< HEAD
  dscTipMult: 'atraso' | 'dano_perda' | 'atraso_dano';
=======
  dscTipMult: 'atraso' | 'dano_perda';
  dscStatusMult: 'PAGO' | 'PENDENTE';
>>>>>>> 350a645d7b530322f45244520433d9f2e61468e6
  valMult: number;
}

export const getMultas   = ()                             => api.get<Multa[]>('/multas');
export const getMulta    = (id: string)                   => api.get<Multa>(`/multas/${id}`);
export const createMulta = (data: Omit<Multa, '_id'>)    => api.post<Multa>('/multas', data);
export const updateMulta = (id: string, data: Partial<Multa>) => api.put<Multa>(`/multas/${id}`, data);
export const deleteMulta = (id: string)                   => api.delete(`/multas/${id}`);
