-- ========================================
-- TESTE: Verificar e forçar categorias
-- ========================================

-- 1. Ver quantas campanhas existem no total
SELECT COUNT(*) as total_campanhas FROM public.campanhas;

-- 2. Ver distribuição de categorias ATUAIS
SELECT categoria, COUNT(*) as quantidade 
FROM public.campanhas 
GROUP BY categoria;

-- 3. Ver todas as campanhas com seus títulos e categorias
SELECT id, titulo, categoria, data_criacao 
FROM public.campanhas 
ORDER BY data_criacao DESC;

-- 4. Se quiser forçar categorias diferentes para teste:
-- ATUALIZAR MANUALMENTE UMA CAMPANHA PARA TESTE
UPDATE public.campanhas
SET categoria = 'Educação'::public.categoria_campanha
WHERE titulo = 'dfgg'
LIMIT 1;

-- 5. DEPOIS VERIFICAR SE ATUALIZOU
SELECT titulo, categoria FROM public.campanhas WHERE titulo = 'dfgg';

-- 6. Se nada disso funcionar, significa que há um CONSTRAINT ou TRIGGER bloqueando
-- Ver se há triggers:
SELECT event_object_table, trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'campanhas';
