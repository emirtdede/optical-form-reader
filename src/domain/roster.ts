import ExcelJS from 'exceljs';
import type { StudentResult, StudentRosterEntry } from '../types';

export async function readFileAsText(file: File | Blob): Promise<string> {
  if (typeof file.text === 'function') {
    try {
      return await file.text();
    } catch {
      // Fallback
    }
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function readFileAsArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    try {
      return await file.arrayBuffer();
    } catch {
      // Fallback
    }
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function normalizeStudentNumber(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'object' && raw !== null && 'result' in (raw as Record<string, unknown>)) {
    return String((raw as Record<string, unknown>).result ?? '').trim().replace(/\s+/g, '');
  }
  const text = String(raw).trim();
  // Türkçe karakter ve gereksiz boşlukları temizle
  return text.replace(/\s+/g, '');
}

/**
 * Excel veya CSV dosyasından sınıf listesini (Öğrenci No, Ad Soyad, Şube) ayrıştırır.
 */
export async function parseRosterSpreadsheet(file: File): Promise<StudentRosterEntry[]> {
  const extension = file.name.toLowerCase().split('.').pop() ?? '';

  if (extension === 'csv') {
    return parseRosterCsv(file);
  }

  return parseRosterExcel(file);
}

async function parseRosterCsv(file: File): Promise<StudentRosterEntry[]> {
  const text = await readFileAsText(file);
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Ayırıcıyı tespit et (; veya , veya tab)
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';

  const headers = lines[0].split(delimiter).map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

  const noIdx = headers.findIndex((h) => /no|numara|id|öğrenci\s*no|okul\s*no/.test(h));
  const nameIdx = headers.findIndex((h) => /ad|soyad|isim|name|fullname/.test(h));
  const classIdx = headers.findIndex((h) => /sınıf|şube|class|grup|branch/.test(h));

  const entries: StudentRosterEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim());
    const rawNo = noIdx >= 0 ? cols[noIdx] : cols[0];
    const rawName = nameIdx >= 0 ? cols[nameIdx] : (cols[1] ?? '');
    const rawClass = classIdx >= 0 ? cols[classIdx] : (cols[2] ?? '');

    const studentNumber = normalizeStudentNumber(rawNo);
    const fullName = String(rawName || '').trim();

    if (studentNumber) {
      entries.push({
        studentNumber,
        fullName: fullName || `Öğrenci ${studentNumber}`,
        className: rawClass || undefined,
      });
    }
  }

  return entries;
}

async function parseRosterExcel(file: File): Promise<StudentRosterEntry[]> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const entries: StudentRosterEntry[] = [];
  let noColIndex = 1;
  let nameColIndex = 2;
  let surnameColIndex = -1;
  let classColIndex = -1;
  let startRow = 2;

  // Başlık satırını ara (ilk 5 satır)
  for (let r = 1; r <= Math.min(5, worksheet.rowCount); r++) {
    const row = worksheet.getRow(r);
    let foundHeaders = false;

    row.eachCell((cell, colNumber) => {
      const val = String(cell.value ?? '').toLowerCase().trim();
      if (/no|numara|id|öğrenci\s*no|okul\s*no/.test(val)) {
        noColIndex = colNumber;
        foundHeaders = true;
      } else if (/ad\s*soyad|isim\s*soyisim|ad\s*ve\s*soyad/.test(val)) {
        nameColIndex = colNumber;
        foundHeaders = true;
      } else if (val === 'ad' || val === 'adı' || val === 'isim') {
        nameColIndex = colNumber;
        foundHeaders = true;
      } else if (val === 'soyad' || val === 'soyadı' || val === 'soyisim') {
        surnameColIndex = colNumber;
        foundHeaders = true;
      } else if (/sınıf|şube|grup|class/.test(val)) {
        classColIndex = colNumber;
        foundHeaders = true;
      }
    });

    if (foundHeaders) {
      startRow = r + 1;
      break;
    }
  }

  for (let r = startRow; r <= worksheet.rowCount; r++) {
    const row = worksheet.getRow(r);
    const rawNo = row.getCell(noColIndex).value;
    if (!rawNo) continue;

    const studentNumber = normalizeStudentNumber(rawNo);
    if (!studentNumber) continue;

    let fullName = String(row.getCell(nameColIndex).value ?? '').trim();
    if (surnameColIndex > 0) {
      const surname = String(row.getCell(surnameColIndex).value ?? '').trim();
      if (surname) {
        fullName = `${fullName} ${surname}`.trim();
      }
    }

    const className = classColIndex > 0 ? String(row.getCell(classColIndex).value ?? '').trim() : undefined;

    entries.push({
      studentNumber,
      fullName: fullName || `Öğrenci ${studentNumber}`,
      className: className || undefined,
    });
  }

  return entries;
}

import { matchStudentByFuzzyName } from './fuzzyMatching';

/**
 * Optik form sonuçlarını yüklenen sınıf listesiyle eşleştirir ve ad/sınıf bilgilerini günceller.
 * Numarası kodlanmamış veya bulunamayan öğrenciler için Ad-Soyad üzerinden Bulanık Eşleştirme (Fuzzy Match) yapar.
 */
export function matchResultsWithRoster(
  results: StudentResult[],
  roster: StudentRosterEntry[],
): { matchedCount: number; unmatchedCount: number; updatedResults: StudentResult[] } {
  const rosterMap = new Map<string, StudentRosterEntry>();

  roster.forEach((entry) => {
    rosterMap.set(entry.studentNumber, entry);
    // Baştaki sıfırları temizleyerek de indeksle (örn: "00123" -> "123")
    const stripped = entry.studentNumber.replace(/^0+/, '');
    if (stripped && stripped !== entry.studentNumber) {
      rosterMap.set(stripped, entry);
    }
  });

  let matchedCount = 0;
  let unmatchedCount = 0;

  const updatedResults = results.map((student) => {
    const num = normalizeStudentNumber(student.studentNumber);
    const strippedNum = num.replace(/^0+/, '');
    const directMatch = rosterMap.get(num) ?? (strippedNum ? rosterMap.get(strippedNum) : undefined);

    if (directMatch) {
      matchedCount++;
      return {
        ...student,
        studentFullName: directMatch.fullName,
        studentClass: directMatch.className ?? student.studentClass,
      };
    }

    // Doğrudan numara eşleşmediyse: Ad-Soyad üzerinden Bulanık Eşleştirme (Fuzzy Match) dene
    if (student.studentFullName && student.studentFullName.trim().length > 2) {
      const fuzzyMatch = matchStudentByFuzzyName(student.studentFullName, roster, 0.75);
      if (fuzzyMatch) {
        matchedCount++;
        return {
          ...student,
          studentNumber: student.studentNumber || fuzzyMatch.entry.studentNumber,
          studentFullName: fuzzyMatch.entry.fullName,
          studentClass: fuzzyMatch.entry.className ?? student.studentClass,
        };
      }
    }

    unmatchedCount++;
    return student;
  });

  return { matchedCount, unmatchedCount, updatedResults };
}

/**
 * Öğretmenler için örnek bir Excel sınıf listesi şablonu oluşturur.
 */
export async function generateSampleRosterExcel(): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sınıf Listesi');

  worksheet.columns = [
    { header: 'Öğrenci No', key: 'no', width: 16 },
    { header: 'Ad Soyad', key: 'name', width: 28 },
    { header: 'Sınıf / Şube', key: 'class', width: 16 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  };

  const sampleData = [
    { no: '101', name: 'Ahmet Yılmaz', class: '10-A' },
    { no: '102', name: 'Ayşe Kaya', class: '10-A' },
    { no: '103', name: 'Mehmet Demir', class: '10-A' },
    { no: '104', name: 'Zeynep Çelik', class: '10-A' },
    { no: '105', name: 'Can Özkan', class: '10-A' },
  ];

  sampleData.forEach((row) => worksheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
