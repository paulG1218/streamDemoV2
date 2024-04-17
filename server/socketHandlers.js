import OpenAI from "openai"
import WebSocket from 'ws';

//OpenAI init
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const streamAssistant = await openai.beta.assistants.retrieve(
  "asst_zgZ0lHzESU0gEA7uTNQuWpzH"
);
const thread = await openai.beta.threads.create();

//Eleven Labs variables
const voiceId = "iP95p4xoKVk53GoZ742B"
const elevenLabsModel = "eleven_monolingual_v1"

//Global socket variable
let theSocket

async function* textChunker(chunksAsyncIterator) {
    let buffer = "";
    const splitters = [".", ",", "?", "!", ";", ":", "—", "-", "(", ")", "[", "]", "}", " "];
    for await (const chunk of chunksAsyncIterator) {
        if (splitters.includes(buffer.slice(-1))) {
            yield buffer + " ";
            buffer = chunk;
        } else if (splitters.includes(chunk.charAt(0))) {
            yield buffer + chunk.charAt(0) + " ";
            buffer = chunk.slice(1);
        } else {
            buffer += chunk;
        }
    }

    if (buffer) {
        yield buffer + " ";
    }
}

async function stream(audioStreamAsyncIterator) {

    console.log("Started streaming audio");
    for await (const chunk of audioStreamAsyncIterator) {
        console.log(chunk)
        theSocket.emit("audio-buffer", chunk)
        if (chunk.done) {
            break
        }
    }
}

async function textToSpeechInputStreaming(voiceId, textIterator) {
    const uri = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${elevenLabsModel}`;

    const ws = new WebSocket(uri);

    await new Promise((resolve) => ws.once('open', resolve));

    ws.send(JSON.stringify({
        "text": " ",
        "voice_settings": { "stability": 0.5, "similarity_boost": 0.8 },
        "xi_api_key": process.env.ELEVENLABS_API_KEY,
    }));

    async function* listen() {
        // Create an async iterator that listens to messages
        const messageQueue = [];
        let resolver;

        ws.on('message', (data) => {
            const message = JSON.parse(data);
            if (message.audio) {
                const audioBuffer = Buffer.from(message.audio, 'base64');
                if (resolver) {
                    resolver({value: audioBuffer, done: false});
                    resolver = null;
                } else {
                    messageQueue.push({value: audioBuffer, done: false});
                }
            }
            // Handle other message types or conditions as needed...
        });

        ws.on('close', () => {
            if (resolver) {
                resolver({done: true});
            } else {
                messageQueue.push({done: true});
            }
        });

        try {
            while (true) {
                if (messageQueue.length) {
                    const message = messageQueue.shift();
                    if (message.done) return;
                    yield message.value;
                } else {
                    // Wait for the next message or close event
                    yield new Promise((resolve) => resolver = resolve);
                }
            }
        } finally {
            ws.removeEventListener('message');
            ws.removeEventListener('close');
        }
    }


    const listenTask = stream(listen());

    for await (const text of textChunker(textIterator)) {
        console.log(text)
        ws.send(JSON.stringify({ "text": text, "try_trigger_generation": true }));
    }

    ws.send(JSON.stringify({ "text": "" }));

    await listenTask;
}

async function chatCompletion(query) { //Needs to change for OpenAI assistants

    await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: query,
      });

      const run = openai.beta.threads.runs.createAndStream(thread.id, {
        assistant_id: streamAssistant.id
      })

    async function* textIterator() {
    for await (const chunk of run) {
        if (chunk.event === "thread.run.completed") {
            console.log('Stream finished');
            break;
        } else if (chunk.event === "thread.message.delta") {
            theSocket.emit("text-delta", chunk.data.delta.content[0].text.value)
            yield chunk.data.delta.content[0].text.value;
        }
    }
}

    await textToSpeechInputStreaming(voiceId, textIterator());
}


const socketHandlers = {
    handleStream: async (prompt) => {
        if (prompt) {
            await chatCompletion(prompt)
        }
    },
    handleSocket: async (socket) => {
            console.log(`Connected with: ${socket.id}`)

            theSocket = socket
        
            socket.on("prompt", socketHandlers.handleStream)
    }
}
export default socketHandlers