import api from './api';

export interface ProdutoAutor { idAutor: number; nomAutor: string }
export interface ProdutoExemplar { idExemplar: number }

export interface Produto {
  _id?: string;
  dscTituloProd: string;
  valMultaDiarProd: number;
  valVendaProd: number;
  dscTipoProd: 'livro' | 'cd' | 'dvd' | 'revista' | 'jornal' | 'nuvem';
  dscFormatoProd?: 'pdf' | 'video' | null;
  idEditora: string;
  autores?: ProdutoAutor[];
  exemplares?: ProdutoExemplar[];
}

export const getProdutos   = ()                             => api.get<Produto[]>('/produtos');
export const getProduto    = (id: string)                   => api.get<Produto>(`/produtos/${id}`);
export const createProduto = (data: Omit<Produto, '_id'>)  => api.post<Produto>('/produtos', data);
export const updateProduto = (id: string, data: Partial<Produto>) => api.put<Produto>(`/produtos/${id}`, data);
export const deleteProduto = (id: string)                   => api.delete(`/produtos/${id}`);
