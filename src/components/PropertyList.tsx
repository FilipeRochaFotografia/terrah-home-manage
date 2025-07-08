import { Building2, MapPin, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockProperties = [
  {
    id: "1",
    name: "Prédio A - Residencial",
    address: "Rua das Flores, 123 - Centro",
    totalUnits: 24,
    activeTasks: 5,
    lastMaintenance: "2024-07-05",
    status: "active"
  },
  {
    id: "2", 
    name: "Torre B - Comercial",
    address: "Av. Principal, 456 - Bairro Novo",
    totalUnits: 18,
    activeTasks: 3,
    lastMaintenance: "2024-07-03",
    status: "active"
  },
  {
    id: "3",
    name: "Casa Unifamiliar",
    address: "Rua do Bosque, 789 - Jardins",
    totalUnits: 1,
    activeTasks: 1,
    lastMaintenance: "2024-06-28",
    status: "active"
  }
];

export function PropertyList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Imóveis</h2>
        <Button variant="turquoise">
          <Plus className="h-4 w-4 mr-2" />
          Novo Imóvel
        </Button>
      </div>

      <div className="space-y-3">
        {mockProperties.map((property) => (
          <Card key={property.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-terrah-turquoise/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-terrah-turquoise" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {property.address}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Ativo
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-terrah-turquoise">{property.totalUnits}</p>
                  <p className="text-xs text-muted-foreground">Unidades</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-terrah-orange">{property.activeTasks}</p>
                  <p className="text-xs text-muted-foreground">Tarefas Ativas</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Última: {new Date(property.lastMaintenance).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Tarefas
                </Button>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}