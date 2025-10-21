/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { fallbackImages } from '../data/fallbackData';

// Using NASA's public DEMO_KEY. For production apps, users should get their own.
const NASA_API_KEY = 'DEMO_KEY';
const APOD_API_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
const SBDB_API_URL = 'https://ssd-api.jpl.nasa.gov/sbdb.api';

export interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
}

/**
 * A wrapper for the fetch API that includes retry logic with exponential backoff.
 * This makes API calls more resilient to transient network errors or temporary server issues.
 * @param url The URL to fetch.
 * @param retries The number of times to retry the request.
 * @param initialDelay The initial delay between retries in milliseconds.
 * @returns A Promise that resolves to the Response object.
 */
const fetchWithRetry = async (url: string, retries = 3, initialDelay = 1000): Promise<Response> => {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            // If the request is successful, return the response.
            if (response.ok) {
                return response;
            }

            // Special handling for client errors (4xx).
            if (response.status >= 400 && response.status < 500) {
                // For "Too Many Requests", we want to retry.
                if (response.status === 429) {
                    console.warn(`Attempt ${i + 1}/${retries} failed with status 429 (Too Many Requests). Retrying in ${delay}ms...`);
                    // Fall through to the delay and retry logic below.
                } else {
                    // For other client errors (e.g., 404 Not Found), fail immediately.
                    throw new Error(`API request failed with client error: ${response.status}`);
                }
            } else {
                // For server errors (5xx), log a warning and prepare to retry.
                console.warn(`Attempt ${i + 1}/${retries} failed with status ${response.status}. Retrying in ${delay}ms...`);
            }
        } catch (error) {
            // This catches network errors (e.g., "Failed to fetch").
            // If this is the last attempt, rethrow the error. Otherwise, log and prepare to retry.
            if (i === retries - 1) throw error;
            console.warn(`Attempt ${i + 1}/${retries} failed with a network error. Retrying in ${delay}ms...`);
        }
        // Wait for the specified delay before the next attempt.
        await new Promise(res => setTimeout(res, delay));
        // Double the delay for the next retry (exponential backoff).
        delay *= 2;
    }
    // If all retries fail, throw an error.
    throw new Error(`Failed to fetch from API at ${url} after ${retries} attempts.`);
};


/**
 * Fetches data for a given small body from NASA's Small-Body Database.
 * @param objectName The name of the celestial object (e.g., 'Eros', 'C/2022 E3').
 * @returns A string containing relevant data, or null if not found or on error.
 */
export async function getSmallBodyData(objectName: string): Promise<string | null> {
    const specialObjects: Record<string, string> = {
        'c/2027 k1 (kristal)': "Object: C/2027 K1 (Kristal), Classification: Crystalline Anomaly, Anomaly: Emitting a structured, complex signal. Composition appears to be a non-baryonic crystalline lattice. Source unknown.",
        'p/2028 p1 (yaşam)': "Object: P/2028 P1 (Yaşam), Classification: Organic Trail Comet, Anomaly: Shedding a tail rich in complex polypeptides and RNA precursors. Potential panspermia vector.",
        'x/1882 r1 (hayalet)': "Object: X/1882 R1 (Hayalet), Classification: Temporal Echo, Anomaly: Object exhibits intermittent tangibility. Appears to be a spacetime echo of a disintegrated comet, trapped in a localized gravitational lensing effect.",
      };
      
      const lowerObjectName = objectName.toLowerCase().replace(/\s+/g, ' ').trim();

      // Check for full name or aliases in mission-critical objects first
      for (const key in specialObjects) {
          if (key.includes(lowerObjectName)) {
              return Promise.resolve(specialObjects[key]);
          }
      }

    // Heuristic check to prevent API calls with descriptive, unqueryable text from the image.
    // The SBDB API requires specific object names (e.g., "Eros", "C/2022 E3"), not descriptions.
    const descriptiveKeywords = ['kısmındaki', 'bulunan', 'üzerindeki', 'alttaki', 'üstteki', 'ortasındaki', 'görüntünün', 'bulutsuyu', 'galaksinin', 'bulutunun'];
    const isDescriptive = descriptiveKeywords.some(keyword => lowerObjectName.includes(keyword)) || lowerObjectName.split(' ').length > 5;

    if (isDescriptive) {
        console.warn(`'${objectName}' is a descriptive phrase, not a celestial object name. Skipping NASA SBDB query.`);
        return null;
    }

    try {
        const url = `${SBDB_API_URL}?sstr=${encodeURIComponent(objectName)}&phys-par=1`;
        const response = await fetchWithRetry(url);
        const data = await response.json();

        if (data.count === "0" || !data.object) {
            console.warn(`Object '${objectName}' not found in NASA SBDB.`);
            return null;
        }
        
        const { object, phys_par } = data;
        let formattedData = `Object: ${object.fullname}, Orbit Class: ${object.orbit_class.name}`;
        if (phys_par) {
            const diameter = phys_par.find((p: any) => p.name === 'diameter');
            const extent = phys_par.find((p: any) => p.name === 'extent');
            if (diameter) {
                formattedData += `, Diameter: ${diameter.value} km`;
            }
            if (extent) {
                formattedData += `, Dimensions: ${extent.value} km`;
            }
        }
        return formattedData;
    } catch (error) {
        // Now catches errors from fetchWithRetry after all attempts have failed.
        console.error(`Failed to fetch small body data for '${objectName}':`, error);
        return null; // Return null on error to prevent application state lock
    }
}

/**
 * Fetches the NASA Astronomy Picture of the Day.
 * Filters out video results as we only want to process images.
 * Provides a random fallback from a predefined list if the API fails.
 */
export async function getAstronomyPictureOfTheDay(): Promise<ApodData> {
  try {
    const response = await fetchWithRetry(APOD_API_URL);
    const data: ApodData = await response.json();

    if (data.media_type !== 'image') {
        console.warn('Bugünün APOD\'u bir video. Yedek görüntü kullanılıyor.');
        return {
            title: 'Orion Bulutsusu',
            explanation: 'Bugünün APOD\'u bir video olduğu için statik bir görüntü yüklendi. Bu, yeni yıldızların doğduğu bir yıldız fidanlığı olan büyüleyici Orion Bulutsusu. Güzel renkleri, içindeki genç, sıcak yıldızlar tarafından aydınlatılan parlayan gaz bulutlarından geliyor.',
            url: 'https://apod.nasa.gov/apod/image/2301/OrionNebula_Mellinger_1021.jpg',
            media_type: 'image'
        }
    }

    return data;
  } catch (error) {
    // Now catches errors from fetchWithRetry after all attempts have failed.
    console.error('NASA APOD verisi alınamadı, yedek veri havuzundan seçiliyor:', error);
    
    // Select a random fallback image from the list.
    const randomIndex = Math.floor(Math.random() * fallbackImages.length);
    const fallbackData = fallbackImages[randomIndex];
    
    return fallbackData;
  }
}