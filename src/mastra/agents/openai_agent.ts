import { createOpenAI } from "@ai-sdk/openai";
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import { Memory } from '@mastra/memory';
import { PgVector, PostgresStore } from '@mastra/pg';
import { extractLinksFromUrl } from "../tools";
import { createTool } from "@mastra/core";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

// const openai = createOpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// })

// Supabaseの接続情報
const SUPABASE_DATABASE_URL = process.env.DATABASE_URL; // Supabaseの接続URL
// Supabaseを使用したMemory設定
export const memory = new Memory({
    // PostgreSQL（Supabase）ストレージ
    storage: new PostgresStore({
      connectionString: SUPABASE_DATABASE_URL,
      schemaName: 'public',
      max: 2, // Vercelでは少なめに
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    }),
    
    // pgvectorを使用したベクトルストレージ
    vector: new PgVector({ 
      connectionString: SUPABASE_DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,

    }),
    
    // Memory設定
    // options: {
    //   // 直近メッセージ数
    //   lastMessages: 15,
      
    //   // セマンティック検索
    //   semanticRecall: {
    //     topK: 5,           // より多くの関連メッセージを取得
    //     messageRange: 3,   // 前後3メッセージのコンテキスト
    //     scope: 'resource', // ユーザー全体から検索
    //   },
      
      // ワーキングメモリ
    //   workingMemory: {
    //     enabled: true,
//         scope: 'resource', // ユーザー全体でメモリ共有
//         template: `# ユーザープロフィール
  
//   ## 基本情報
//   - 名前:
//   - 場所:
//   - 職業:
//   - 専門分野:
  
//   ## 設定・好み
//   - 言語: 日本語
//   - コミュニケーションスタイル:
//   - 学習スタイル:
//   - 興味のある分野:
  
//   ## 目標・プロジェクト
//   - 現在の目標:
//   - 取り組み中のプロジェクト:
//   - 学習中の技術:
  
//   ## セッション情報
//   - 最後の話題:
//   - 未解決の質問:
//   - 次回のフォローアップ:
//   `,
    //   },
      
      // スレッドタイトル自動生成
    //   threads: {
    //     generateTitle: {
    //       model: openai('gpt-4o-mini'), // コスト効率的なモデル
    //       instructions: 'ユーザーの最初のメッセージに基づいて、簡潔で分かりやすい日本語のタイトルを生成してください。',
    //     },
    //   },
    // },
    
    // OpenAI埋め込みモデル
    embedder: openai.embedding('text-embedding-3-small'),
  });

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
    },
    // memory: memory,
})
