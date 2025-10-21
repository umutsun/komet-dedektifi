/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { MissionStep } from './types';

// Bu görevler, her biri kendi içinde bir macera olan bağımsız senaryolar olarak tasarlanmıştır.
// Gelecekte, oyuncunun bu görevler arasından seçim yapabileceği bir arayüz eklenebilir.
export const missionData: MissionStep[] = [
  {
    id: 'mission-1',
    story: '', // Gelecekteki geliştirmeler için boş bırakıldı
    objective: `Tuhaf, kristal bir yapıya sahip gibi görünen 'C/2027 K1 (Kristal)' kuyruklu yıldızından gelen karmaşık bir sinyali araştırın. Sinyali çözün ve kaynağını belirleyin.`,
    successPromptKeywords: ['çöz', 'sinyal analizi', 'kristal tara'],
    imagePrompt: `Derin uzayın ortasında, içinden kristal bir kafesin parladığı bir kuyruklu yıldız. Gizemli bir enerji yayıyor. Sinematik, yüksek detaylı.`,
    videoPrompt: '' // Gelecekteki geliştirmeler için boş bırakıldı
  },
  {
    id: 'mission-2',
    story: '', // Gelecekteki geliştirmeler için boş bırakıldı
    objective: `Panspermi hipotezini düşündüren karmaşık organik moleküllerden oluşan bir iz bırakan 'P/2028 P1 (Yaşam)' kuyruklu yıldızını inceleyin. Kuyruğun bileşimini analiz edin.`,
    successPromptKeywords: ['örnek al', 'bileşim analizi', 'organik tara'],
    imagePrompt: `Koyu renkli bir kuyruklu yıldızın, organik bileşikleri temsil eden canlı, renkli, bulutsu benzeri bir kuyruğu var. Bilimsel bir estetik, gerçekçi aydınlatma.`,
    videoPrompt: '' // Gelecekteki geliştirmeler için boş bırakıldı
  },
  {
    id: 'mission-3',
    story: '', // Gelecekteki geliştirmeler için boş bırakıldı
    objective: `'X/1882 R1 (Hayalet)' kuyruklu yıldızının etrafındaki yerel bir uzay-zaman anomalisini araştırın. Bu hayalet nesneyi incelemek için bir graviton ışını kullanarak anomaliyi stabilize edin.`,
    successPromptKeywords: ['stabilize et', 'graviton ışını', 'anomali analizi'],
    imagePrompt: `Etrafında uzayda dalgalanmalar gibi gözle görülür uzay-zaman bozulmaları olan yarı saydam, hayalet gibi bir kuyruklu yıldız. Ürkütücü ve atmosferik bir sahne.`,
    videoPrompt: '' // Gelecekteki geliştirmeler için boş bırakıldı
  }
];