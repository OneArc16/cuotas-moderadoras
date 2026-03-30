import ExcelJS from "exceljs";

import type { ReportesPageData } from "@/features/reportes/lib/get-reportes-page-data";

type BuildReportesWorkbookOptions = {
  data: ReportesPageData;
  generatedAt: Date;
  generatedBy: string;
  selectedCajaName?: string | null;
};

const HEADER_FILL = "FF163A2B";
const HEADER_TEXT = "FFFFFFFF";
const CURRENCY_FORMAT = '"$"#,##0';

function toNumber(value: string | number) {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: {
        argb: HEADER_TEXT,
      },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: HEADER_FILL,
      },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFD8E6DC" } },
      left: { style: "thin", color: { argb: "FFD8E6DC" } },
      bottom: { style: "thin", color: { argb: "FFD8E6DC" } },
      right: { style: "thin", color: { argb: "FFD8E6DC" } },
    };
  });
}

function autoFitWorksheetColumns(worksheet: ExcelJS.Worksheet) {
  for (let columnIndex = 1; columnIndex <= worksheet.columnCount; columnIndex += 1) {
    const column = worksheet.getColumn(columnIndex);
    let maxLength = 12;

    column.eachCell({ includeEmpty: true }, (cell) => {
      const rawValue = cell.value;
      let cellText = "";

      if (rawValue == null) {
        cellText = "";
      } else if (
        typeof rawValue === "object" &&
        "text" in rawValue &&
        typeof rawValue.text === "string"
      ) {
        cellText = rawValue.text;
      } else {
        cellText = String(rawValue);
      }

      maxLength = Math.max(maxLength, cellText.length + 2);
    });

    column.width = Math.min(maxLength, 42);
  }
}

function addMetadataBlock(
  worksheet: ExcelJS.Worksheet,
  options: BuildReportesWorkbookOptions,
) {
  const { data, generatedAt, generatedBy, selectedCajaName } = options;

  worksheet.mergeCells("A1:B1");
  worksheet.getCell("A1").value = "Reporte operativo";
  worksheet.getCell("A1").font = { bold: true, size: 16 };

  worksheet.getCell("A2").value = "Generado por";
  worksheet.getCell("B2").value = generatedBy;
  worksheet.getCell("A3").value = "Generado el";
  worksheet.getCell("B3").value = generatedAt;
  worksheet.getCell("B3").numFmt = "yyyy-mm-dd hh:mm";
  worksheet.getCell("A4").value = "Periodo";
  worksheet.getCell("B4").value = `${data.filters.desde} a ${data.filters.hasta}`;
  worksheet.getCell("A5").value = "Caja";
  worksheet.getCell("B5").value = selectedCajaName ?? "Todas las cajas";

  for (const rowNumber of [2, 3, 4, 5]) {
    worksheet.getCell(`A${rowNumber}`).font = { bold: true };
  }
}

function buildResumenSheet(
  workbook: ExcelJS.Workbook,
  options: BuildReportesWorkbookOptions,
) {
  const worksheet = workbook.addWorksheet("Resumen");
  addMetadataBlock(worksheet, options);

  worksheet.addRow([]);
  const headerRow = worksheet.addRow(["Indicador", "Valor"]);
  styleHeaderRow(headerRow);

  const summaryRows: Array<{
    label: string;
    value: string | number;
    currency?: boolean;
  }> = [
    { label: "Admisiones totales", value: options.data.stats.admisionesTotales },
    { label: "Admisiones vigentes", value: options.data.stats.admisionesRegistradas },
    { label: "Admisiones anuladas", value: options.data.stats.admisionesAnuladas },
    { label: "Movimientos", value: options.data.stats.movimientos },
    { label: "Jornadas incluidas", value: options.data.stats.jornadasIncluidas },
    { label: "Cajas con movimiento", value: options.data.stats.cajasConMovimiento },
    { label: "Recaudo bruto", value: toNumber(options.data.stats.recaudoBruto), currency: true },
    { label: "Salidas operativas", value: toNumber(options.data.stats.recaudoSalidas), currency: true },
    { label: "Recaudo neto", value: toNumber(options.data.stats.recaudoNeto), currency: true },
    { label: "Recaudo en efectivo", value: toNumber(options.data.stats.recaudoEfectivo), currency: true },
    { label: "Recaudo electronico", value: toNumber(options.data.stats.recaudoElectronico), currency: true },
    { label: "Devoluciones", value: toNumber(options.data.stats.devoluciones), currency: true },
    { label: "Reversos por anulacion", value: toNumber(options.data.stats.reversosAnulacion), currency: true },
    { label: "Promedio por admision vigente", value: toNumber(options.data.stats.promedioAdmision), currency: true },
  ];

  for (const item of summaryRows) {
    const row = worksheet.addRow([item.label, item.value]);

    if (item.currency) {
      row.getCell(2).numFmt = CURRENCY_FORMAT;
    }
  }

  autoFitWorksheetColumns(worksheet);
}

function buildMetodoSheet(
  workbook: ExcelJS.Workbook,
  options: BuildReportesWorkbookOptions,
) {
  const worksheet = workbook.addWorksheet("Metodos pago");
  const headerRow = worksheet.addRow(["Metodo de pago", "Cantidad", "Total"]);
  styleHeaderRow(headerRow);

  for (const item of options.data.metodoSummaries) {
    const row = worksheet.addRow([
      item.metodoPago,
      item.cantidad,
      toNumber(item.total),
    ]);
    row.getCell(3).numFmt = CURRENCY_FORMAT;
  }

  autoFitWorksheetColumns(worksheet);
}

function buildCajasSheet(
  workbook: ExcelJS.Workbook,
  options: BuildReportesWorkbookOptions,
) {
  const worksheet = workbook.addWorksheet("Cajas");
  const headerRow = worksheet.addRow([
    "Caja",
    "Jornadas",
    "Admisiones",
    "Anuladas",
    "Entradas",
    "Salidas",
    "Neto",
  ]);
  styleHeaderRow(headerRow);

  for (const item of options.data.cajaSummaries) {
    const row = worksheet.addRow([
      item.cajaNombre,
      item.jornadas,
      item.admisiones,
      item.anuladas,
      toNumber(item.entradas),
      toNumber(item.salidas),
      toNumber(item.neto),
    ]);

    row.getCell(5).numFmt = CURRENCY_FORMAT;
    row.getCell(6).numFmt = CURRENCY_FORMAT;
    row.getCell(7).numFmt = CURRENCY_FORMAT;
  }

  autoFitWorksheetColumns(worksheet);
}

function buildContratosSheet(
  workbook: ExcelJS.Workbook,
  options: BuildReportesWorkbookOptions,
) {
  const worksheet = workbook.addWorksheet("Contratos");
  const headerRow = worksheet.addRow([
    "Contrato",
    "Tipo",
    "Admisiones",
    "Anuladas",
    "Recaudado",
    "Anulado",
    "Neto",
  ]);
  styleHeaderRow(headerRow);

  for (const item of options.data.contratoSummaries) {
    const row = worksheet.addRow([
      item.contratoNombre,
      item.tipo,
      item.admisiones,
      item.anuladas,
      toNumber(item.recaudado),
      toNumber(item.anulado),
      toNumber(item.neto),
    ]);

    row.getCell(5).numFmt = CURRENCY_FORMAT;
    row.getCell(6).numFmt = CURRENCY_FORMAT;
    row.getCell(7).numFmt = CURRENCY_FORMAT;
  }

  autoFitWorksheetColumns(worksheet);
}

function buildServiciosSheet(
  workbook: ExcelJS.Workbook,
  options: BuildReportesWorkbookOptions,
) {
  const worksheet = workbook.addWorksheet("Servicios");
  const headerRow = worksheet.addRow([
    "Servicio",
    "Codigo",
    "Admisiones",
    "Recaudado",
  ]);
  styleHeaderRow(headerRow);

  for (const item of options.data.servicioSummaries) {
    const row = worksheet.addRow([
      item.servicioNombre,
      item.codigo ?? "Sin codigo",
      item.admisiones,
      toNumber(item.recaudado),
    ]);
    row.getCell(4).numFmt = CURRENCY_FORMAT;
  }

  autoFitWorksheetColumns(worksheet);
}

export async function buildReportesWorkbook(
  options: BuildReportesWorkbookOptions,
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Cuotas Moderadoras";
  workbook.company = "SISM";
  workbook.created = options.generatedAt;
  workbook.modified = options.generatedAt;
  workbook.subject = "Reporte operativo";
  workbook.title = "Reporte operativo";

  buildResumenSheet(workbook, options);
  buildMetodoSheet(workbook, options);
  buildCajasSheet(workbook, options);
  buildContratosSheet(workbook, options);
  buildServiciosSheet(workbook, options);

  return workbook.xlsx.writeBuffer();
}