declare global {
  // Enable Mastra telemetry flag on globalThis with proper typing
  var ___MASTRA_TELEMETRY___: boolean;
}
globalThis.___MASTRA_TELEMETRY___ = true;
import { Mastra } from "@mastra/core";
import { PinoLogger } from "@mastra/loggers";

import { openAiAgent } from "./agents/openai_agent";
import { testWorkflow } from "./workflows/test-flow";
import { ragWorkflow } from "./workflows/rag-flow";

export const mastra = new Mastra({
    agents: {
        openAiAgent: openAiAgent
    },
    workflows: {
        testWorkflow: testWorkflow,
        ragWorkflow: ragWorkflow
    },
    logger: new PinoLogger({
        name: "mastra",
        level: "debug"
    }),
    server: {
        port: Number(process.env.PORT) || 4111,
        host: "0.0.0.0",
        cors: {
          origin: "*",
          allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        },
        // カスタムミドルウェアでリクエスト/レスポンスをログ
        // ログチェック
        middleware: [
          async (c, next) => {
            const logger = mastra.getLogger();
            const method = c.req.method;
            const path = c.req.path;
            
            logger.debug(`Request started: ${method} ${path}`);
            
            try {
              await next();
              logger.debug(`Request completed: ${method} ${path} - Status: ${c.res.status}`);
            } catch (error) {
              if (error instanceof Error) {
                logger.error(`Request failed: ${method} ${path}`, {
                  error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                  },
                });
              } else {
                logger.error(`Request failed: ${method} ${path}`, { error });
              }
              throw error;
            }
          }
        ]
      }
})

// export async function run() {
//     const response = await openAiAgent.generate('What is the capital of France?');
//     console.log(response.text);
// }

// run()