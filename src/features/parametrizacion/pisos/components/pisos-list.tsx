import type { Piso } from "../../../../../generated/prisma/client";

type PisosListProps = {
  pisos: Piso[];
};

export function PisosList({ pisos }: PisosListProps) {
  if (pisos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          Aún no hay pisos registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <div className="grid grid-cols-3 border-b bg-muted/40 px-4 py-3 text-sm font-medium">
        <span>ID</span>
        <span>Nombre</span>
        <span>Estado</span>
      </div>

      <div className="divide-y">
        {pisos.map((piso) => (
          <div key={piso.id} className="grid grid-cols-3 px-4 py-3 text-sm">
            <span>{piso.id}</span>
            <span>{piso.nombre}</span>
            <span>{piso.estado}</span>
          </div>
        ))}
      </div>
    </div>
  );
}