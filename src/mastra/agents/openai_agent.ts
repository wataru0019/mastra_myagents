import { createOpenAI } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import { extractLinksFromUrl } from "../tools";
import { createTool } from "@mastra/core";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const extractLinks = createTool({
    id: "extract-links",
    description: "Extracts links from a given URL.",
    inputSchema: z.object({
        url: z.string().describe("The URL to extract links from")
    }),
    outputSchema: z.array(z.string()).describe("An array of extracted links"),
    execute: async ({ context }) => {
        const url = context.url;
        try {
            const links = await extractLinksFromUrl(url);
            return links;
        } catch (error) {
            throw new Error(`Failed to extract links from ${url}: ${error.message}`);
        }
    }
})

const fetchWebTool = createTool({
    id: "fetch-web",
    description: "Fetches web content from a given URL.",
    inputSchema: z.object({
        url: z.string().describe("The URL to fetch content from"),
    }),
    outputSchema: z.string().describe("The content fetched from the URL"),
    execute: async ({ context }) => {
        const url = context.url;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        const text = await response.text();
        return text;
    }
})

export const openAiAgent = new Agent({
    name: "OpenAI Agent",
    instructions: `
        An agent that uses OpenAI's API to generate responses.
        if the user asks for web content, use the fetchWeb tool to retrieve it.
        `,
    model: openai("gpt-4o-mini"),
    tools: {
        fetchWeb: fetchWebTool,
        extractLinks: extractLinks,
    }
})