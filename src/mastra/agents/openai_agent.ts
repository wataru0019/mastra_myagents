import { createOpenAI } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import dotenv from "dotenv";
dotenv.config();

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const openAiAgent = new Agent({
    name: "OpenAI Agent",
    instructions: "An agent that uses OpenAI's API to generate responses.",
    model: openai("gpt-4o-mini")
})