import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { calculateSessionSummary } from '../domain/statistics';
import type { ExamSession, StudentResult } from '../types';

function sanitizePdfText(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  return String(raw)
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');
}

/**
 * Tek bir öğrenci için A4 boyutunda şık ve profesyonel sınav sonuç karnesi üretir.
 */
export function buildStudentScorecardDoc(
  doc: jsPDF,
  session: ExamSession,
  student: StudentResult,
  rank: number,
  totalStudents: number,
  classAverageNet: number,
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // 1. Üst Başlık Banner
  doc.setFillColor(24, 24, 27); // slate-900
  doc.rect(margin, 12, pageWidth - margin * 2, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SINAV SONUC VE DEGERLENDIRME KARNESI', margin + 6, 23);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(sanitizePdfText(session.title || 'Optik Sinav').toUpperCase(), margin + 6, 30);

  const dateStr = new Date(student.processedAt || session.updatedAt).toLocaleDateString('tr-TR');
  doc.text(dateStr, pageWidth - margin - 6, 23, { align: 'right' });

  // 2. Öğrenci Bilgileri Kartı
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 38, pageWidth - margin * 2, 26, 2, 2, 'FD');

  doc.setTextColor(24, 24, 27);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const displayName = sanitizePdfText(student.studentFullName || `Ogrenci ${student.studentNumber}`);
  doc.text(displayName, margin + 6, 47);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Ogrenci No: ${student.studentNumber}`, margin + 6, 54);
  doc.text(`Kitapcik: ${student.booklet || 'A'}`, margin + 6, 60);

  const classText = student.studentClass ? `Sinif / Sube: ${sanitizePdfText(student.studentClass)}` : 'Sinif: -';
  doc.text(classText, margin + 70, 54);
  doc.text(`Sira: ${rank} / ${totalStudents}`, margin + 70, 60);

  const netDiff = Number((student.score.net - classAverageNet).toFixed(2));
  const diffSign = netDiff >= 0 ? `+${netDiff}` : `${netDiff}`;
  doc.text(`Sinif Net Ortalamasi: ${classAverageNet.toFixed(2)} (${diffSign})`, margin + 125, 54);
  doc.text(`Harf Notu: ${student.score.letterGrade || 'FF'}`, margin + 125, 60);

  // 3. KPI Özet Metrikleri (4 Kutu)
  const kpiY = 68;
  const kpiWidth = (pageWidth - margin * 2 - 9) / 4;
  const kpiHeight = 18;

  const kpis = [
    { label: 'PUAN (100)', val: `${student.score.score100 ?? student.score.percentage}`, color: [16, 185, 129] },
    { label: 'TOPLAM NET', val: `${student.score.net.toFixed(2)}`, color: [14, 165, 233] },
    { label: 'D / Y / B', val: `${student.score.correct} / ${student.score.wrong} / ${student.score.blank}`, color: [245, 158, 11] },
    { label: 'BASARI %', val: `%${student.score.percentage.toFixed(1)}`, color: [139, 92, 246] },
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = margin + idx * (kpiWidth + 3);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(kpiX, kpiY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, kpiX + kpiWidth / 2, kpiY + 6, { align: 'center' });

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, kpiX + kpiWidth / 2, kpiY + 14, { align: 'center' });
  });

  // 4. Bölüm / Ders Analizi Tablosu (Varsa)
  let currentY = 90;
  const sections = student.score.sections && student.score.sections.length > 0 ? student.score.sections : [];

  if (sections.length > 0) {
    const sectionBody = sections.map((sec) => [
      sanitizePdfText(sec.name),
      `${sec.startQuestion}-${sec.endQuestion}`,
      sec.questionCount,
      sec.correct,
      sec.wrong,
      sec.blank,
      sec.net.toFixed(2),
      sec.score100.toFixed(1),
      sec.letterGrade,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [['Ders / Bolum', 'Soru Araligi', 'Soru', 'D', 'Y', 'B', 'Net', 'Puan', 'Harf']],
      body: sectionBody,
      headStyles: {
        fillColor: [39, 39, 42],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      styles: {
        fontSize: 7.5,
        halign: 'center',
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY;
    currentY = finalY ? finalY + 6 : currentY + 30;
  }

  // 5. Soru Bazlı Cevap Dağılım Matrisi (4 Sütunlu Grid)
  const answers = student.answers || [];
  const qCount = answers.length;
  const colSize = Math.ceil(qCount / 4);

  const matrixHead = [
    'No', 'Cvp', 'Yanit', 'Durum',
    'No', 'Cvp', 'Yanit', 'Durum',
    'No', 'Cvp', 'Yanit', 'Durum',
    'No', 'Cvp', 'Yanit', 'Durum',
  ];

  const matrixRows: string[][] = [];

  for (let r = 0; r < colSize; r++) {
    const row: string[] = [];
    for (let c = 0; c < 4; c++) {
      const qIndex = c * colSize + r;
      if (qIndex < qCount) {
        const a = answers[qIndex];
        const statusMap = {
          correct: 'D (+)',
          wrong: 'Y (-)',
          blank: 'B ( )',
          ambiguous: '? (!)',
        };
        const statusText = statusMap[a.status] || '-';
        row.push(
          String(a.question),
          String(a.key || '-'),
          String(a.marked || '-'),
          statusText,
        );
      } else {
        row.push('', '', '', '');
      }
    }
    matrixRows.push(row);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    head: [matrixHead],
    body: matrixRows,
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontSize: 6.5,
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.2,
      lineColor: [203, 213, 225],
    },
    styles: {
      fontSize: 6.5,
      halign: 'center',
      cellPadding: 0.9,
      lineWidth: 0.1,
      lineColor: [226, 232, 240],
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const text = String(data.cell.raw || '');
        if (text.startsWith('D')) {
          data.cell.styles.textColor = [16, 185, 129]; // Green
          data.cell.styles.fontStyle = 'bold';
        } else if (text.startsWith('Y')) {
          data.cell.styles.textColor = [239, 68, 68]; // Red
          data.cell.styles.fontStyle = 'bold';
        } else if (text.startsWith('B')) {
          data.cell.styles.textColor = [148, 163, 184]; // Gray
        } else if (text.startsWith('?')) {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // 6. Alt Bilgi
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Bu karne Optik Form Okuyucu (Vellium) tarafindan yerel olarak olusturulmustur.',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' },
  );
}

/**
 * Tek bir öğrencinin karnesini PDF olarak üretir.
 */
export function generateSingleStudentScorecardPdf(
  session: ExamSession,
  student: StudentResult,
): jsPDF {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const sorted = [...session.results].sort((a, b) => b.score.net - a.score.net);
  const rank = sorted.findIndex((s) => s.id === student.id) + 1 || 1;
  const classAverageNet = session.results.length
    ? session.results.reduce((sum, r) => sum + r.score.net, 0) / session.results.length
    : 0;

  buildStudentScorecardDoc(doc, session, student, rank, session.results.length, classAverageNet);
  return doc;
}

/**
 * Sınavdaki tüm öğrencilerin karnelerini tek bir birleşik PDF dosyası olarak üretir.
 */
export function generateBulkScorecardsPdf(session: ExamSession): jsPDF {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const sorted = [...session.results].sort((a, b) => b.score.net - a.score.net);
  const classAverageNet = session.results.length
    ? session.results.reduce((sum, r) => sum + r.score.net, 0) / session.results.length
    : 0;

  sorted.forEach((student, index) => {
    if (index > 0) {
      doc.addPage();
    }
    buildStudentScorecardDoc(
      doc,
      session,
      student,
      index + 1,
      sorted.length,
      classAverageNet,
    );
  });

  return doc;
}

/**
 * Tüm öğrenci karnelerini tek tek ayrı PDF'ler halinde ZIP arşivi olarak paketler.
 */
export async function generateBulkScorecardsZip(session: ExamSession): Promise<Blob> {
  const zip = new JSZip();
  const sorted = [...session.results].sort((a, b) => b.score.net - a.score.net);
  const classAverageNet = session.results.length
    ? session.results.reduce((sum, r) => sum + r.score.net, 0) / session.results.length
    : 0;

  sorted.forEach((student, index) => {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    buildStudentScorecardDoc(
      doc,
      session,
      student,
      index + 1,
      sorted.length,
      classAverageNet,
    );

    const pdfBuffer = doc.output('arraybuffer');
    const safeName = sanitizePdfText(student.studentFullName || student.studentNumber)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const filename = `karne-${student.studentNumber}-${safeName}.pdf`;

    zip.file(filename, pdfBuffer);
  });

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
