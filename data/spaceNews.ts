/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface SpaceNewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  timestamp: string;
}

export const spaceNewsData: SpaceNewsItem[] = [
  {
    id: 'sn-2024-01',
    headline: "JWST, Ötegezegen Atmosferinde Beklenmedik Biyo-imzalar Tespit Etti",
    summary: "James Webb Uzay Teleskobu, K2-18b ötegezegeninin atmosferinde, potansiyel olarak biyolojik kökenli olan dimetil sülfit (DMS) molekülünü tespit etti. Kesin olmamakla birlikte, bu bulgu dünya dışı yaşam arayışında önemli bir adımdır.",
    source: "ESA Bülteni",
    timestamp: "2024-07-15T14:30:00Z",
  },
  {
    id: 'sn-2024-02',
    headline: "Güneş Döngüsü 25, Tahmin Edilenden Daha Erken Zirve Yapıyor",
    summary: "Mevcut güneş döngüsü, bilim insanlarının tahminlerinden daha güçlü ve daha erken bir zirveye ulaşıyor. Bu durum, önümüzdeki aylarda Dünya yörüngesindeki uydular ve güç şebekeleri için artan bir risk anlamına geliyor.",
    source: "NASA Gözlemevi",
    timestamp: "2024-07-14T09:00:00Z",
  },
  {
    id: 'sn-2024-03',
    headline: "Özel Şirket, Mars'a Kargo Görevi İçin Yeni Roketini Tanıttı",
    summary: "'Stellar Cargo' şirketi, Mars'a 100 tona kadar yük taşıyabilen yeniden kullanılabilir 'Pioneer' roketini tanıttı. İlk test uçuşunun 2025'in başlarında yapılması planlanıyor.",
    source: "SpaceNews",
    timestamp: "2024-07-13T18:45:00Z",
  },
  {
    id: 'sn-2024-04',
    headline: "Kara Delik Birleşmesinden Gelen Gravitasyonel Dalgalar Yeni Fiziğe İşaret Ediyor",
    summary: "LIGO ve Virgo gözlemevleri, beklenmedik kütlelere sahip iki kara deliğin birleşmesinden kaynaklanan gravitasyonel dalgaları kaydetti. Bu olay, Einstein'ın genel görelilik teorisinin ötesinde yeni fizik teorilerinin kapısını aralıyor.",
    source: "Caltech Fizik Enstitüsü",
    timestamp: "2024-07-12T11:20:00Z",
  },
];