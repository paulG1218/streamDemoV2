import OpenAI from "openai";
import ElevenLabs from "elevenlabs-node";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log(process.env.OPENAI_API_KEY)

const myAssistant = await openai.beta.assistants.retrieve(
  "asst_zgZ0lHzESU0gEA7uTNQuWpzH"
);

const thread = await openai.beta.threads.create();

const voice = new ElevenLabs({
  apiKey: process.env.ELEVENLABS_API_KEY, // Your API key from Elevenlabs
  voiceId: "iP95p4xoKVk53GoZ742B", // A Voice ID from Elevenlabs
});

const handlers = {
  staticAIResponse: async (req, res) => {
    const { prompt } = req.body;
    if (prompt) {
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: prompt,
      });
      let run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: myAssistant.id,
      });
      while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
        run = await openai.beta.threads.runs.retrieve(
          run.thread_id,
          run.id
        );
      }
      if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(
          run.thread_id
        );
          res.json({message: messages.data[0].content[0].text.value});
      } else {
        console.log(run.status);
      }
    }
  },
  streamingAIResponse: async (req, res) => {
    const {prompt} = req.body
    console.log(prompt)
  }
};

export default handlers;
