import api from './api';

export interface Editora {
  _id?: string;
  dscEditora: string;
}

export const getEditoras   = ()                              => api.get<Editora[]>('/editoras');
export const getEditora    = (id: string)                    => api.get<Editora>(`/editoras/${id}`);
export const createEditora = (data: Omit<Editora, '_id'>)   => api.post<Editora>('/editoras', data);
export const updateEditora = (id: string, data: Partial<Editora>) => api.put<Editora>(`/editoras/${id}`, data);
export const deleteEditora = (id: string)                    => api.delete(`/editoras/${id}`);
