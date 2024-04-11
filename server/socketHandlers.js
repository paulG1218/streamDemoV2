import OpenAI from "openai"
import ElevenLabs from "elevenlabs-node";
import fs from "fs"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log(process.env.OPENAI_API_KEY);

const streamAssistant = await openai.beta.assistants.retrieve(
  "asst_zgZ0lHzESU0gEA7uTNQuWpzH"
);

const thread = await openai.beta.threads.create();

const voice = new ElevenLabs({
  apiKey: process.env.ELEVENLABS_API_KEY, // Your API key from Elevenlabs
  voiceId: "iP95p4xoKVk53GoZ742B", // A Voice ID from Elevenlabs
});

let theSocket

const socketHandlers = {
    handleStream: async (prompt) => {
        if (prompt) {
            await openai.beta.threads.messages.create(thread.id, {
              role: "user",
              content: prompt,
            });

            const run = openai.beta.threads.runs.createAndStream(thread.id, {
                assistant_id: streamAssistant.id
              })
                .on('textCreated', (text) => theSocket.emit("ai_response_start", text))
                .on('textDelta', (textDelta, snapshot) => theSocket.emit("ai_response_continue", textDelta.value))
        }
    },
    handleSocket: async (socket) => {
            console.log(`Connected with: ${socket.id}`)

            theSocket = socket
        
            socket.on("prompt", socketHandlers.handleStream)
    }
}
export default socketHandlers