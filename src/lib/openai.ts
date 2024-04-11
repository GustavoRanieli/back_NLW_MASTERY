import { OpenAI } from 'openai';
// import 'dotenv/config'

export const openAi = new OpenAI({
    apiKey: process.env.SECRETKEY_OPENAI,
});