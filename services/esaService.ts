/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { fallbackImages } from '../data/fallbackData';
import type { ApodData } from './nasaService';

/**
 * Simulates fetching a "Picture of the Day" from an ESA archive.
 * Since a simple, public, unauthenticated ESA API for this is not readily available,
 * this function uses the existing fallback data which contains images sourced
 * from ESA/Hubble and ESA/Webb archives. This provides the desired data source diversity.
 *
 * @returns A Promise that resolves to ApodData for a random image.
 */
export async function getEsaPictureOfTheDay(): Promise<ApodData> {
  console.log("ESA veri akışı sorgulanıyor...");

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200));

  // Select a random image from our "ESA archives" (the fallback data)
  const randomIndex = Math.floor(Math.random() * fallbackImages.length);
  const esaData = fallbackImages[randomIndex];

  console.log("ESA'dan veri alındı:", esaData.title);
  
  // Create a new object to avoid potential mutation issues
  return { ...esaData };
}
