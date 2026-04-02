// ENUM Categorias do Supabase (simplificado para impacto social)
export const CATEGORIAS_CAMPANHA = [
  'Social'
] as const;

// Tipo para categorias
export type CategoriaCampanha = typeof CATEGORIAS_CAMPANHA[number];

// Função para normalizar categoria (sempre retorna Social para projetos de impacto social)
export const normalizarCategoria = (categoria: any): CategoriaCampanha => {
  return 'Social';
};
