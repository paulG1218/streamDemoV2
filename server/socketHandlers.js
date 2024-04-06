import OpenAI from "openai"

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

const socketHandlers = {}

export default socketHandlers