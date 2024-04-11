import { fastify } from "fastify";
import { getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload-video";
import { transcriptionVideoRoute } from "./routes/create-transcription";

const app = fastify();

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(transcriptionVideoRoute)

app.listen({
    port: 3333,
}).then(() => {
    console.log('Server aberto')
})