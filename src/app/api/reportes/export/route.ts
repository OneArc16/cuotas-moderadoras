import { NextRequest, NextResponse } from "next/server";

import { buildReportesWorkbook } from "@/features/reportes/lib/build-reportes-workbook";
import { getReportesPageData } from "@/features/reportes/lib/get-reportes-page-data";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeFileSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function buildFileName(params: {
  desde: string;
  hasta: string;
  cajaNombre?: string | null;
}) {
  const desde = normalizeFileSegment(params.desde) || "sin-fecha";
  const hasta = normalizeFileSegment(params.hasta) || desde;
  const caja = normalizeFileSegment(params.cajaNombre ?? "todas-las-cajas") || "todas-las-cajas";

  return `reporte-operativo_${desde}_${hasta}_${caja}.xlsx`;
}

export async function GET(request: NextRequest) {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    return NextResponse.json(
      { message: "No se pudo validar la sesion actual." },
      { status: 401 },
    );
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.REPORT_VIEW)) {
    return NextResponse.json(
      { message: "No tienes permiso para exportar reportes." },
      { status: 403 },
    );
  }

  const data = await getReportesPageData({
    desde: request.nextUrl.searchParams.get("desde") ?? undefined,
    hasta: request.nextUrl.searchParams.get("hasta") ?? undefined,
    cajaId: request.nextUrl.searchParams.get("cajaId") ?? undefined,
  });

  const selectedCaja = data.filters.cajaId
    ? data.cajas.find((caja) => String(caja.id) === data.filters.cajaId)
    : null;

  const generatedAt = new Date();
  const workbookBuffer = await buildReportesWorkbook({
    data,
    generatedAt,
    generatedBy: usuario.nombreCompleto?.trim() || usuario.username || "Usuario",
    selectedCajaName: selectedCaja?.nombre ?? null,
  });

  const body = Buffer.isBuffer(workbookBuffer)
    ? workbookBuffer
    : Buffer.from(workbookBuffer);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${buildFileName({
        desde: data.filters.desde,
        hasta: data.filters.hasta,
        cajaNombre: selectedCaja?.nombre,
      })}"`,
      "Cache-Control": "no-store",
    },
  });
}