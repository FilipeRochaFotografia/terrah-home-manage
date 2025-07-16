-- Habilitar RLS e criar políticas para a tabela 'imoveis'
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.imoveis FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.imoveis FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.imoveis FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.imoveis FOR DELETE USING (auth.role() = 'authenticated');


-- Habilitar RLS e criar políticas para a tabela 'funcionarios'
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.funcionarios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.funcionarios FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.funcionarios FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.funcionarios FOR DELETE USING (auth.role() = 'authenticated');


-- Habilitar RLS e criar políticas para a tabela 'tarefas_predefinidas'
ALTER TABLE public.tarefas_predefinidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.tarefas_predefinidas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.tarefas_predefinidas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.tarefas_predefinidas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.tarefas_predefinidas FOR DELETE USING (auth.role() = 'authenticated');


-- Habilitar RLS e criar políticas para a tabela 'task_photos'
ALTER TABLE public.task_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.task_photos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.task_photos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.task_photos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.task_photos FOR DELETE USING (auth.role() = 'authenticated');


-- Habilitar RLS e criar políticas para a tabela 'tarefas'
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.tarefas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.tarefas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.tarefas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.tarefas FOR DELETE USING (auth.role() = 'authenticated'); 