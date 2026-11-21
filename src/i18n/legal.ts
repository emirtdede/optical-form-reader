import { getVelliumLegalUrls, VELLIUM_BRAND } from '../brand/vellium';
import type { LanguageCode } from './languages';
import type { LegalDocId, LegalDocumentContent } from './types';

export const LEGAL_LAST_UPDATED = {
  tr: '20 Kasım 2026',
  en: 'November 20, 2026',
} as const;

export const ROUTE_TO_LEGAL_DOC: Record<string, LegalDocId> = {
  '/gizlilik': 'privacy',
  '/kvkk-aydinlatma': 'kvkk',
  '/kullanim-kosullari': 'terms',
  '/sorumluluk-reddi': 'disclaimer',
  '/yerel-depolama': 'storage',
  '/cerez-politikasi': 'cookies',
  '/acik-kaynak-lisanslari': 'licenses',
  '/erisilebilirlik': 'accessibility',
  '/iletisim': 'contact',
};

export function getLegalDocuments(lang: LanguageCode): Record<LegalDocId, LegalDocumentContent> {
  const isTr = lang === 'tr';
  const urls = getVelliumLegalUrls(isTr ? 'tr' : 'en');
  const company = VELLIUM_BRAND.companyFullName;
  const emails = VELLIUM_BRAND.emails;

  if (isTr) {
    return {
      privacy: {
        id: 'privacy',
        routePath: '/gizlilik',
        title: 'Gizlilik Politikası',
        eyebrow: 'Veri Gizliliği',
        externalUrl: urls.privacy,
        intro: `Optik Form Okuyucu (${company}), form görüntülerini ve öğrenci verilerini sunucuya göndermeden yalnızca cihazınızda işler. Telemetri, reklam veya davranış takibi içermez.`,
        sections: [
          {
            title: 'Cihaz içi işleme modeli',
            paragraphs: [
              'Cevap anahtarları, öğrenci numaraları, işaretlenen seçenekler, puanlar ve değerlendirme adları yalnızca cihazınızda (IndexedDB) işlenir. Taranan görüntüler ve PDF sayfaları işlem bittiğinde bellekten temizlenir ve hiçbir sunucuya gönderilmez.',
            ],
          },
          {
            title: 'Kamera ve yerel dosya erişimi',
            paragraphs: [
              'Canlı kamera tarama özelliği yalnızca sizin açık izninizle optik form karelerini anlık analiz eder. Kamera görüntüleri kaydedilmez, paylaşılmaz veya dışa aktarılmaz.',
            ],
          },
          {
            title: 'Veri kontrolü ve silme',
            paragraphs: [
              'Tüm değerlendirme kayıtlarını Veriler bölümünden tek tek veya topluca silebilir, JSON/ZIP yedeği alabilirsiniz. Windows 11 masaüstü uygulamasında veriler yerel kullanıcı profilinizde saklanır.',
            ],
          },
          {
            title: 'İletişim ve resmî politika',
            paragraphs: [
              `Gizlilik ve kişisel veri talepleriniz için ${emails.privacy} adresine yazabilir, güncel kurumsal gizlilik politikamıza ${urls.privacy} ve şirket bilgilerimize ${urls.companyInformation} üzerinden ulaşabilirsiniz.`,
            ],
          },
        ],
      },
      kvkk: {
        id: 'kvkk',
        routePath: '/kvkk-aydinlatma',
        title: 'KVKK Aydınlatma Metni',
        eyebrow: '6698 Sayılı Kanun & GDPR',
        externalUrl: urls.kvkk,
        intro: `${company} tarafından geliştirilen Optik Form Okuyucu’nun yerel işleme mimarisi kapsamındaki aydınlatma metnidir.`,
        sections: [
          {
            title: 'Veri sorumlusu ve kapsam',
            paragraphs: [
              `Uygulama yayıncısı ${company}’dir (resmî şirket bilgileri: ${urls.companyInformation}). Optik Form Okuyucu içinde işlenen sınav kağıtları ve öğrenci sonuçları Vellium tarafından toplanmaz ve sunuculara aktarılmaz; veriler doğrudan kullanıcının kendi cihazında işlenir. Öğrenci verilerini işleyen öğretmen veya eğitim kurumu, ilgili öğrenciler bakımından kendi veri sorumluluğu yükümlülüklerini yerine getirmekle sorumludur.`,
            ],
          },
          {
            title: 'Cihazda işlenen veri kategorileri',
            items: [
              'Öğrenci numarası ve isteğe bağlı sınıf listesi adı: sınav sonucunu eşleştirmek için.',
              'İşaretlenen şıklar ve puanlar: ölçme-değerlendirme ve karne üretimi için.',
              'Değerlendirme başlığı ve tarih bilgisi: yerel arşivi düzenlemek için.',
            ],
          },
          {
            title: 'Başvuru ve haklar',
            paragraphs: [
              `6698 sayılı KVKK m.11 kapsamındaki talepleriniz için ${emails.privacy} e-posta adresini veya ${urls.dataRequests} başvuru sayfasını kullanabilirsiniz.`,
            ],
          },
        ],
      },
      terms: {
        id: 'terms',
        routePath: '/kullanim-kosullari',
        title: 'Kullanım Koşulları (EULA)',
        eyebrow: 'Hizmet ve Lisans Şartları',
        externalUrl: urls.terms,
        intro: `Bu koşullar, ${company} tarafından sunulan Optik Form Okuyucu masaüstü ve web uygulamasının kullanımını düzenler.`,
        sections: [
          {
            title: 'Hizmetin niteliği',
            paragraphs: [
              'Optik Form Okuyucu; desteklenen standart ve özel optik şablonları cihaz içi görüntü işleme ile analiz eden yerel-first bir ölçme-değerlendirme aracıdır. Hesap veya bulut depolama gerektirmez.',
            ],
          },
          {
            title: 'İzin verilen kullanım',
            items: [
              'Yalnızca işleme yetkisine sahip olduğunuz sınav formlarını ve öğrenci listelerini kullanın.',
              'Resmî not kesinleştirme öncesinde düşük güvenli veya belirsiz işaretleri gözden geçirin.',
              'Uygulamayı hukuka aykırı veya üçüncü kişilerin haklarını ihlal eden amaçlarla kullanmayın.',
            ],
          },
          {
            title: 'Fikri mülkiyet',
            paragraphs: [
              `Optik Form Okuyucu arayüzü, özgün tasarımları ve Vellium markası üzerindeki tüm haklar ${company}’ye aittir. Hukuki bildirimler için ${emails.legal} adresine ulaşabilirsiniz.`,
            ],
          },
        ],
      },
      disclaimer: {
        id: 'disclaimer',
        routePath: '/sorumluluk-reddi',
        title: 'Sorumluluk Reddi Beyanı',
        eyebrow: 'Ölçme Doğruluğu',
        externalUrl: urls.terms,
        intro: 'Optik okuma sonuçları yardımcı değerlendirme çıktısıdır; resmî karar öncesinde yetkili kişi tarafından doğrulanmalıdır.',
        sections: [
          {
            title: 'Görüntü ve baskı etkenleri',
            paragraphs: [
              'Aşırı gölge, eğik çekim, düşük çözünürlük, eksik baskı ölçeği, silgi izi veya çift işaretleme optik okuma doğruluğunu etkileyebilir. Belirsiz veya uyarı verilen kağıtlar kaynak formla karşılaştırılmalıdır.',
            ],
          },
          {
            title: 'Yedekleme sorumluluğu',
            paragraphs: [
              'Veriler yalnızca cihazınızda saklandığı için cihaz arızası veya profil temizliği durumlarına karşı düzenli JSON/ZIP ve Excel yedeği almanız önerilir.',
            ],
          },
        ],
      },
      storage: {
        id: 'storage',
        routePath: '/yerel-depolama',
        title: 'Yerel Depolama Mimarisi',
        eyebrow: 'Cihazda Kayıt',
        externalUrl: urls.privacy,
        intro: 'Uygulama bulut veritabanı yerine tamamen cihaz içi yerel depolama kullanır.',
        sections: [
          {
            title: 'Kullanılan yerel alanlar',
            items: [
              'IndexedDB: değerlendirme oturumları, cevap anahtarları, öğrenci sonuçları ve işlem günlüğü.',
              'localStorage: tema modu, renk teması, dil tercihi, hareket azaltma ve kenar çubuğu durumu.',
              'Cache Storage (yalnızca Web PWA): çevrimdışı çalışma için uygulama kabuğu dosyaları.',
            ],
          },
          {
            title: 'Kalıcı olarak saklanmayan veriler',
            paragraphs: [
              'Kaynak fotoğraf, PDF ve ZIP dosyaları kalıcı veritabanına yazılmaz; her sayfa işlendikten sonra bellekten serbest bırakılır.',
            ],
          },
        ],
      },
      cookies: {
        id: 'cookies',
        routePath: '/cerez-politikasi',
        title: 'Çerez Politikası',
        eyebrow: 'İzleme Tercihleri',
        externalUrl: urls.cookies,
        intro: 'Optik Form Okuyucu reklam, analitik veya oturum izleme çerezi kullanmaz.',
        sections: [
          {
            title: 'Sıfır izleme ilkesi',
            paragraphs: [
              'Uygulama tarafından herhangi bir üçüncü taraf reklam, analitik veya çapraz site çerezi oluşturulmaz. Görünüm ve dil tercihleri yalnızca cihazınızdaki localStorage alanında tutulur.',
            ],
          },
        ],
      },
      licenses: {
        id: 'licenses',
        routePath: '/acik-kaynak-lisanslari',
        title: 'Açık Kaynak Lisansları',
        eyebrow: 'Üçüncü Taraf Bileşenler',
        externalUrl: urls.hub,
        intro: 'Bu ürün aşağıdaki açık kaynak kütüphanelerden yararlanır. Telif ve lisans bildirimleri ilgili paketlerde korunur.',
        sections: [
          {
            title: 'Masaüstü & Çalışma Zamanı Bileşenleri',
            items: [
              'Tauri 2 — Apache-2.0 / MIT License',
              'OpenCV.js (@techstark/opencv-js) — Apache License 2.0',
              'PDF.js (pdfjs-dist) — Apache License 2.0',
              'React & React DOM & React Router — MIT License',
              'Lucide React — ISC License',
              'idb — ISC License',
              'ExcelJS — MIT License',
              'jsPDF & jsPDF-AutoTable — MIT License',
              'JSZip — MIT / GPL-3.0-or-later',
            ],
          },
          {
            title: 'Geliştirme Araçları',
            items: [
              'Vite — MIT License',
              'TypeScript — Apache License 2.0',
              'Vitest & Testing Library — MIT License',
              'Sharp — Apache License 2.0',
            ],
          },
        ],
      },
      accessibility: {
        id: 'accessibility',
        routePath: '/erisilebilirlik',
        title: 'Erişilebilirlik Bildirimi',
        eyebrow: 'WCAG 2.2 AA Hedefi',
        externalUrl: urls.support,
        intro: `${company}, Optik Form Okuyucu arayüzünü klavye kullanıcıları ve yardımcı teknolojiler için erişilebilir kılmayı hedefler.`,
        sections: [
          {
            title: 'Uygulanan erişilebilirlik önlemleri',
            items: [
              'Tam klavye navigasyonu, odak halkaları ve hızlı kısayollar (Ctrl+B, Ctrl+,, Alt+1–5).',
              '14 renk teması × Açık/Koyu mod (28 yüksek kontrastlı görünüm seçeneği).',
              'Hareketleri Azalt (Reduce Motion) ayarı ve sistem prefers-reduced-motion uyumu.',
              'RTL (sağdan sola) dil yönü ve semantik ARIA rol/etiket desteği.',
            ],
          },
          {
            title: 'Geri bildirim',
            paragraphs: [
              `Erişilebilirlik öneri ve bildirimleriniz için ${emails.support} adresinden destek ekibimize ulaşabilirsiniz.`,
            ],
          },
        ],
      },
      contact: {
        id: 'contact',
        routePath: '/iletisim',
        title: 'İletişim & Destek',
        eyebrow: company,
        externalUrl: urls.contact,
        intro: `Optik Form Okuyucu, ${company} tarafından tasarlanmış ve geliştirilmiştir.`,
        sections: [
          {
            title: 'Resmî E-posta Kanalları',
            items: [
              `Genel İletişim: ${emails.contact}`,
              `Teknik Destek & Microsoft Store: ${emails.support}`,
              `Gizlilik & KVKK / GDPR: ${emails.privacy}`,
              `Hukuk & Lisans: ${emails.legal}`,
              `Güvenlik Bildirimi: ${emails.security}`,
              `Faturalama: ${emails.billing}`,
            ],
          },
          {
            title: 'Kurumsal Bilgiler',
            paragraphs: [
              `Resmî şirket kayıt ve iletişim bilgilerimiz her zaman güncel olarak ${urls.companyInformation} sayfasında yayınlanmaktadır.`,
            ],
          },
        ],
      },
    };
  }

  return {
    privacy: {
      id: 'privacy',
      routePath: '/gizlilik',
      title: 'Privacy Policy',
      eyebrow: 'Data Privacy',
      externalUrl: urls.privacy,
      intro: `Optical Form Reader by ${company} processes all exam sheets and student grades strictly on your device. No telemetry, advertising, or cloud uploads occur.`,
      sections: [
        {
          title: 'On-Device Processing Model',
          paragraphs: [
            'Answer keys, student IDs, marked choices, scores, and assessment titles are processed and stored exclusively on your device (IndexedDB). Scanned images and PDF pages are released from memory immediately after grading and are never sent to any external server.',
          ],
        },
        {
          title: 'Camera & Local File Access',
          paragraphs: [
            'The optional live webcam scanner analyzes optical frames strictly in memory with your explicit OS/browser permission. Camera frames are never recorded, stored, or transmitted externally.',
          ],
        },
        {
          title: 'User Data Control & Deletion',
          paragraphs: [
            'You can export full JSON/ZIP backups or permanently delete individual or all records at any time from the Data section. On Windows 11 Desktop, local records remain inside your private Windows user profile.',
          ],
        },
        {
          title: 'Contact & Authoritative Policy',
          paragraphs: [
            `For privacy or data rights requests, email ${emails.privacy}. The authoritative corporate privacy policy is published at ${urls.privacy}, and official company details are published at ${urls.companyInformation}.`,
          ],
        },
      ],
    },
    kvkk: {
      id: 'kvkk',
      routePath: '/kvkk-aydinlatma',
      title: 'KVKK & GDPR Data Notice',
      eyebrow: 'Data Protection Compliance',
      externalUrl: urls.kvkk,
      intro: `Information notice explaining how Optical Form Reader by ${company} operates under a zero-collection local-first architecture.`,
      sections: [
        {
          title: 'Publisher & Scope',
          paragraphs: [
            `Published by ${company} (official company details: ${urls.companyInformation}). Vellium does not receive, store, or process uploaded optical sheets or student grade data. Educators and institutions using the software remain the independent data controllers for their own students.`,
          ],
        },
        {
          title: 'Locally Processed Categories',
          items: [
            'Student IDs and optional class roster names: matched locally for scorecards.',
            'Marked bubble choices and calculated grades: computed locally for reporting.',
            'Assessment metadata and timestamps: organized inside local storage.',
          ],
        },
        {
          title: 'Data Rights Inquiries',
          paragraphs: [
            `Reach our privacy team at ${emails.privacy} or submit a formal inquiry via ${urls.dataRequests}.`,
          ],
        },
      ],
    },
    terms: {
      id: 'terms',
      routePath: '/kullanim-kosullari',
      title: 'Terms of Use (EULA)',
      eyebrow: 'License & Terms',
      externalUrl: urls.terms,
      intro: `These terms govern your use of the Optical Form Reader Windows 11 desktop and web application published by ${company}.`,
      sections: [
        {
          title: 'Nature of the Software',
          paragraphs: [
            'Optical Form Reader is a local-first optical mark recognition and grading tool. It requires no user account and provides no remote cloud backup service.',
          ],
        },
        {
          title: 'Permitted Use',
          items: [
            'Process only exam forms and student rosters you are authorized to handle.',
            'Verify flagged or low-confidence detections against source sheets prior to issuing official grades.',
            'Do not use the application for unlawful purposes or in violation of privacy laws.',
          ],
        },
        {
          title: 'Intellectual Property',
          paragraphs: [
            `All rights to the Optical Form Reader interface, branding, and the Vellium trademark belong to ${company}. Legal inquiries: ${emails.legal}.`,
          ],
        },
      ],
    },
    disclaimer: {
      id: 'disclaimer',
      routePath: '/sorumluluk-reddi',
      title: 'Grading Accuracy Disclaimer',
      eyebrow: 'Verification Notice',
      externalUrl: urls.terms,
      intro: 'Optical grading outputs are assistive tools and should be reviewed by an authorized educator before finalizing official academic decisions.',
      sections: [
        {
          title: 'Scanning & Print Factors',
          paragraphs: [
            'Heavy shadows, extreme skew, low camera resolution, print scaling distortion, incomplete erasures, or double marks can affect optical detection accuracy. Always review ambiguous marks.',
          ],
        },
        {
          title: 'Backup Responsibility',
          paragraphs: [
            'Because data stays strictly local, export JSON/ZIP and Excel backups regularly to protect against hardware failure or OS profile resets.',
          ],
        },
      ],
    },
    storage: {
      id: 'storage',
      routePath: '/yerel-depolama',
      title: 'Local Storage Architecture',
      eyebrow: 'On-Device Storage',
      externalUrl: urls.privacy,
      intro: 'Optical Form Reader stores data locally on your device rather than in remote cloud servers.',
      sections: [
        {
          title: 'Local Storage Mechanisms',
          items: [
            'IndexedDB: assessment sessions, answer keys, student results, and processing manifests.',
            'localStorage: theme mode, color theme, language preference, reduced motion, and sidebar state.',
            'Cache Storage (Web PWA only): offline shell assets.',
          ],
        },
        {
          title: 'Data Never Persisted',
          paragraphs: [
            'Raw JPG, PNG, WebP, PDF, and ZIP files are never persisted to IndexedDB; image buffers and OpenCV matrices are released as soon as each sheet finishes processing.',
          ],
        },
      ],
    },
    cookies: {
      id: 'cookies',
      routePath: '/cerez-politikasi',
      title: 'Cookie Policy',
      eyebrow: 'Zero Tracking',
      externalUrl: urls.cookies,
      intro: 'Optical Form Reader does not set advertising, analytics, or cross-site tracking cookies.',
      sections: [
        {
          title: 'No Tracking Cookies',
          paragraphs: [
            'No first-party or third-party marketing or telemetry cookies are created by the application. UI preferences are saved exclusively in local device storage.',
          ],
        },
      ],
    },
    licenses: {
      id: 'licenses',
      routePath: '/acik-kaynak-lisanslari',
      title: 'Open Source Licenses',
      eyebrow: 'Third-Party Notices',
      externalUrl: urls.hub,
      intro: 'This application uses the following open-source libraries. Their respective copyright and license notices remain intact.',
      sections: [
        {
          title: 'Desktop & Runtime Libraries',
          items: [
            'Tauri 2 — Apache-2.0 / MIT License',
            'OpenCV.js (@techstark/opencv-js) — Apache License 2.0',
            'PDF.js (pdfjs-dist) — Apache License 2.0',
            'React, React DOM & React Router — MIT License',
            'Lucide React — ISC License',
            'idb — ISC License',
            'ExcelJS — MIT License',
            'jsPDF & jsPDF-AutoTable — MIT License',
            'JSZip — MIT / GPL-3.0-or-later',
          ],
        },
        {
          title: 'Build & Tooling',
          items: [
            'Vite — MIT License',
            'TypeScript — Apache License 2.0',
            'Vitest & Testing Library — MIT License',
            'Sharp — Apache License 2.0',
          ],
        },
      ],
    },
    accessibility: {
      id: 'accessibility',
      routePath: '/erisilebilirlik',
      title: 'Accessibility Statement',
      eyebrow: 'WCAG 2.2 AA Target',
      externalUrl: urls.support,
      intro: `${company} designs Optical Form Reader to be keyboard-accessible, clear, and usable with assistive technologies.`,
      sections: [
        {
          title: 'Implemented Measures',
          items: [
            'Full keyboard navigation, visible focus rings, and desktop shortcuts (Ctrl+B, Ctrl+,, Alt+1–5).',
            '14 color themes × Light/Dark mode (28 high-contrast themes).',
            'Reduce Motion toggle honoring system prefers-reduced-motion.',
            'Full RTL layout direction and semantic ARIA labels.',
          ],
        },
        {
          title: 'Feedback',
          paragraphs: [
            `Report any accessibility barriers to ${emails.support}.`,
          ],
        },
      ],
    },
    contact: {
      id: 'contact',
      routePath: '/iletisim',
      title: 'Contact & Support',
      eyebrow: company,
      externalUrl: urls.contact,
      intro: `Optical Form Reader is designed and engineered by ${company}.`,
      sections: [
        {
          title: 'Official @vellium.dev Mailboxes',
          items: [
            `General Contact: ${emails.contact}`,
            `Support & Microsoft Store Help: ${emails.support}`,
            `Privacy & KVKK/GDPR: ${emails.privacy}`,
            `Legal & Licensing: ${emails.legal}`,
            `Security Disclosure: ${emails.security}`,
            `Billing: ${emails.billing}`,
          ],
        },
        {
          title: 'Official Company Information',
          paragraphs: [
            `Authoritative corporate registration details are published live at ${urls.companyInformation}.`,
          ],
        },
      ],
    },
  };
}
