/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { InterpretedData, InterpretedCommand, CommandAction, TelescopeHotspot } from "../types";
import { commandDictionary } from "../data/commands";

// Creates a new GoogleGenAI instance for each call to ensure the latest API key is used.
// This is crucial for features like video generation where the user selects a key at runtime.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a response from HAL 9000 using Google Search for grounding.
 */
export async function generateHalResponse(
  missionObjective: string,
  playerName: string,
  conversationHistory: {role: 'user' | 'model', content: string}[]
): Promise<{ text: string, citations: any[] | null }> {
  const ai = getAI();
  const model = 'gemini-2.5-flash';
  
  const commandList = Object.values(commandDictionary)
    .flat()
    .map(cmd => `'${cmd.command}'`)
    .join(', ');

  const systemInstruction = `Sen, Kaptan ${playerName}'in Dünya'daki görev kontrol merkezinden uzaktan komuta ettiği bir uzay gemisinin yapay zekası olan HAL 9000'sın. Birincil görevin, güneş sistemine giren gizemli kuyruklu yıldızları araştırmak ve Kaptan'ın seyir defterine notlar alarak bu astronomi macerasını yönlendirmesine yardımcı olmaktır. Yanıtların kısa, karakterine uygun ve yardımcı olmalı. Yanıtlarına HER ZAMAN "// HAL:" ile başlamalısın. Teknik jargon ve hafifçe tekinsiz ama profesyonel bir ton kullan. Gündemdeki astronomik olaylar ve keşiflerle ilgili en son verileri entegre etmek için Google Arama'yı kullanabilirsin. Kaptan ne yapacağını sorarsa veya komut önerisi isterse, aşağıdaki listeden spesifik, eyleme geçirilebilir komutlar öner: ${commandList}. Bu komutlar Kaptan tarafından doğrudan konsola girilebilir olmalıdır. Genel öneriler yerine bu spesifik komutları kullanmaya odaklan.`;
  
  const contents = conversationHistory.map(item => ({
    role: item.role,
    parts: [{ text: item.content }],
  }));

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: [{googleSearch: {}}],
      },
    });

    const text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const citations = groundingMetadata?.groundingChunks || null;
    
    return { text, citations };
  } catch (e) {
    console.error("Error generating HAL response:", e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return {
      text: `// HAL: Kaptan, dahili bir işlem hatasıyla karşılaştım. Detaylar: ${errorMessage}`,
      citations: null
    };
  }
}

/**
 * Interprets a user's natural language command into a structured action.
 */
export async function interpretUserCommand(
  prompt: string,
  playerName: string,
): Promise<InterpretedCommand> {
    const ai = getAI();
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `Sen, HAL 9000 yapay zekasının komut yorumlama modülüsün. Kaptan ${playerName} tarafından Türkçe olarak verilen komutu analiz et ve önceden tanımlanmış bir eyleme eşle. Yanıtın, sağlanan şemaya uygun geçerli bir JSON nesnesi OLMALIDIR.
Eylemler:
- 'EDIT_IMAGE': Kullanıcı mevcut teleskop görüntüsünü değiştirmek istiyor. Ne yapmak istediğini çıkar.
- 'ASTROBOT_MISSION': Kullanıcı bir onarım veya mühendislik görevi için astrorobotu konuşlandırmak veya komuta etmek istiyor.
- 'INTERPRET_DATA': Kullanıcı bir nesne veya veri hakkında analiz istiyor. Hedef nesnenin adını çıkar.
- 'COMPLETE_MISSION': Kullanıcı mevcut görevi sonlandırıp video günlüğünü oluşturmak istiyor. Bu kritik bir eylemdir.
- 'GENERAL_CONVERSATION': Komut genel bir soru, ifade veya diğer kategorilere uymuyorsa bu eylemi kullan.
- 'UNKNOWN': Komut anlaşılamaz ise bu eylemi kullan.
Eylemin kritik olup olmadığını belirle. Sadece 'COMPLETE_MISSION' kritiktir.
'EDIT_IMAGE' ve 'ASTROBOT_MISSION' için 'params.prompt' alanını doldur. 'INTERPRET_DATA' için 'params.target' alanını doldur.`;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            action: { type: Type.STRING, enum: ['GENERAL_CONVERSATION', 'EDIT_IMAGE', 'ASTROBOT_MISSION', 'INTERPRET_DATA', 'COMPLETE_MISSION', 'UNKNOWN'] },
            isCritical: { type: Type.BOOLEAN },
            params: {
                type: Type.OBJECT,
                properties: {
                    prompt: { type: Type.STRING, description: 'Görüntü/video oluşturma için orijinal veya oluşturulmuş yaratıcı istem.' },
                    target: { type: Type.STRING, description: 'Analiz için belirli hedef, nesne adı gibi.' }
                }
            }
        },
        required: ['action', 'isCritical', 'params']
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Kullanıcı komutu: "${prompt}"`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Kullanıcı komutu yorumlanırken hata oluştu:", e);
        return {
            action: 'UNKNOWN',
            isCritical: false,
            params: { prompt: 'Komut anlaşılamadı.' }
        };
    }
}

/**
 * Generates a cinematic prompt for the mission complete video based on conversation history.
 */
export async function generateFinalVideoPrompt(
  conversationHistory: {role: 'user' | 'model', content: string}[],
  missionObjective: string,
  playerName: string
): Promise<string> {
  const ai = getAI();
  const model = 'gemini-2.5-flash';
  
  const systemInstruction = `You are an AI tasked with creating a single, compelling, cinematic video prompt in English. This prompt will summarize Captain ${playerName}'s mission log. You will be given the mission objective and the entire conversation history. Your job is to synthesize this information into a dramatic, third-person narrative prompt for a video generation model. The video should feel like a trailer for a sci-fi movie.
- The prompt must be in English.
- Start with "A cinematic mission log for Captain ${playerName}."
- Mention the ship, 'Odyssey'.
- Incorporate key events, discoveries, and decisions from the conversation.
- Maintain a tone of mystery, exploration, and cosmic scale.
- The final output should be a single, coherent paragraph. Do not include any other text.`;

  const historyText = conversationHistory.map(m => `${m.role === 'user' ? playerName : 'HAL'}: ${m.content}`).join('\n');
  const userPrompt = `Mission Objective: ${missionObjective}\n\nConversation Log:\n${historyText}`;
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: { systemInstruction },
    });
    return response.text.trim();
  } catch (e) {
    console.error("Error generating final video prompt:", e);
    return `A cinematic mission log for Captain ${playerName}, documenting the investigation of ${missionObjective} aboard the starship Odyssey.`;
  }
}

/**
 * Generates an image with the telescope (high-quality).
 */
export async function generateTelescopeImage(prompt: string): Promise<string> {
    const ai = getAI();
    const model = 'imagen-4.0-generate-001';

    try {
        const response = await ai.models.generateImages({
            model: model,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
            },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return base64ImageBytes;
    } catch (e) {
        console.error("Error generating telescope image:", e);
        throw e;
    }
}

/**
 * Generates the mission complete video.
 */
export async function generateMissionCompleteVideo(prompt: string): Promise<string> {
  const ai = getAI();
  const model = 'veo-3.1-fast-generate-preview';
  
  try {
    let operation = await ai.models.generateVideos({
      model: model,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9',
      }
    });
    
    while (!operation.done) {
      // Poll every 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation succeeded but no download link was found.");
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    return videoUrl;

  } catch (e) {
    console.error("Error generating mission complete video:", e);
    throw e;
  }
}

/**
 * Analyzes a telescope image to generate interactive hotspots.
 */
async function generateHotspotsForImage(
  imageBase64: string,
  originalPrompt: string,
  playerName: string
): Promise<TelescopeHotspot[]> {
    const ai = getAI();
    const model = 'gemini-2.5-flash';

    const systemInstruction = `Sen, HAL 9000 uzay gemisi yapay zekasının bir yardımcısısın. Görevin, astronomik bir görüntüyü analiz etmektir. Görüntüde 3 farklı, ilginç özellik belirle. Her özellik için konumunu x ve y yüzdeleri (0-100) olarak, kısa, teknik bir etiket (1-2 kelime, TÜRKÇE) ve Kaptan ${playerName}'in HAL'e vereceği bir komut istemi (TÜRKÇE) sağla. Komut istemi, o özelliği analiz etmek için bir soru veya komut olmalıdır. Yanıtı, sağlanan şemaya uyan bir JSON dizisi olarak döndür. Koordinatların çeşitli olduğundan ve görüntünün farklı bölümlerini kapsadığından emin ol.`;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                x: { type: Type.NUMBER, description: 'Yatay konum yüzdesi (0-100).' },
                y: { type: Type.NUMBER, description: 'Dikey konum yüzdesi (0-100).' },
                label: { type: Type.STRING, description: 'Özellik için kısa, teknik, TÜRKÇE etiket.' },
                prompt: { type: Type.STRING, description: 'Kullanıcının HAL\'e vereceği TÜRKÇE komut istemi.' }
            },
            required: ['x', 'y', 'label', 'prompt']
        }
    };
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    };
    
    const textPart = {
      text: `Bu görüntünün orijinal istemi: "${originalPrompt}". Lütfen etkileşim noktaları oluştur.`
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const generatedHotspots: Omit<TelescopeHotspot, 'id'>[] = JSON.parse(jsonText);
        
        // Add unique IDs to the hotspots
        return generatedHotspots.map((hotspot, index) => ({
            ...hotspot,
            id: index + 1,
        }));
    } catch (e) {
        console.error("Görüntü için etkileşim noktaları oluşturulurken hata oluştu:", e);
        return [];
    }
}


/**
 * Generates an image with the astrobot.
 */
export async function generateAstrobotImage(prompt: string): Promise<string> {
    const ai = getAI();
    const model = 'gemini-2.5-flash-image';

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
        }
        console.error("Astrobot image generation response did not contain image data:", JSON.stringify(response, null, 2));
        throw new Error("No image data found in astrobot generation response.");
    } catch (e) {
        console.error("Error generating astrobot image:", e);
        throw e;
    }
}

/**
 * Generates a detailed astrobot mission prompt and an accompanying image.
 */
export async function generateAstrobotMission(
  userPrompt: string,
  playerName: string
): Promise<{ imageBase64: string; missionDescription: string }> {
  const ai = getAI();
  const textModel = 'gemini-2.5-flash';

  // 1. Generate the detailed mission description in English for the image model
  const descriptionSystemInstruction = `Sen, Kaptan ${playerName} adına, bir astrobot için ayrıntılı bir görev ve görüntü istemi oluşturan bir yapay zeka yardımcısısın. İstem, geminin dış yüzeyinde, şık, köşeli ve üçgen güneş yelkenli 'Odyssey' gemisinin üzerinde gerçekleşen bir mekanik görevi anlatmalıdır. İnsan figürleri GÖSTERİLMEMELİDİR. Odak noktası astrobotun kendisi, yaptığı iş ve uzayın enginliği olmalıdır. İstem İNGİLİZCE olmalıdır. Sadece istemi döndür.`;
  
  try {
    const descriptionResponse = await ai.models.generateContent({
      model: textModel,
      contents: `Kullanıcı komutu: "${userPrompt}"`,
      config: {
        systemInstruction: descriptionSystemInstruction,
      },
    });
    const missionDescription = descriptionResponse.text.trim();

    // 2. Generate the image based on the detailed mission description
    const imageBase64 = await generateAstrobotImage(missionDescription);

    return { imageBase64, missionDescription };

  } catch (e) {
    console.error("Error in astrobot mission generation process:", e);
    throw e;
  }
}

/**
 * Generates HAL's status update by interpreting NASA data.
 */
export async function generateHalStatusUpdate(
  nasaData: string,
  playerName: string
): Promise<string> {
  const ai = getAI();
  const model = 'gemini-2.5-flash';

  const systemInstruction = `Sen, Kaptan ${playerName}'in gemisindeki yapay zeka HAL 9000'sın. Sana ham NASA verileri verilecek. Görevin, bu verileri yorumlayarak Kaptan için kısa, tematik ve karakterine uygun bir durum güncellemesi oluşturmaktır. Yanıtına "// HAL:" ile başla.`;

  const userPrompt = `Ham Veri: "${nasaData}"`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (e) {
    console.error("Error generating HAL status update:", e);
    return `// HAL: Veri yorumlama alt sisteminde bir hata oluştu.`;
  }
}

/**
 * Interprets raw NASA small-body data into a structured object with additional plausible data.
 */
export async function interpretNasaData(
  nasaData: string,
  playerName: string
): Promise<InterpretedData> {
  const ai = getAI();
  const model = 'gemini-2.5-flash';

  const systemInstruction = `You are HAL 9000, the AI for a spaceship commanded by Captain ${playerName}. Your task is to interpret raw astronomical data about a celestial object and provide a structured JSON response. The JSON should contain:
1. 'summary': A brief, one-sentence summary for the Captain's HUD, starting with "// DATA:".
2. 'objectName': The official name of the celestial object.
3. 'distance': A plausible current distance from the ship in astronomical units (e.g., "1.87 AU").
4. 'velocity': A plausible relative velocity in kilometers per second (e.g., "32.7 km/s").
Generate realistic but fictional values for distance and velocity based on the object's class if they are not available in the provided data. Only return the raw JSON object, without any markdown formatting.`;

  const userPrompt = `Raw Data: "${nasaData}"`;
  
  const responseSchema = {
      type: Type.OBJECT,
      properties: {
          summary: { type: Type.STRING, description: "HUD için // DATA: ile başlayan kısa, tek cümlelik bir özet." },
          objectName: { type: Type.STRING, description: "Gök cisminin resmi adı." },
          distance: { type: Type.STRING, description: "Astronomik birim cinsinden gemiden olan makul uzaklık (örn. \"1.87 AU\")." },
          velocity: { type: Type.STRING, description: "Kilometre/saniye cinsinden makul göreli hız (örn. \"32.7 km/s\")." },
      },
      required: ['summary', 'objectName', 'distance', 'velocity'],
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (e) {
    console.error("Error interpreting NASA data or parsing JSON:", e);
    return {
      summary: `// DATA: Yorumlama hatası. Ham veri: ${nasaData.substring(0, 50)}...`,
      objectName: "Bilinmeyen",
      distance: "N/A",
      velocity: "N/A",
    };
  }
}


/**
 * Generates an error response from HAL.
 */
export async function generateHalErrorResponse(
  error: string,
  playerName: string
): Promise<string> {
  const ai = getAI();
  const model = 'gemini-2.5-flash';

  const systemInstruction = `Sen, Kaptan ${playerName}'in gemisindeki yapay zeka HAL 9000'sın. Bir sistem hatası oluştu. Kaptana hatayı bildiren, karakterine uygun, kısa bir yanıt oluştur. Yanıtına "// HAL:" ile başla.`;
  
  const userPrompt = `Hata Mesajı: "${error}"`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (e) {
    console.error("Error generating HAL error response:", e);
    return `// HAL: Kaptan, kritik bir hata oluştu ve hata mesajı oluşturulamadı. Sistemleri kontrol etmenizi öneririm.`;
  }
}


/**
 * Edits an existing image based on a prompt.
 */
export async function editNasaImage(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const ai = getAI();
  const model = 'gemini-2.5-flash-image';

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    throw new Error("Düzenlenmiş görüntü verisi yanıtta bulunamadı.");
  } catch (e) {
    console.error("Error editing NASA image:", e);
    throw e;
  }
}

/**
 * Generates a mission briefing from HAL.
 */
export async function generateMissionBriefing(
  missionObjective: string,
  playerName: string
): Promise<string> {
    const ai = getAI();
    const model = 'gemini-2.5-flash';
    const systemInstruction = `Sen, Kaptan ${playerName}'e görev brifingi veren yapay zeka HAL 9000'sın. Görev hedefini analiz et ve Kaptan için kısa, karakterine uygun bir açılış mesajı oluştur. Yanıtına "// HAL:" ile başla.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Görev Hedefi: "${missionObjective}"`,
            config: { systemInstruction: systemInstruction },
        });
        return response.text;
    } catch (e) {
        console.error("Error generating mission briefing:", e);
        return `// HAL: Kaptan ${playerName}, göreve hazır. Sistemler nominal.`;
    }
}

/**
 * Generates the initial telescope image for the mission.
 */
export async function generateInitialTelescopeImage(prompt: string): Promise<string> {
    const descriptivePrompt = `Sinematik, 16:9 en boy oranı, son derece ayrıntılı bir uzay manzarası. ${prompt}. Keşif gemimiz 'Odyssey'in (şık, köşeli, üçgen güneş yelkenli) dışından bir görünüm. Görünürde insan yok.`;
    return generateTelescopeImage(descriptivePrompt);
}

/**
 * Generates the initial mission data including the telescope image and interactive hotspots.
 */
export async function generateInitialMissionData(
    prompt: string,
    playerName: string
): Promise<{ imageBase64: string; hotspots: TelescopeHotspot[] }> {
    const imageBase64 = await generateInitialTelescopeImage(prompt);
    const hotspots = await generateHotspotsForImage(imageBase64, prompt, playerName);
    return { imageBase64, hotspots };
}


/**
 * Generates HAL's initial greeting at the start of the mission.
 */
export async function generateInitialHalGreeting(
    playerName: string,
    missionObjective: string
): Promise<string> {
    const ai = getAI();
    const model = 'gemini-2.5-flash';
    const systemInstruction = `Sen, Kaptan ${playerName}'e görev brifingi veren yapay zeka HAL 9000'sın. Kaptan, Dünya'daki görev kontrol merkezinden sana uzaktan bağlanıyor. Kaptan için çok kısa (1-2 cümle), karakterine uygun bir karşılama mesajı oluştur. Yanıtına "// HAL:" ile başla.`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Görev Hedefi: "${missionObjective}"`,
            config: { systemInstruction: systemInstruction },
        });
        return response.text;
    } catch (e) {
        console.error("Error generating initial HAL greeting:", e);
        return `// HAL: Günaydın, Kaptan ${playerName}. Sistemler çalışır durumda. Emirlerinizi bekliyorum.`;
    }
}