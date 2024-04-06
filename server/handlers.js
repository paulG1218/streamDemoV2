import OpenAI from "openai";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

const handlers = {
    staticTranscription: async (req, res) => {

        const transcription = await openai.audio.transcriptions.create({
            file: "to-do",
            model: "whisper-1",
            response_format: "text",
          });
        
          console.log(transcription.text);
    }
}

export default handlers