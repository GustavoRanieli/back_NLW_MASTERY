import { openai } from './../lib/openai';
import { z } from "zod";
import { streamToResponse, OpenAIStream } from 'ai'
import { FastifyInstance } from "fastify";
import { prisma } from '../lib/prisma'

export async function generateAiCompletionRoute(app: FastifyInstance) {
    app.post('/ai/complete', async (req, res) => {

        const bodySchema = z.object({
            videoId: z.string().uuid(),
            prompt: z.string(),
            temperature: z.number().min(0).max(1).default(0.5)
        }); // Validar o body da requisição
        const { videoId, prompt, temperature } = bodySchema.parse(req.body);

        const video = await prisma.video.findFirstOrThrow({
            where: {
                id: videoId
            }
        });

        if(!video.transcription){
            return res.status(400).send({error: "Vídeo não possui uma transcrição."});
        };

        const promptMessage = prompt.replace('{transcription}',  video.transcription);

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                temperature,
                messages: [
                    {role: 'user', content: promptMessage}
                ],
                stream: true
            });

            const stream =  OpenAIStream(response);

            streamToResponse(stream, res.raw, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST'
                }
            })

        } catch (error) {
            console.log(error);
            return res.status(500).send({erro: error})
        }

    }); 
}