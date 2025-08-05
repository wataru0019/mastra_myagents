globalThis.___MASTRA_TELEMETRY___ = true;
import { Mastra } from "@mastra/core";
import { VercelDeployer } from "@mastra/deployer-vercel";

import { openAiAgent } from "./agents/openai_agent";

export const mastra = new Mastra({
    agents: {
        openAiAgent: openAiAgent
    },
    deployer: new VercelDeployer()
})

export async function run() {
    const response = await openAiAgent.generate('What is the capital of France?');
    console.log(response.text);
}

run()