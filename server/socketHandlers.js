import OpenAI from "openai"
import fs from "fs"

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

const socketHandlers = {
    handleStream: async (prompt) => {
        console.log(prompt)
    },
    handleSocket: async (socket) => {
            console.log(`Connected with: ${socket.id}`)
        
            socket.on("prompt", socketHandlers.handleStream)
    }
}
export default socketHandlers