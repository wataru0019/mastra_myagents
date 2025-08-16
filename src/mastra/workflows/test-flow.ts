import { createStep } from "@mastra/core";
import { createWorkflow } from "@mastra/core";
import { z } from "zod";

export const firstStep = createStep({
    id: "firstStep",
    description: "This is the first step of the workflow",
    inputSchema: z.object({
        message: z.string().describe("The message to process in the first step")
    }),
    outputSchema: z.object({
        response: z.string().describe("The response from the first step")
    }),
    execute: async({ inputData }) => {
        const message = inputData.message;
        return { response: `${message} + FirstStep`}
    }
})

export const secondStep = createStep({
    id: "secondStep",
    description: "This is the second step of the workflow",
    inputSchema: z.object({
        response: z.string().describe("The response from the first step")
    }),
    outputSchema: z.object({
        finalResponse: z.string().describe("The final response from the workflow")
    }),
    execute: async({ inputData }) => {
        const response = inputData.response;
        return { finalResponse: `${response} + SecondStep` }
    }
})

export const testWorkflow = createWorkflow({
    id: "testWorkflow",
    description: "A simple workflow to test the steps",
    inputSchema: z.object({
        message: z.string().describe("The initial message to start the workflow")
    }),
    outputSchema: z.object({
        finalResponse: z.string().describe("The final response after processing all steps")
    })
})
    .then(firstStep)
    .then(secondStep)
    .commit()

// async function runTestWorkflow() {
//     const run = await testWorkflow.createRunAsync()
//     const result = await run.start({inputData: { message: "Hello, World!" }});
//     console.log(result.result.finalResponse);
//     return result;
// }

// runTestWorkflow()