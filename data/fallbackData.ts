/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { ApodData } from '../services/nasaService';

// This data serves as a fallback when the NASA APOD API is unavailable.
// It simulates drawing from other major space agency archives like ESA.
export const fallbackImages: ApodData[] = [
    {
        title: 'Karina Bulutsusu (JWST)',
        explanation: 'NASA veri akışı kullanılamıyor. Bu yedek görüntü, James Webb Uzay Teleskobu tarafından çekilen Karina Bulutsusu\'ndaki "Kozmik Uçurumlar"ı göstermektedir. Bu, yeni yıldızların doğduğu bir yıldız oluşum bölgesidir. // Kaynak: NASA/JPL Arşivleri.',
        url: 'https://photojournal.jpl.nasa.gov/jpeg/PIA25121.jpg',
        media_type: 'image',
    },
    {
        title: 'Yaratılış Sütunları (Hubble)',
        explanation: 'NASA veri akışı kullanılamıyor. Bu yedek görüntü, Hubble Uzay Teleskobu tarafından çekilen Kartal Bulutsusu\'ndaki ikonik "Yaratılış Sütunları"nı göstermektedir. Bu devasa yapılar, yeni doğmuş yıldızların yoğun radyasyonu tarafından şekillendirilen yıldızlararası gaz ve toz bulutlarıdır. // Kaynak: NASA/JPL Arşivleri.',
        url: 'https://photojournal.jpl.nasa.gov/jpeg/PIA18904.jpg',
        media_type: 'image',
    },
    {
        title: 'Yengeç Bulutsusu',
        explanation: 'NASA veri akışı kullanılamıyor. Bu yedek görüntü, 1054 yılında gözlemlenen bir süpernova patlamasının kalıntısı olan Yengeç Bulutsusu\'nu göstermektedir. Merkezinde hızla dönen bir nötron yıldızı (pulsar) bulunur. // Kaynak: NASA/JPL Arşivleri.',
        url: 'https://photojournal.jpl.nasa.gov/jpeg/PIA09260.jpg',
        media_type: 'image',
    },
    {
        title: 'Andromeda Galaksisi (WISE)',
        explanation: 'NASA veri akışı kullanılamıyor. Bu yedek görüntü, NASA\'nın Geniş Alan Kızılötesi Tarama Gezgini (WISE) tarafından çekilen komşu galaksimiz Andromeda\'nın kızılötesi bir portresidir. // Kaynak: NASA/JPL-Caltech Arşivleri.',
        url: 'https://photojournal.jpl.nasa.gov/jpeg/PIA15211.jpg',
        media_type: 'image',
    }
];