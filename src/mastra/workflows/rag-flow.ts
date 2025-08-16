import { createStep } from "@mastra/core";
import { createWorkflow } from "@mastra/core";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import { search } from "../rag/test-rag";
import dotenv from "dotenv";
dotenv.config();

export const createQueryStep = createStep({
    id: "createQueryStep",
    description: "このステップではエージェントを使ってユーザーの入力テキストをRAGの検索クエリに適したものへ変換します。",
    inputSchema: z.object({
        message: z.string().describe("The message to create a query from")
    }),
    outputSchema: z.object({
        query: z.string().describe("The generated query based on the input message")
    }),
    execute: async ({ inputData }) => {
        const message = inputData.message;
        // ここでクエリを生成するロジックを実装
        const createQueryAgent = new Agent({
            name: "Create Query Agent",
            description: "このエージェントはユーザーの入力テキストをRAGの検索クエリに適したものへ変換します。",
            instructions: `ユーザーからの入力に応じRAG用の検索クエリ用の文字列を作りなさい。: "${message}"`,
            model: openai("gpt-5-nano-2025-08-07"), // コスト効率的なモデルを使用
        })
        const query = await createQueryAgent.generate(message);
        return { query: query.text };
    }
})

export const searchDocumentsStep = createStep({
    id: "searchDocumentsStep",
    description: "このステップでは、最初のステップで作成した検索クエリをもとにベクターストアに対して検索を実施し、結果を返答します。",
    inputSchema: z.object({
        query: z.string().describe("The query to search documents")
    }),
    outputSchema: z.object({
        results: z.array(z.string()).describe("The search results containing document links")
    }),
    execute: async ({ inputData }) => {
        const query = inputData.query;
        // ここでドキュメントを検索するロジックを実装
        const results = await search(query);
        return { results: results };
    }
})

export const createResponseStep = createStep({
    id: "createResponseStep",
    description: "このステップでは、検索結果を人間が理解しやすいようにテキストにまとめます。",
    inputSchema: z.object({
        results: z.array(z.string()).describe("The search results containing document links")
    }),
    outputSchema: z.object({
        response: z.string().describe("The final response created from the search results")
    }),
    execute: async ({ inputData }) => {
        const results = inputData.results;
        // ここでレスポンスを生成するロジックを実装
        const createResponseAgent = new Agent({
            name: "Create Response Agent",
            description: "このエージェントはベクターストアの検索結果を人間が読みやすいようにテキスト化します。",
            instructions: `以下のベクターストアからの検索結果を踏まえ、人間が理解しやすいようにテキストを生成しなさい。: ${results.join(", ")}`,
            model: openai("gpt-5-nano-2025-08-07"), // コスト効率的なモデルを使用
        })
        const response = await createResponseAgent.generate(results.join(" "));
        return response.text;
    }
})

export const ragWorkflow = createWorkflow({
    id: "ragWorkflow",
    description: "This is Anthropic document serch workflow. A workflow that implements a RAG (Retrieval-Augmented Generation) process, This workflow creates a query, searches for documents, and generates a response based on the search results.",
    inputSchema: z.object({
        message: z.string().describe("The initial message to start the RAG process")
    }),
    outputSchema: z.object({
        response: z.string().describe("The final response after processing all steps")
    })
})
    .then(createQueryStep)
    .then(searchDocumentsStep)
    .then(createResponseStep)
    .commit();