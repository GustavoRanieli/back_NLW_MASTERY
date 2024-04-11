import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import { prisma } from '../lib/prisma'

// Node
import fs from "node:fs"
import path from "node:path";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { randomUUID } from "node:crypto";


const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance) {
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 1_048_576 * 25 //25mb    1048576 = 1mb podendo separa o valor por _
        }
    });


    app.post('/video', async (req, res) => {
        const data = await req.file();

        if(!data){
            return res.status(400).send({error: 'Erro ao enviar arquivo.'});
        };

        const extension = path.extname(data.filename);

        if(extension != '.mp3'){
            return res.status(400).send({error: 'Formato inválido, por favor envie no formato mp3.'})
        };


        const fileBaseName = path.basename(data.filename, extension);
        const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`; // Reescreve o nome do arquivo adicionando id randômico para evitar arquivos com nomes iguais.
        const uploadDir = path.resolve(__dirname, '../../tpm/', fileUploadName); // Diretório do vídeo

        await pump(data.file, fs.createWriteStream(uploadDir))

         const video = await prisma.video.create({
            data: {
                name: data.filename,
                path: uploadDir
            }
        });

        res.send({
            video,
        })
    });

}