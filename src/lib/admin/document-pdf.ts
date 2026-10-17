import "server-only";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { siteConfig } from "@/config/site";
import { getDocumentTemplate } from "@/lib/admin/document-templates";
import type { ServiceDocumentRecord } from "@/lib/admin/types";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const FOOTER_HEIGHT = 34;
const CONTENT_BOTTOM = MARGIN + FOOTER_HEIGHT;
const LINE_HEIGHT = 13;
const COLORS = {
  navy: rgb(0.08, 0.16, 0.28),
  blue: rgb(0.02, 0.48, 0.67),
  text: rgb(0.13, 0.16, 0.2),
  muted: rgb(0.4, 0.44, 0.49),
  border: rgb(0.84, 0.87, 0.9),
  surface: rgb(0.96, 0.97, 0.98),
  white: rgb(1, 1, 1),
};

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

function getFieldValue(value: string | undefined, type?: string) {
  const trimmed = value?.trim() ?? "";
  if (type === "checkbox") return trimmed.toLowerCase() === "sí" ? "Aceptado" : "No aceptado";
  return trimmed || "No informado";
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
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const pages: PDFPage[] = [];
  let page: PDFPage;
  let cursorY = 0;

  const drawPageHeader = (continued: boolean) => {
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 5,
      width: PAGE_WIDTH,
      height: 5,
      color: COLORS.navy,
    });

    const badgeY = PAGE_HEIGHT - MARGIN - 31;
    page.drawRectangle({
      x: MARGIN,
      y: badgeY,
      width: 27,
      height: 27,
      color: COLORS.blue,
    });
    page.drawText("Z", {
      x: MARGIN + 8,
      y: badgeY + 6,
      size: 16,
      font: bold,
      color: COLORS.white,
    });
    page.drawText("ZIPEK TECNOLOGÍA SpA", {
      x: MARGIN + 37,
      y: PAGE_HEIGHT - MARGIN - 17,
      size: 12,
      font: bold,
      color: COLORS.navy,
    });
    page.drawText(`RUT 76.850.804-6  |  Quillota, Región de Valparaíso${continued ? "  |  Continuación" : ""}`, {
      x: MARGIN + 37,
      y: PAGE_HEIGHT - MARGIN - 29,
      size: 8,
      font: regular,
      color: COLORS.muted,
    });

    const contact = `WhatsApp ${siteConfig.contact.phone}  |  ${siteConfig.contact.email}`;
    const contactWidth = regular.widthOfTextAtSize(contact, 8);
    page.drawText(contact, {
      x: PAGE_WIDTH - MARGIN - contactWidth,
      y: PAGE_HEIGHT - MARGIN - 22,
      size: 8,
      font: regular,
      color: COLORS.muted,
    });

    const ruleY = PAGE_HEIGHT - MARGIN - 43;
    page.drawLine({
      start: { x: MARGIN, y: ruleY },
      end: { x: PAGE_WIDTH - MARGIN, y: ruleY },
      thickness: 0.8,
      color: COLORS.border,
    });
    cursorY = ruleY - 18;
  };

  const addPage = (continued: boolean) => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    drawPageHeader(continued);
  };

  const ensureRoom = (needed: number) => {
    if (cursorY - needed < CONTENT_BOTTOM) addPage(true);
  };

  const drawPageTitle = () => {
    const titleLines = wrapText(template.title, bold, 18, PAGE_WIDTH - MARGIN * 2 - 18);
    const titleHeight = titleLines.length * 21;
    const metadata = [
      { label: "CLIENTE", value: clientName },
      { label: "ORDEN", value: orderNumber || "Sin orden asociada" },
      {
        label: "FECHA DE CREACIÓN",
        value: new Date(document.created_at).toLocaleDateString("es-CL", { timeZone: "America/Santiago" }),
      },
    ];
    const gap = 8;
    const cardWidth = (PAGE_WIDTH - MARGIN * 2 - gap * 2) / 3;
    const metadataLines = metadata.map((item) => wrapText(item.value, regular, 9, cardWidth - 18));
    const metadataHeight = Math.max(48, ...metadataLines.map((lines) => 32 + lines.length * 11));
    ensureRoom(titleHeight + metadataHeight + 22);

    page.drawRectangle({
      x: MARGIN,
      y: cursorY - titleHeight - 8,
      width: 3,
      height: titleHeight + 8,
      color: COLORS.blue,
    });
    titleLines.forEach((line, index) => {
      page.drawText(line, {
        x: MARGIN + 12,
        y: cursorY - 19 - index * 21,
        size: 18,
        font: bold,
        color: COLORS.navy,
      });
    });
    cursorY -= titleHeight + 18;

    metadata.forEach((item, index) => {
      const x = MARGIN + index * (cardWidth + gap);
      page.drawRectangle({
        x,
        y: cursorY - metadataHeight,
        width: cardWidth,
        height: metadataHeight,
        color: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 0.6,
      });
      page.drawText(item.label, {
        x: x + 9,
        y: cursorY - 14,
        size: 7,
        font: bold,
        color: COLORS.muted,
      });
      metadataLines[index].forEach((line, lineIndex) => {
        page.drawText(line, {
          x: x + 9,
          y: cursorY - 29 - lineIndex * 11,
          size: 9,
          font: regular,
          color: COLORS.text,
        });
      });
    });
    cursorY -= metadataHeight + 17;
  };

  const drawSectionHeading = (title: string, firstFieldName?: string) => {
    const headingHeight = 21;
    const firstField = template.fields.find((item) => item.name === firstFieldName);
    const firstFieldWidth = firstField?.type === "textarea"
      ? PAGE_WIDTH - MARGIN * 2
      : (PAGE_WIDTH - MARGIN * 2 - 8) / 2;
    const firstFieldHeight = firstFieldName
      ? measureField(firstFieldName, firstFieldWidth)?.height ?? 38
      : 0;
    ensureRoom(headingHeight + 8 + firstFieldHeight + 7);
    cursorY -= 2;
    page.drawRectangle({
      x: MARGIN,
      y: cursorY - headingHeight,
      width: PAGE_WIDTH - MARGIN * 2,
      height: headingHeight,
      color: COLORS.navy,
    });
    page.drawRectangle({
      x: MARGIN,
      y: cursorY - headingHeight,
      width: 3,
      height: headingHeight,
      color: COLORS.blue,
    });
    page.drawText(pdfSafeText(title), {
      x: MARGIN + 10,
      y: cursorY - 14,
      size: 10,
      font: bold,
      color: COLORS.white,
    });
    cursorY -= headingHeight + 8;
  };

  type FieldCard = {
    label: string;
    value: string;
    width: number;
    height: number;
    valueLines: string[];
    labelLines: string[];
    valueFont: PDFFont;
    valueSize: number;
    longText: boolean;
  };

  const measureField = (fieldName: string, width: number): FieldCard | undefined => {
    const field = template.fields.find((item) => item.name === fieldName);
    if (!field) return undefined;

    const value = getFieldValue(document.data[field.name], field.type);
    const isLongText = field.type === "textarea";
    const labelSize = 7.5;
    const valueSize = isLongText ? 9 : 9.5;
    const padding = 9;
    const innerWidth = width - padding * 2;
    const labelLines = wrapText(field.label, bold, labelSize, innerWidth);
    const valueFont = value === "No informado" ? italic : regular;
    const valueLines = wrapText(value, valueFont, valueSize, innerWidth);
    const contentHeight = labelLines.length * 9 + 4 + valueLines.length * (isLongText ? 12 : 11);
    const height = Math.max(isLongText ? 50 : 38, contentHeight + padding * 2);
    return { label: field.label, value, width, height, valueLines, labelLines, valueFont, valueSize, longText: isLongText };
  };

  const drawFieldCard = (card: FieldCard, x: number, top: number) => {
    page.drawRectangle({
      x,
      y: top - card.height,
      width: card.width,
      height: card.height,
      color: COLORS.surface,
      borderColor: COLORS.border,
      borderWidth: 0.6,
    });

    let lineY = top - 9 - 7.5;
    card.labelLines.forEach((line) => {
      page.drawText(line, {
        x: x + 9,
        y: lineY,
        size: 7.5,
        font: bold,
        color: COLORS.muted,
      });
      lineY -= 9;
    });
    lineY -= 3;

    card.valueLines.forEach((line) => {
      if (line) {
        page.drawText(line, {
          x: x + 9,
          y: lineY,
          size: card.valueSize,
          font: card.valueFont,
          color: card.value === "No informado" ? COLORS.muted : COLORS.text,
        });
      }
      lineY -= card.height > 45 ? 12 : 11;
    });
  };

  const drawFields = (fieldNames: string[]) => {
    const gap = 8;
    const columnWidth = (PAGE_WIDTH - MARGIN * 2 - gap) / 2;
    let pendingField: string | undefined;

    const drawSingle = (fieldName: string) => {
      const card = measureField(fieldName, PAGE_WIDTH - MARGIN * 2);
      if (!card) return;
      const availableHeight = PAGE_HEIGHT - MARGIN - CONTENT_BOTTOM - 56;
      if (!card.longText || card.height <= availableHeight) {
        ensureRoom(card.height + 7);
        drawFieldCard(card, MARGIN, cursorY);
        cursorY -= card.height + 7;
        return;
      }

      const remainingLines = [...card.valueLines];
      let isFirstChunk = true;
      while (remainingLines.length > 0) {
        ensureRoom(45);
        const available = cursorY - CONTENT_BOTTOM - 18;
        const labelHeight = isFirstChunk ? card.labelLines.length * 9 + 4 : 15;
        const linesPerPage = Math.max(1, Math.floor((available - 18 - labelHeight) / 12));
        const chunk = remainingLines.splice(0, linesPerPage);
        const chunkHeight = 18 + labelHeight + chunk.length * 12;
        const chunkCard: FieldCard = {
          ...card,
          height: chunkHeight,
          labelLines: isFirstChunk
            ? card.labelLines
            : ["(continuación)"],
          valueLines: chunk,
        };
        drawFieldCard(chunkCard, MARGIN, cursorY);
        cursorY -= chunkHeight + 7;
        isFirstChunk = false;
        if (remainingLines.length > 0) addPage(true);
      }
    };

    const drawPair = (firstName: string, secondName: string) => {
      const first = measureField(firstName, columnWidth);
      const second = measureField(secondName, columnWidth);
      if (!first || !second) {
        if (first) drawSingle(firstName);
        if (second) drawSingle(secondName);
        return;
      }

      const rowHeight = Math.max(first.height, second.height);
      ensureRoom(rowHeight + 7);
      drawFieldCard({ ...first, height: rowHeight }, MARGIN, cursorY);
      drawFieldCard({ ...second, height: rowHeight }, MARGIN + columnWidth + gap, cursorY);
      cursorY -= rowHeight + 7;
    };

    for (const fieldName of fieldNames) {
      const field = template.fields.find((item) => item.name === fieldName);
      if (!field) continue;

      if (field.type === "textarea") {
        if (pendingField) {
          drawSingle(pendingField);
          pendingField = undefined;
        }
        drawSingle(fieldName);
        continue;
      }

      if (!pendingField) {
        pendingField = fieldName;
      } else {
        drawPair(pendingField, fieldName);
        pendingField = undefined;
      }
    }

    if (pendingField) drawSingle(pendingField);
  };

  const drawParagraph = (text: string) => {
    const indent = 12;
    const lines = wrapText(text, regular, 9, PAGE_WIDTH - MARGIN * 2 - indent - 8);
    for (const line of lines) {
      ensureRoom(LINE_HEIGHT + 7);
      page.drawRectangle({
        x: MARGIN,
        y: cursorY - LINE_HEIGHT - 2,
        width: PAGE_WIDTH - MARGIN * 2,
        height: LINE_HEIGHT + 2,
        color: COLORS.surface,
      });
      page.drawRectangle({
        x: MARGIN,
        y: cursorY - LINE_HEIGHT - 2,
        width: 2,
        height: LINE_HEIGHT + 2,
        color: COLORS.blue,
      });
      if (line) {
        page.drawText(line, {
          x: MARGIN + indent,
          y: cursorY - 9,
          size: 9,
          font: regular,
          color: COLORS.text,
        });
      }
      cursorY -= LINE_HEIGHT + 2;
    }
    cursorY -= 5;
  };

  addPage(false);
  drawPageTitle();

  for (const section of template.sections) {
    drawSectionHeading(section.title, section.fields?.[0]);
    drawFields(section.fields ?? []);
    for (const paragraph of section.paragraphs ?? []) drawParagraph(paragraph);
    cursorY -= 5;
  }

  pages.forEach((footerPage, index) => {
    footerPage.drawLine({
      start: { x: MARGIN, y: CONTENT_BOTTOM - 5 },
      end: { x: PAGE_WIDTH - MARGIN, y: CONTENT_BOTTOM - 5 },
      thickness: 0.7,
      color: COLORS.border,
    });
    const footerText = `ZIPEK TECNOLOGÍA  |  Documento ${index + 1} de ${pages.length}`;
    footerPage.drawText(footerText, {
      x: MARGIN,
      y: MARGIN + 8,
      size: 8,
      font: regular,
      color: COLORS.muted,
    });
  });

  return pdf.save();
}
