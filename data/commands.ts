/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Command {
  command: string;
  description: string;
}

export const commandDictionary: Record<string, Command[]> = {
  "HAL_KOMUTLARI": [
    { command: 'sistem_durumu', description: 'Tüm gemi sistemlerinin genel durumunu rapor eder.' },
    { command: 'anomali_taraması_yap', description: 'Yakındaki olağandışı enerji imzalarını veya nesneleri tespit eder.' },
    { command: 'kuyrukluyıldız_analizi', description: 'Hedef kuyruklu yıldızın kimyasal yapısını belirler.' },
    { command: 'kalkanlara_güç_ver', description: 'Savunma kalkanlarını güçlendirmek için enerjiyi yönlendirir.' },
    { command: 'diagnostik_çalıştır', description: 'Tüm birincil gemi sistemlerinde temel bir kontrol gerçekleştirir.' },
  ],
  "TELESKOP_KOMUTLARI": [
    { command: 'görüntüle_M31', description: 'Andromeda Galaksisi\'nin bir görüntüsünü yakalar.' },
    { command: 'görüntüle_Orion_Bulutsusu', description: 'Orion Bulutsusu\'nun detaylı bir fotoğrafını çeker.' },
    { command: 'nasa_istek_günün_resmi', description: 'NASA\'nın Günün Astronomi Fotoğrafını getirir.' },
    { command: 'teleskop_görüntüsünü_yenile', description: 'Mevcut teleskop görüntüsünü yeniden oluşturur.' },
  ],
  "ASTROBOT_GÖREVLERİ": [
    { command: 'görev_tasarla_keşif_botu', description: 'Gezegen yüzeylerini keşfetmek için bir bot tasarlar.' },
    { command: 'görev_tasarla_tamir_dronu', description: 'Gemi dışı onarımlar için küçük bir dron tasarlar.' },
  ],
  "TOPLANTI_PROTOKOLLERİ": [
    { command: 'kayıtları_göster_ilk_temas', description: 'Kristal varlıklarla yapılan ilk temasın kaydını açar.' },
    { command: 'çağrı_başlat_yıldız_filosu', description: 'Yıldız Filosu Komutanlığı ile güvenli bir iletişim kanalı başlatır.' },
  ],
};

export const allCommands: Command[] = Object.values(commandDictionary).flat();
