import "server-only";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { siteConfig } from "@/config/site";
import { getDocumentTemplate } from "@/lib/admin/document-templates";
import type { ServiceDocumentRecord } from "@/lib/admin/types";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const FOOTER_HEIGHT = 38;
const BODY_SIZE = 10;
const LINE_HEIGHT = 14;

function pdfSafeText(value: string) {
  return value
    .replaceAll("\u201c", '"')
    .replaceAll("\u201d", '"')
    .replaceAll("\u2018", "'")
    .replaceAll("\u2019", "'")
    .replaceAll("\u2013", "-")
    .replaceAll("\u2014", "-")
    .replaceAll("\u2212", "-")
    .replaceAll("\u2026", "...")
    .replaceAll("\u2022", "-")
    .replaceAll("\u00a0", " ")
    .replace(/[^\x09\x0a\x0d\x20-\xff]/g, "?");
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  for (const paragraph of pdfSafeText(text).split(/\r?\n/)) {
    if (!paragraph) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      line = "";
      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        line = word;
        continue;
      }
      let fragment = "";
      for (const character of word) {
        if (font.widthOfTextAtSize(fragment + character, size) > maxWidth && fragment) {
          lines.push(fragment);
          fragment = character;
        } else {
          fragment += character;
        }
      }
      line = fragment;
    }
    if (line) lines.push(line);
  }
  return lines;
}

export async function createServiceDocumentPdf(
  document: ServiceDocumentRecord,
  clientName: string,
  orderNumber?: string,
) {
  const template = getDocumentTemplate(document.template_id);
  if (!template) throw new Error("El tipo de documento guardado ya no está disponible.");

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const pages: PDFPage[] = [page];
  let cursorY = PAGE_HEIGHT - MARGIN;

  const addPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    cursorY = PAGE_HEIGHT - MARGIN;
  };

  const ensureRoom = (needed = LINE_HEIGHT) => {
    if (cursorY - needed < MARGIN + FOOTER_HEIGHT) addPage();
  };

  const drawParagraph = (
    text: string,
    font: PDFFont = regular,
    size = BODY_SIZE,
    indent = 0,
    color = rgb(0.12, 0.13, 0.15),
  ) => {
    for (const line of wrapText(text, font, size, PAGE_WIDTH - 2 * MARGIN - indent)) {
      ensureRoom(size + 4);
      if (line) {
        page.drawText(line, {
          x: MARGIN + indent,
          y: cursorY - size,
          size,
          font,
          color,
        });
      }
      cursorY -= LINE_HEIGHT;
    }
  };

  const drawField = (label: string, value: string) => {
    drawParagraph(`${label}:`, bold, BODY_SIZE);
    drawParagraph(value || "No indicado", regular, BODY_SIZE, 10);
    cursorY -= 3;
  };

  drawParagraph("ZIPEK TECNOLOGÍA SpA", bold, 17, 0, rgb(0.08, 0.16, 0.28));
  drawParagraph("RUT 76.850.804-6 · Quillota, Región de Valparaíso", regular, 9, 0, rgb(0.35, 0.38, 0.42));
  drawParagraph(`WhatsApp ${siteConfig.contact.phone} · ${siteConfig.contact.email}`, regular, 9, 0, rgb(0.35, 0.38, 0.42));
  cursorY -= 5;
  page.drawLine({
    start: { x: MARGIN, y: cursorY },
    end: { x: PAGE_WIDTH - MARGIN, y: cursorY },
    thickness: 1,
    color: rgb(0.8, 0.82, 0.84),
  });
  cursorY -= 17;
  drawParagraph(template.title, bold, 15, 0, rgb(0.08, 0.16, 0.28));
  drawField("Cliente", clientName);
  if (orderNumber) drawField("Orden asociada", orderNumber);
  drawField("Fecha de creación", new Date(document.created_at).toLocaleDateString("es-CL", { timeZone: "America/Santiago" }));
  cursorY -= 6;

  for (const section of template.sections) {
    ensureRoom(28);
    cursorY -= 4;
    drawParagraph(section.title, bold, 12, 0, rgb(0.08, 0.16, 0.28));
    cursorY -= 2;

    for (const fieldName of section.fields ?? []) {
      const field = template.fields.find((item) => item.name === fieldName);
      if (field) drawField(field.label, document.data[fieldName]?.trim() ?? "");
    }

    for (const paragraph of section.paragraphs ?? []) {
      drawParagraph(paragraph);
      cursorY -= 3;
    }
  }

  for (const [index, footerPage] of pages.entries()) {
    footerPage.drawLine({
      start: { x: MARGIN, y: MARGIN + FOOTER_HEIGHT - 5 },
      end: { x: PAGE_WIDTH - MARGIN, y: MARGIN + FOOTER_HEIGHT - 5 },
      thickness: 0.5,
      color: rgb(0.82, 0.83, 0.85),
    });
    footerPage.drawText(
      `ZIPEK TECNOLOGÍA · Documento ${index + 1} de ${pages.length}`,
      {
        x: MARGIN,
        y: MARGIN + 8,
        size: 8,
        font: regular,
        color: rgb(0.4, 0.42, 0.45),
      },
    );
  }

  return pdf.save();
}
