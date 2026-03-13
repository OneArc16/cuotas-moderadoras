type TarifaItem = {
  id: number;
  servicio: {
    nombre: string;
  };
  contrato: {
    nombre: string;
  };
  categoriaAfiliacion: {
    nombre: string;
  } | null;
  tipoCobro: string;
  valor: string;
  fechaInicioVigencia: Date;
  fechaFinVigencia: Date | null;
  estado: string;
};

type TarifasListProps = {
  tarifas: TarifaItem[];
};

export function TarifasList({ tarifas }: TarifasListProps) {
  if (tarifas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          Aún no hay tarifas registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <div className="grid grid-cols-8 border-b bg-muted/40 px-4 py-3 text-sm font-medium">
        <span>ID</span>
        <span>Servicio</span>
        <span>Contrato</span>
        <span>Categoría</span>
        <span>Tipo cobro</span>
        <span>Valor</span>
        <span>Desde</span>
        <span>Estado</span>
      </div>

      <div className="divide-y">
        {tarifas.map((tarifa) => (
          <div
            key={tarifa.id}
            className="grid grid-cols-8 px-4 py-3 text-sm"
          >
            <span>{tarifa.id}</span>
            <span>{tarifa.servicio.nombre}</span>
            <span>{tarifa.contrato.nombre}</span>
            <span>{tarifa.categoriaAfiliacion?.nombre ?? "—"}</span>
            <span>{tarifa.tipoCobro}</span>
            <span>{tarifa.valor}</span>
            <span>
              {new Date(tarifa.fechaInicioVigencia).toLocaleDateString("es-CO")}
            </span>
            <span>{tarifa.estado}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
