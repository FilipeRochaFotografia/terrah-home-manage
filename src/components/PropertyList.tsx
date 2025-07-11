import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, List, History } from "lucide-react";

interface Imovel {
  id: string;
  nome: string;
  observacao?: string;
}

export function PropertyList() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editImovel, setEditImovel] = useState<Imovel | null>(null);
  const [nome, setNome] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);

  // Simulação de permissão de admin (troque por lógica real depois)
  const isAdmin = true;

  useEffect(() => {
    fetchImoveis();
  }, []);

  async function fetchImoveis() {
    setLoading(true);
    const { data, error } = await supabase.from("imoveis").select("id, nome, observacao").order("nome");
    if (!error && data) setImoveis(data);
    setLoading(false);
  }

  function openForm(imovel?: Imovel) {
    setEditImovel(imovel || null);
    setNome(imovel?.nome || "");
    setObservacao(imovel?.observacao || "");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditImovel(null);
    setNome("");
    setObservacao("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editImovel) {
      await supabase.from("imoveis").update({ nome, observacao }).eq("id", editImovel.id);
    } else {
      await supabase.from("imoveis").insert({ nome, observacao });
    }
    setSaving(false);
    closeForm();
    fetchImoveis();
  }

  async function handleDelete(id: string) {
    if (window.confirm("Tem certeza que deseja remover este imóvel?")) {
      await supabase.from("imoveis").delete().eq("id", id);
      fetchImoveis();
    }
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Imóveis
        </h2>
        {isAdmin && (
          <Button
            variant="turquoise"
            className="bg-gradient-to-r from-terrah-turquoise to-terrah-turquoise/90 hover:from-terrah-turquoise/90 hover:to-terrah-turquoise shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => openForm()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Imóvel
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando imóveis...</div>
      ) : (
        <div className="space-y-4">
          {imoveis.map((imovel) => (
            <Card key={imovel.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-terrah-turquoise/20 hover:border-l-terrah-turquoise">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xl group-hover:text-terrah-turquoise transition-colors duration-200">
                  {imovel.nome}
                </CardTitle>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openForm(imovel)} title="Editar">
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(imovel.id)} title="Remover">
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                {imovel.observacao && (
                  <div className="text-sm text-muted-foreground mb-2">{imovel.observacao}</div>
                )}
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm">
                    <List className="h-4 w-4 mr-1" /> Tarefas Pendentes
                  </Button>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-1" /> Histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal simples para cadastro/edição */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">{editImovel ? "Editar Imóvel" : "Novo Imóvel"}</h3>
            <input
              className="border rounded px-3 py-2"
              placeholder="Nome do imóvel"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              autoFocus
            />
            <textarea
              className="border rounded px-3 py-2"
              placeholder="Observação (opcional)"
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}