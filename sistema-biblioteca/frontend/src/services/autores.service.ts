import api from './api';

export interface Autor {
  _id?: string;
  nome: string;
  nacionalidade?: string;
}

export const getAutores   = ()                            => api.get<Autor[]>('/autores');
export const getAutor     = (id: string)                  => api.get<Autor>(`/autores/${id}`);
export const createAutor  = (data: Omit<Autor, '_id'>)   => api.post<Autor>('/autores', data);
export const updateAutor  = (id: string, data: Partial<Autor>) => api.put<Autor>(`/autores/${id}`, data);
export const deleteAutor  = (id: string)                  => api.delete(`/autores/${id}`);
