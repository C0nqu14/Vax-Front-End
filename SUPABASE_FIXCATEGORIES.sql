-- ========================================
-- FIX: Atualizar campanhas com categoria NULL
-- ========================================
-- Execute isto no Supabase SQL Editor

-- 1. Atualizar campanhas que têm categoria NULL com valor padrão 'Social'
UPDATE public.campanhas
SET categoria = 'Social'::public.categoria_campanha
WHERE categoria IS NULL;

-- 2. Verificar quantas foram atualizadas
SELECT COUNT(*) as campanhas_atualizadas
FROM public.campanhas
WHERE categoria IS NOT NULL;

-- 3. (OPCIONAL) Se você quer distribuir melhor, atualizar por tipo:
-- Social e Educação são as mais comuns, então podemos tentar mapear
-- UPDATE public.campanhas
-- SET categoria = 'Educação'::public.categoria_campanha
-- WHERE categoria IS NULL AND titulo ILIKE '%educa%';

-- 4. (OPCIONAL) Ver campanhas que ainda têm categoria NULL
-- SELECT id, titulo, categoria FROM public.campanhas WHERE categoria IS NULL;
