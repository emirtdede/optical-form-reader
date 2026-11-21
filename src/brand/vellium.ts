/**
 * Official Vellium Teknoloji Anonim Şirketi Brand, Signature & Legal Standard.
 * Never fabricate company street address, MERSIS, or VKN - always direct users
 * to the authoritative live Company Information page on vellium.dev.
 */

export const APP_VERSION = '1.0.0';

export const VELLIUM_BRAND = {
  brandName: 'Vellium',
  companyFullName: 'Vellium Teknoloji Anonim Şirketi',
  website: 'https://vellium.dev',
  productWebUrl: 'https://optikformokuyucu.com',
  repositoryUrl: 'https://github.com/emirtdede/optical-form-reader',
  githubOrgUrl: 'https://github.com/VelliumHQ',
  sponsorUrl: 'https://github.com/sponsors/emirtdede',
  msix: {
    identityName: 'Vellium.OpticalFormReader',
    publisher: 'CN=1DDB196A-421B-4090-8DC2-62C1AD43C8F0',
    publisherDisplayName: 'Vellium',
    tauriIdentifier: 'dev.vellium.opticalformreader',
  },
  emails: {
    contact: 'contact@vellium.dev',
    support: 'support@vellium.dev',
    privacy: 'privacy@vellium.dev',
    legal: 'legal@vellium.dev',
    security: 'security@vellium.dev',
    billing: 'billing@vellium.dev',
  },
  legalUrls: {
    en: {
      hub: 'https://vellium.dev/en/legal',
      companyInformation: 'https://vellium.dev/en/legal/company-information',
      privacy: 'https://vellium.dev/en/legal/privacy',
      terms: 'https://vellium.dev/en/legal/terms',
      support: 'https://vellium.dev/en/legal/support',
      security: 'https://vellium.dev/en/legal/security',
      securityDisclosure: 'https://vellium.dev/en/legal/security-disclosure',
      kvkk: 'https://vellium.dev/en/legal/kvkk-notice',
      cookies: 'https://vellium.dev/en/legal/cookies',
      acceptableUse: 'https://vellium.dev/en/legal/acceptable-use',
      trademark: 'https://vellium.dev/en/legal/trademark',
      dataRequests: 'https://vellium.dev/en/legal/data-requests',
      productsLegalHub: 'https://vellium.dev/en/legal/products',
      contact: 'https://vellium.dev/en/contact',
    },
    tr: {
      hub: 'https://vellium.dev/tr/yasal',
      companyInformation: 'https://vellium.dev/tr/yasal/sirket-bilgileri',
      privacy: 'https://vellium.dev/tr/yasal/gizlilik-politikasi',
      terms: 'https://vellium.dev/tr/yasal/hizmet-kosullari',
      support: 'https://vellium.dev/tr/yasal/destek-politikasi',
      security: 'https://vellium.dev/tr/yasal/guvenlik-yaklasimi',
      securityDisclosure: 'https://vellium.dev/tr/yasal/guvenlik-acigi-bildirimi',
      kvkk: 'https://vellium.dev/tr/yasal/kvkk-aydinlatma-metni',
      cookies: 'https://vellium.dev/tr/yasal/cerez-politikasi',
      acceptableUse: 'https://vellium.dev/tr/yasal/kabul-edilebilir-kullanim',
      trademark: 'https://vellium.dev/tr/yasal/ticari-marka-politikasi',
      dataRequests: 'https://vellium.dev/tr/yasal/kisisel-veri-basvurulari',
      productsLegalHub: 'https://vellium.dev/tr/yasal/urunler',
      contact: 'https://vellium.dev/tr/iletisim',
    },
  },
  social: {
    github: 'https://github.com/VelliumHQ',
    linkedin: 'https://www.linkedin.com/company/vellium/',
    x: 'https://x.com/VelliumDev',
    productHunt: 'https://www.producthunt.com/@vellium',
    instagram: 'https://www.instagram.com/velliumdev/',
    threads: 'https://www.threads.com/@velliumdev',
    reddit: 'https://www.reddit.com/user/VelliumDev/',
    discord: 'https://discord.gg/ur9KBZBEdj',
  },
} as const;

export function getVelliumLegalUrls(lang: string) {
  return lang === 'tr' ? VELLIUM_BRAND.legalUrls.tr : VELLIUM_BRAND.legalUrls.en;
}
