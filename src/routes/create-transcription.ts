import { openai } from './../lib/openai';
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from '../lib/prisma'
import { createReadStream } from "node:fs";

export async function transcriptionVideoRoute(app: FastifyInstance) {
    app.post('/videos/:videoId/transcription', async (req, res) => {

        
        const paramsVideo = z.object({
            videoId: z.string().uuid()
        }); // Ao utilizar params no typescript, é necessário validar o seu type, para isso utilizamos o zod.
        const { videoId } = paramsVideo.parse(req.params);



        const bodySchema = z.object({
            prompt: z.string(),
        }); // Validar o body da requisição
        const { prompt } = bodySchema.parse(req.body);


        
        const video = await prisma.video.findFirstOrThrow({
            where: {
                id: videoId
            }
        });
        const videoPath = video.path;
        const videoReadStream = createReadStream(videoPath);


        
        try {
            const response = await openai.audio.transcriptions.create({
                file: videoReadStream,
                model: 'whisper-1',
                language: 'pt',
                response_format: 'json',
                temperature: 0,
                prompt: prompt
            });

            const transcription = response.text;

            await prisma.video.update({
                where: {
                    id: videoId,
                },
                data: {
                    transcription
                }
            })
            
            return {transcription}
        } catch (error) {
            console.error('Ocorreu um erro:', error);
            res.status(500).send({err: error})
        }

    }); 
}