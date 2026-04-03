export const CATEGORIAS_CAMPANHA = [
  'Social'
] as const;

export type CategoriaCampanha = typeof CATEGORIAS_CAMPANHA[number];

export const normalizarCategoria = (categoria: any): CategoriaCampanha => {
  return 'Social';
};
