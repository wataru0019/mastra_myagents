globalThis.___MASTRA_TELEMETRY___ = true;
import { Mastra } from "@mastra/core";
import { VercelDeployer } from "@mastra/deployer-vercel";
import { PinoLogger } from "@mastra/loggers";

import { openAiAgent } from "./agents/openai_agent";

export const mastra = new Mastra({
    agents: {
        openAiAgent: openAiAgent
    },
    logger: new PinoLogger({
        name: "mastra",
        level: "debug"
    }),
    server: {
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
              logger.error(`Request failed: ${method} ${path}`, {
                error: {
                  message: error.message,
                  stack: error.stack,
                  name: error.name
                }
              });
              throw error;
            }
          }
        ]
      },
    deployer: new VercelDeployer()
})

// export async function run() {
//     const response = await openAiAgent.generate('What is the capital of France?');
//     console.log(response.text);
// }

// run()