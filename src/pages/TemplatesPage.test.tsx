import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TemplatesPage } from './TemplatesPage';

describe('TemplatesPage (Standalone Optik Şablon Galerisi & PDF Üretici)', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  function renderWithRouter(ui: React.ReactElement) {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  }

  it('tüm şablonları ve temel başlıkları eksiksiz yükler', () => {
    renderWithRouter(<TemplatesPage />);
    expect(screen.getByText('Baskıya hazır standart ve özel optik formlar.')).toBeInTheDocument();
    expect(screen.getByText('Hazır Şablon Galerisi (12)')).toBeInTheDocument();
    expect(screen.getByText('160 Soruluk Kapsamlı Deneme & YKS Şablonu')).toBeInTheDocument();
    expect(screen.getByText('120 Soruluk Standart TYT & KPSS Şablonu')).toBeInTheDocument();
    expect(screen.getByText('100 Soruluk Standart Genel Sınav')).toBeInTheDocument();
    expect(screen.getByText('90 Soruluk Tam LGS Deneme Şablonu')).toBeInTheDocument();
    expect(screen.getByText('80 Soruluk YDS & YÖKDİL Dil Sınavı Şablonu')).toBeInTheDocument();
    expect(screen.getByText('50 Soruluk Ara Sınav / Vize Şablonu')).toBeInTheDocument();
    expect(screen.getByText('40 Soruluk Deneme & LGS Şablonu')).toBeInTheDocument();
    expect(screen.getByText('30 Soruluk Konu Tarama Şablonu')).toBeInTheDocument();
    expect(screen.getByText('25 Soruluk Standart Çeyrek Deneme')).toBeInTheDocument();
    expect(screen.getByText('20 Soruluk Mini Quiz & Hızlı Değerlendirme')).toBeInTheDocument();
    expect(screen.getByText('15 Soruluk Hızlı Quiz Şablonu')).toBeInTheDocument();
    expect(screen.getByText('10 Soruluk Mini Kazanım & Çıkış Bileti')).toBeInTheDocument();
  });

  it('şablon filtreleri seçildiğinde doğru şablonları filtreler', () => {
    renderWithRouter(<TemplatesPage />);

    // ÖSYM Sınavları filtresi
    const osymFilter = screen.getByRole('button', { name: /ÖSYM Sınavları/i });
    fireEvent.click(osymFilter);
    expect(screen.getByText('160 Soruluk Kapsamlı Deneme & YKS Şablonu')).toBeInTheDocument();
    expect(screen.getByText('120 Soruluk Standart TYT & KPSS Şablonu')).toBeInTheDocument();
    expect(screen.getByText('100 Soruluk Standart Genel Sınav')).toBeInTheDocument();
    expect(screen.getByText('80 Soruluk YDS & YÖKDİL Dil Sınavı Şablonu')).toBeInTheDocument();
    expect(screen.queryByText('90 Soruluk Tam LGS Deneme Şablonu')).not.toBeInTheDocument();

    // MEB & LGS filtresi
    const mebFilter = screen.getByRole('button', { name: /MEB & LGS/i });
    fireEvent.click(mebFilter);
    expect(screen.getByText('90 Soruluk Tam LGS Deneme Şablonu')).toBeInTheDocument();
    expect(screen.getByText('50 Soruluk Ara Sınav / Vize Şablonu')).toBeInTheDocument();
    expect(screen.getByText('40 Soruluk Deneme & LGS Şablonu')).toBeInTheDocument();
    expect(screen.getByText('20 Soruluk Mini Quiz & Hızlı Değerlendirme')).toBeInTheDocument();
    expect(screen.queryByText('160 Soruluk Kapsamlı Deneme & YKS Şablonu')).not.toBeInTheDocument();

    // Mini Quiz filtresi
    const quizFilter = screen.getByRole('button', { name: /Mini Quiz & Çıkış Bileti/i });
    fireEvent.click(quizFilter);
    expect(screen.getByText('10 Soruluk Mini Kazanım & Çıkış Bileti')).toBeInTheDocument();
    expect(screen.getByText('15 Soruluk Hızlı Quiz Şablonu')).toBeInTheDocument();
    expect(screen.getByText('20 Soruluk Mini Quiz & Hızlı Değerlendirme')).toBeInTheDocument();
    expect(screen.getByText('25 Soruluk Standart Çeyrek Deneme')).toBeInTheDocument();
    expect(screen.queryByText('100 Soruluk Standart Genel Sınav')).not.toBeInTheDocument();

    // Tümü filtresi
    const allFilter = screen.getByRole('button', { name: /^Tümü/i });
    fireEvent.click(allFilter);
    expect(screen.getByText('160 Soruluk Kapsamlı Deneme & YKS Şablonu')).toBeInTheDocument();
    expect(screen.getByText('100 Soruluk Standart Genel Sınav')).toBeInTheDocument();
    expect(screen.getByText('10 Soruluk Mini Kazanım & Çıkış Bileti')).toBeInTheDocument();
  }, 20000);

  it('özel form tasarımcısı sekmesine geçildiğinde form alanlarını düzenlemeye izin verir', () => {
    renderWithRouter(<TemplatesPage />);

    const customTab = screen.getByRole('tab', { name: /Özel Form Tasarımcısı/i });
    fireEvent.click(customTab);

    expect(screen.getByText('Canlı Vektörel Optik Form Üreticisi')).toBeInTheDocument();
    expect(screen.getByText('Form ve Başlık Bilgileri')).toBeInTheDocument();

    const schoolInput = screen.getByPlaceholderText('Örn: Cumhuriyet Anadolu Lisesi');
    fireEvent.change(schoolInput, { target: { value: 'İzmir Fen Lisesi' } });
    expect(schoolInput).toHaveValue('İzmir Fen Lisesi');

    const titleInput = screen.getByPlaceholderText('Örn: 1. Dönem 1. Ortak Yazılı Sınavı');
    fireEvent.change(titleInput, { target: { value: 'Biyoloji Olimpiyat Denemesi' } });
    expect(titleInput).toHaveValue('Biyoloji Olimpiyat Denemesi');
  });

  it('segmented ve çip butonlar tıklandığında aktif state güncellenir', () => {
    renderWithRouter(<TemplatesPage />);

    const customTab = screen.getByRole('tab', { name: /Özel Form Tasarımcısı/i });
    fireEvent.click(customTab);

    // 3 Şık (A–C) seçimi
    const btn3Choice = screen.getByRole('radio', { name: /3 Şık \(A–C\)/i });
    fireEvent.click(btn3Choice);
    expect(btn3Choice).toHaveAttribute('aria-checked', 'true');

    // 3 Hane seçimi
    const btn3Digits = screen.getByRole('radio', { name: /3 Hane/i });
    fireEvent.click(btn3Digits);
    expect(btn3Digits).toHaveAttribute('aria-checked', 'true');

    // Soru Sayısı çipi (100 Soru)
    const btn100 = screen.getByRole('radio', { name: /100/i });
    fireEvent.click(btn100);
    expect(btn100).toHaveAttribute('aria-checked', 'true');

    // 5 Şık seçimi
    const btn5Choice = screen.getByRole('radio', { name: /5 Şık \(A–E\)/i });
    fireEvent.click(btn5Choice);
    expect(btn5Choice).toHaveAttribute('aria-checked', 'true');

    // 12 Hane seçimi
    const btn12Digits = screen.getByRole('radio', { name: /12 Hane/i });
    fireEvent.click(btn12Digits);
    expect(btn12Digits).toHaveAttribute('aria-checked', 'true');

    // Kitapçık seçimi
    const btnAB = screen.getByRole('radio', { name: /A, B \(2 Kitapçık\)/i });
    fireEvent.click(btnAB);
    expect(btnAB).toHaveAttribute('aria-checked', 'true');
  });

  it('özel soru sayısı ve özel hane sayısı serbestçe girilebilir', () => {
    renderWithRouter(<TemplatesPage />);

    const customTab = screen.getByRole('tab', { name: /Özel Form Tasarımcısı/i });
    fireEvent.click(customTab);

    // Özel Soru Sayısı Girişi (örn: 35)
    const customQInput = screen.getByLabelText('Özel Soru Sayısı Girişi');
    fireEvent.change(customQInput, { target: { value: '35' } });
    expect(customQInput).toHaveValue(35);

    // Özel Öğrenci Numarası Hane Girişi (örn: 5)
    const customDigitInput = screen.getByLabelText('Özel Öğrenci Numarası Hane Girişi');
    fireEvent.change(customDigitInput, { target: { value: '5' } });
    expect(customDigitInput).toHaveValue(5);
  });

  it('baskı ve tarama standartları sekmesini görüntüler', () => {
    renderWithRouter(<TemplatesPage />);

    const standardsTab = screen.getByRole('tab', { name: /Baskı & Tarama Standartları/i });
    fireEvent.click(standardsTab);

    expect(screen.getByText('1. Yazıcı & Baskı Ayarları')).toBeInTheDocument();
    expect(screen.getByText('2. Öğrenci Kodlama Kuralları')).toBeInTheDocument();
    expect(screen.getByText('3. Kamera & Tarayıcı İpuçları')).toBeInTheDocument();
  });

  it('galeriden "Özelleştir" butonuna tıklandığında ilgili şablonu form tasarımcısına yükler', () => {
    renderWithRouter(<TemplatesPage />);

    const customizeButtons = screen.getAllByRole('button', { name: /Özelleştir/i });
    fireEvent.click(customizeButtons[0]);

    // Özel form sekmesine geçtiğini doğrula
    expect(screen.getByText('Canlı Vektörel Optik Form Üreticisi')).toBeInTheDocument();
  });

  it('arama kutusuna yazıldığında şablonları filtreler ve arama temizlenebilir', () => {
    renderWithRouter(<TemplatesPage />);

    const searchInput = screen.getByLabelText('Şablon ara');
    fireEvent.change(searchInput, { target: { value: 'LGS' } });

    expect(screen.getByText('40 Soruluk Deneme & LGS Şablonu')).toBeInTheDocument();
    expect(screen.queryByText('100 Soruluk Standart Genel Sınav')).not.toBeInTheDocument();

    const clearButton = screen.getByLabelText('Aramayı temizle');
    fireEvent.click(clearButton);

    expect(screen.getByText('100 Soruluk Standart Genel Sınav')).toBeInTheDocument();
  });

  it('şablon minyatürüne tıklandığında büyük önizleme modalını açar ve kapatır', () => {
    renderWithRouter(<TemplatesPage />);

    const previewWrappers = screen.getAllByTitle(/büyük önizlemede incelemek için tıklayın/i);
    fireEvent.click(previewWrappers[0]);

    // Modalın açıldığını doğrula
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Vektörel A4 Standardı · %100 Gerçek Boyut')).toBeInTheDocument();
    expect(screen.getByText('Teknik Şablon Özellikleri')).toBeInTheDocument();

    // Kapat butonuna tıkla
    const closeBtn = screen.getByLabelText('Önizlemeyi Kapat');
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

