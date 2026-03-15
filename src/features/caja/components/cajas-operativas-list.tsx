import { Badge } from "@/components/ui/badge";
import { OpenJornadaCajaDialog } from "@/features/caja/components/open-jornada-caja-dialog";
import { CloseJornadaCajaDialog } from "@/features/caja/components/close-jornada-caja-dialog";
import { ReopenJornadaCajaDialog } from "@/features/caja/components/reopen-jornada-caja-dialog";

type CajaOperativaItem = {
  id: number;
  nombre: string;
  estado: string;
  piso: {
    id: number;
    nombre: string;
  };
  jornadas: {
    id: number;
    fechaOperativa: Date;
    estado: "ABIERTA" | "CERRADA" | "REABIERTA";
    baseInicial: unknown;
    abiertaAt: Date;
    cerradaAt: Date | null;
    saldoEsperado: unknown;
    efectivoContado: unknown;
    diferenciaCierre: unknown;
  }[];
};

type CajasOperativasListProps = {
  cajas: CajaOperativaItem[];
};

function formatFecha(value: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatMoney(value: unknown) {
  const numberValue = Number(value ?? 0);

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

export function CajasOperativasList({ cajas }: CajasOperativasListProps) {
  if (cajas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          No hay cajas registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-x-auto">
      <table className="w-full min-w-[1400px] text-sm">
        <thead className="bg-muted/40">
          <tr className="border-b">
            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
              ID
            </th>
            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
              Caja
            </th>
            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
              Piso
            </th>
            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
              Estado caja
            </th>
            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
              Jornada actual
            </th>
            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
              Fecha operativa
            </th>
            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
              Base inicial
            </th>
            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
              Resumen jornada
            </th>
            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {cajas.map((caja) => {
            const jornadaActual = caja.jornadas[0] ?? null;
            const tieneJornadaAbierta =
              jornadaActual?.estado === "ABIERTA" ||
              jornadaActual?.estado === "REABIERTA";
            const tieneJornadaCerrada = jornadaActual?.estado === "CERRADA";

            return (
              <tr key={caja.id} className="border-b last:border-b-0 align-top">
                <td className="px-4 py-4 whitespace-nowrap">{caja.id}</td>

                <td className="px-4 py-4">
                  <div className="min-w-[140px]">
                    <p className="font-medium leading-5">{caja.nombre}</p>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="min-w-[120px]">
                    <p className="leading-5">{caja.piso.nombre}</p>
                  </div>
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge
                    variant={caja.estado === "ACTIVO" ? "default" : "secondary"}
                  >
                    {caja.estado}
                  </Badge>
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {jornadaActual ? (
                    <Badge
                      variant={
                        jornadaActual.estado === "CERRADA"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {jornadaActual.estado}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Sin jornada</span>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {jornadaActual ? (
                    formatFecha(jornadaActual.fechaOperativa)
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {jornadaActual ? (
                    formatMoney(jornadaActual.baseInicial)
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                <td className="px-4 py-4">
                  <div className="min-w-[220px] space-y-1">
                    {jornadaActual ? (
                      <>
                        <p className="whitespace-nowrap">
                          Esperado:{" "}
                          <span className="font-medium">
                            {formatMoney(jornadaActual.saldoEsperado)}
                          </span>
                        </p>
                        <p className="whitespace-nowrap">
                          Contado:{" "}
                          <span className="font-medium">
                            {jornadaActual.efectivoContado != null
                              ? formatMoney(jornadaActual.efectivoContado)
                              : "—"}
                          </span>
                        </p>
                        <p className="whitespace-nowrap">
                          Diferencia:{" "}
                          <span className="font-medium">
                            {jornadaActual.diferenciaCierre != null
                              ? formatMoney(jornadaActual.diferenciaCierre)
                              : "—"}
                          </span>
                        </p>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Sin datos</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex min-w-[240px] flex-col items-start gap-2">
                    <OpenJornadaCajaDialog
                      cajaId={caja.id}
                      cajaNombre={caja.nombre}
                      disabled={caja.estado !== "ACTIVO" || Boolean(jornadaActual)}
                    />

                    {jornadaActual ? (
                      <CloseJornadaCajaDialog
                        jornadaId={jornadaActual.id}
                        cajaNombre={caja.nombre}
                        disabled={!tieneJornadaAbierta}
                      />
                    ) : null}

                    {jornadaActual ? (
                      <ReopenJornadaCajaDialog
                        jornadaId={jornadaActual.id}
                        cajaNombre={caja.nombre}
                        disabled={!tieneJornadaCerrada}
                      />
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}