import api from './api';

export interface ProdutoAutor { idAutor: number; nomAutor: string }
export interface ProdutoExemplar { idExemplar: number }

export interface Produto {
  _id?: string;
  codProd?: string | null;
  dscTituloProd: string;
  valMultaDiarProd: number;
  valVendaProd?: number;
  dscTipoProd: 'livro' | 'cd' | 'dvd' | 'revista' | 'jornal' | 'nuvem' | 'mapa' | 'audiobook' | 'software' | 'outro';
  dscFormatoProd?: 'pdf' | 'video' | null;
  idEditora: string;
  numAnoPublProd?: string | null;
  numISBNProd?: string | null;
  dscCategoriaProd?: string[];
  autores?: ProdutoAutor[];
  exemplares?: ProdutoExemplar[];
}

export const getProdutos = () => api.get<Produto[]>('/produtos').then(res => {
  res.data.forEach(p => {
    if (typeof p.dscCategoriaProd === 'string') p.dscCategoriaProd = [p.dscCategoriaProd];
    else if (!p.dscCategoriaProd) p.dscCategoriaProd = [];
  });
  return res;
});
export const getProduto    = (id: string)                   => api.get<Produto>(`/produtos/${id}`);
export const createProduto = (data: Omit<Produto, '_id'>)  => api.post<Produto>('/produtos', data);
export const updateProduto = (id: string, data: Partial<Produto>) => api.put<Produto>(`/produtos/${id}`, data);
export const deleteProduto = (id: string)                   => api.delete(`/produtos/${id}`);
