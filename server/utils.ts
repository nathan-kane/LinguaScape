import { readFile } from 'fs/promises';
import path from 'path';

interface VocabularyFile {
  words: string[];
}

export async function readVocabularyFile(languageCode: string): Promise<string[]> {
  const filePath = path.join(process.cwd(), 'server', 'vocabulary', `${languageCode}.json`);

  try {
    const fileContent = await readFile(filePath, 'utf-8');
    const vocabularyData: VocabularyFile = JSON.parse(fileContent);
    return vocabularyData.words;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error(`Vocabulary file not found for language code: ${languageCode}`);
      return []; // Return empty array if file not found
    }
    console.error(`Error reading vocabulary file for language code ${languageCode}:`, error);
    throw error; // Re-throw other errors
  }
}