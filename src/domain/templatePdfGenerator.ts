import { jsPDF } from 'jspdf';
import type { FormTemplateDefinition } from '../types';

export interface FormPdfCustomization {
  institutionName?: string;
  examTitle?: string;
  courseName?: string;
  dateStr?: string;
}

function sanitizeText(raw: string): string {
  return raw
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
 * Verilen şablon tanımına göre tarayıcıda anında baskıya hazır A4 optik form PDF'i üretir.
 */
export function generateOpticalFormPdf(
  template: FormTemplateDefinition,
  customization?: FormPdfCustomization,
): jsPDF {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  const marginX = 14;
  const marginY = 14;

  // 1. Dört Köşe Siyah Hizalama İşaretçileri (Fiducial Corner Marks - OMR Algılama için)
  const markerSize = 6;
  doc.setFillColor(0, 0, 0);
  doc.rect(marginX, marginY, markerSize, markerSize, 'F'); // Sol Üst
  doc.rect(pageWidth - marginX - markerSize, marginY, markerSize, markerSize, 'F'); // Sağ Üst
  doc.rect(marginX, pageHeight - marginY - markerSize, markerSize, markerSize, 'F'); // Sol Alt
  doc.rect(pageWidth - marginX - markerSize, pageHeight - marginY - markerSize, markerSize, markerSize, 'F'); // Sağ Alt

  // 2. Üst Kurum ve Sınav Başlığı
  const institution = sanitizeText(customization?.institutionName || 'T.C. MILLI EGITIM BAKANLIGI / VELLIUM').toUpperCase();
  const exam = sanitizeText(customization?.examTitle || template.name).toUpperCase();
  const course = sanitizeText(customization?.courseName || 'OPTIK CEVAP KAGIDI');
  const dateStr = customization?.dateStr || new Date().toLocaleDateString('tr-TR');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);
  doc.text(institution, pageWidth / 2, marginY + 4, { align: 'center', maxWidth: 156 });

  doc.setFontSize(11.5);
  doc.text(exam, pageWidth / 2, marginY + 9, { align: 'center', maxWidth: 156 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${course}  -  Tarih: ${dateStr}`, pageWidth / 2, marginY + 13.5, { align: 'center', maxWidth: 156 });

  // 3. Öğrenci Bilgi ve İmza Kutusu
  const infoY = marginY + 16;
  const infoWidth = 78;
  const infoHeight = 32;
  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 0, 0);
  doc.rect(marginX + 2, infoY, infoWidth, infoHeight);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('OGRENCI BILGILERI', marginX + 4, infoY + 4);

  doc.setFont('helvetica', 'normal');
  doc.text('Adi Soyadi : ____________________________', marginX + 4, infoY + 11);
  doc.text('Sinif / Sube: ____________________________', marginX + 4, infoY + 18);
  doc.text('Imza       : ____________________________', marginX + 4, infoY + 25);

  // 4. Kitapçık Türü Kodlama Kutusu
  const bookletX = marginX + infoWidth + 5;
  const bookletWidth = 34;
  doc.rect(bookletX, infoY, bookletWidth, infoHeight);

  doc.setFont('helvetica', 'bold');
  doc.text('KITAPCIK', bookletX + bookletWidth / 2, infoY + 4, { align: 'center' });

  const booklets = template.supportedBooklets;
  const bSpacing = bookletWidth / (booklets.length + 1);
  booklets.forEach((b, idx) => {
    const bx = bookletX + bSpacing * (idx + 1);
    const by = infoY + 16;
    doc.circle(bx, by, 3, 'S');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(b, bx, by + 1.2, { align: 'center' });
  });

  // 5. Öğrenci Numarası Kodlama Izgarası (Grid)
  const studentGridX = bookletX + bookletWidth + 5;
  const digitsCount = Math.max(1, Math.min(12, template.studentIdDigits || 8));
  const cellW = digitsCount <= 3 ? 7.0 : digitsCount <= 5 ? 5.8 : digitsCount <= 8 ? 4.8 : 4.2;
  const studentGridW = digitsCount * cellW;
  doc.rect(studentGridX, infoY, studentGridW, infoHeight);

  doc.setFontSize(digitsCount <= 3 ? 5.5 : digitsCount <= 5 ? 6.2 : 7);
  doc.setFont('helvetica', 'bold');
  const studentTitle = digitsCount <= 3 ? 'OGR. NO' : digitsCount <= 5 ? 'OGRENCI NO' : 'OGRENCI NUMARASI';
  doc.text(studentTitle, studentGridX + studentGridW / 2, infoY + 3.8, { align: 'center' });

  // Numara kutucukları (Üst kareler)
  for (let c = 0; c < digitsCount; c++) {
    const cx = studentGridX + c * cellW;
    const cy = infoY + 5;
    doc.rect(cx, cy, cellW, 4.5);
  }

  // Baloncuklar 0-9
  doc.setFontSize(digitsCount <= 4 ? 6.0 : 5.5);
  doc.setFont('helvetica', 'normal');
  for (let d = 0; d <= 9; d++) {
    for (let c = 0; c < digitsCount; c++) {
      const bx = studentGridX + c * cellW + cellW / 2;
      const by = infoY + 11.5 + d * 1.95;
      doc.circle(bx, by, 1.3, 'S');
      doc.text(String(d), bx, by + 0.6, { align: 'center' });
    }
  }

  // 6. Cevap Bölümleri ve Baloncuk Izgarası
  const answersStartY = infoY + infoHeight + 8;
  const sections = template.sectionsCount;
  const qPerSec = template.questionsPerSection;
  const choices = template.choices;

  const availableWidth = pageWidth - marginX * 2 - 4;
  const sectionColWidth = availableWidth / sections;
  const isHighDensity = template.questionCount > 100;
  const rowHeight = isHighDensity ? 4.75 : template.questionCount > 50 ? 5.8 : 7.2;
  const bubbleRadius = isHighDensity ? 1.65 : 2.0;
  const bubbleFontSize = isHighDensity ? 5.2 : 6.5;
  const questionNoFontSize = isHighDensity ? 6.5 : 7.5;

  for (let s = 0; s < sections; s++) {
    const secQuestionsCount = Math.min(qPerSec, Math.max(0, template.questionCount - s * qPerSec));
    if (secQuestionsCount <= 0) continue;

    const secX = marginX + 2 + s * sectionColWidth;
    const secW = sectionColWidth - 4;

    // Bölüm Dış Çerçevesi
    const secH = secQuestionsCount * rowHeight + 8;
    doc.rect(secX, answersStartY, secW, secH);

    // Bölüm Başlığı
    doc.setFillColor(240, 240, 240);
    doc.rect(secX, answersStartY, secW, 5.5, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`BOLUM ${s + 1}`, secX + secW / 2, answersStartY + 4, { align: 'center' });

    // Sorular ve Baloncuklar
    for (let q = 0; q < secQuestionsCount; q++) {
      const qNum = s * qPerSec + q + 1;
      const qY = answersStartY + 8.5 + q * rowHeight;

      // Soru No
      doc.setFontSize(questionNoFontSize);
      doc.setFont('helvetica', 'bold');
      doc.text(String(qNum).padStart(2, '0'), secX + 4, qY + 1.2);

      // Baloncuklar
      const bubbleStartX = secX + (isHighDensity ? 10 : 12);
      const bubbleSpacing = (secW - (isHighDensity ? 12 : 14)) / choices.length;

      choices.forEach((choice, cIdx) => {
        const bx = bubbleStartX + cIdx * bubbleSpacing + bubbleSpacing / 2;
        doc.setLineWidth(0.25);
        doc.circle(bx, qY, bubbleRadius, 'S');

        doc.setFontSize(bubbleFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text(choice, bx, qY + (isHighDensity ? 0.6 : 0.8), { align: 'center' });
      });
    }
  }

  // 7. Alt Bilgilendirme ve Uyarılar
  const footerY = pageHeight - marginY - 6.5;
  doc.setFontSize(5.6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const footerNotice = sanitizeText('DIKKAT: Cevaplarinizi kursun kalem ile baloncuklarin disina tasmayacak sekilde doldurunuz. Karalamayiniz.');
  doc.text(footerNotice, pageWidth / 2, footerY, { align: 'center', maxWidth: 148 });

  const footerMeta = sanitizeText(`Form Sablon Kodu: ${template.id} | Vellium Optik Standart Formu v3.0`);
  doc.text(footerMeta, pageWidth / 2, footerY + 3.0, { align: 'center', maxWidth: 148 });

  return doc;
}
