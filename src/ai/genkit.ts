import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Configure Genkit to use the Google AI plugin.
// It will automatically use the GEMINI_API_KEY from the .env file.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
