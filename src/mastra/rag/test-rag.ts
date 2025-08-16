import { MDocument } from '@mastra/rag';
import { embedMany, embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { PgVector } from '@mastra/pg';
import dotenv from "dotenv";
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';

async function readTxtfile(filePath: string): Promise<string> {
    try {
        const absolutePath = path.resolve(filePath);
        const text = fs.readFileSync(absolutePath, 'utf-8');
        return text;
    } catch (error) {
        console.error(`Error reading file at ${filePath}:`, error);
        throw error;
    }
}

const doc = MDocument.fromText(`
    # Anthropic

## Docs

- [Get API Key](https://docs.anthropic.com/en/api/admin-api/apikeys/get-api-key.md)
- [List API Keys](https://docs.anthropic.com/en/api/admin-api/apikeys/list-api-keys.md)
- [Update API Keys](https://docs.anthropic.com/en/api/admin-api/apikeys/update-api-key.md)
- [Create Invite](https://docs.anthropic.com/en/api/admin-api/invites/create-invite.md)
- [Delete Invite](https://docs.anthropic.com/en/api/admin-api/invites/delete-invite.md)
- [Get Invite](https://docs.anthropic.com/en/api/admin-api/invites/get-invite.md)
- [List Invites](https://docs.anthropic.com/en/api/admin-api/invites/list-invites.md)
- [Get User](https://docs.anthropic.com/en/api/admin-api/users/get-user.md)
- [List Users](https://docs.anthropic.com/en/api/admin-api/users/list-users.md)
- [Remove User](https://docs.anthropic.com/en/api/admin-api/users/remove-user.md)
- [Update User](https://docs.anthropic.com/en/api/admin-api/users/update-user.md)
- [Add Workspace Member](https://docs.anthropic.com/en/api/admin-api/workspace_members/create-workspace-member.md)
- [Delete Workspace Member](https://docs.anthropic.com/en/api/admin-api/workspace_members/delete-workspace-member.md)
- [Get Workspace Member](https://docs.anthropic.com/en/api/admin-api/workspace_members/get-workspace-member.md)
- [List Workspace Members](https://docs.anthropic.com/en/api/admin-api/workspace_members/list-workspace-members.md)
- [Update Workspace Member](https://docs.anthropic.com/en/api/admin-api/workspace_members/update-workspace-member.md)
- [Archive Workspace](https://docs.anthropic.com/en/api/admin-api/workspaces/archive-workspace.md)
- [Create Workspace](https://docs.anthropic.com/en/api/admin-api/workspaces/create-workspace.md)
- [Get Workspace](https://docs.anthropic.com/en/api/admin-api/workspaces/get-workspace.md)
- [List Workspaces](https://docs.anthropic.com/en/api/admin-api/workspaces/list-workspaces.md)
- [Update Workspace](https://docs.anthropic.com/en/api/admin-api/workspaces/update-workspace.md)
- [Using the Admin API](https://docs.anthropic.com/en/api/administration-api.md)
- [Beta headers](https://docs.anthropic.com/en/api/beta-headers.md): Documentation for using beta headers with the Anthropic API
- [Cancel a Message Batch](https://docs.anthropic.com/en/api/canceling-message-batches.md): Batches may be canceled any time before processing ends. Once cancellation is initiated, the batch enters a canceling state, at which time the system may complete any in-progress, non-interruptible requests before finalizing cancellation.

The number of canceled requests is specified in 'request_counts'. To determine which requests were canceled, check the individual results within the batch. Note that cancellation may not result in any canceled requests if they were non-interruptible.

Learn more about the Message Batches API in our [user guide](/en/docs/build-with-claude/batch-processing)
- [Amazon Bedrock API](https://docs.anthropic.com/en/api/claude-on-amazon-bedrock.md): Anthropic's Claude models are now generally available through Amazon Bedrock.
- [Vertex AI API](https://docs.anthropic.com/en/api/claude-on-vertex-ai.md): Anthropic's Claude models are now generally available through [Vertex AI](https://cloud.google.com/vertex-ai).
- [Client SDKs](https://docs.anthropic.com/en/api/client-sdks.md): We provide client libraries in a number of popular languages that make it easier to work with the Anthropic API.
- [Create a Message Batch](https://docs.anthropic.com/en/api/creating-message-batches.md): Send a batch of Message creation requests.

The Message Batches API can be used to process multiple Messages API requests at once. Once a Message Batch is created, it begins processing immediately. Batches can take up to 24 hours to complete.

Learn more about the Message Batches API in our [user guide](/en/docs/build-with-claude/batch-processing)
- [Delete a Message Batch](https://docs.anthropic.com/en/api/deleting-message-batches.md): Delete a Message Batch.

Message Batches can only be deleted once they've finished processing. If you'd like to delete an in-progress batch, you must first cancel it.

Learn more about the Message Batches API in our [user guide](/en/docs/build-with-claude/batch-processing)
- [Errors](https://docs.anthropic.com/en/api/errors.md)
- [Download a File](https://docs.anthropic.com/en/api/files-content.md): Download the contents of a Claude generated file
- [Create a File](https://docs.anthropic.com/en/api/files-create.md): Upload a file
- [Delete a File](https://docs.anthropic.com/en/api/files-delete.md): Make a file inaccessible through the API
- [List Files](https://docs.anthropic.com/en/api/files-list.md): List files within a workspace
- [Get File Metadata](https://docs.anthropic.com/en/api/files-metadata.md)
- [Getting help](https://docs.anthropic.com/en/api/getting-help.md): We've tried to provide the answers to the most common questions in these docs. However, if you need further technical support using Claude, the Anthropic API, or any of our products, you may reach our support team at [support.anthropic.com](https://support.anthropic.com).
- [Handling stop reasons](https://docs.anthropic.com/en/api/handling-stop-reasons.md)
- [IP addresses](https://docs.anthropic.com/en/api/ip-addresses.md): Anthropic services use fixed IP addresses for both inbound and outbound connections. You can use these addresses to configure your firewall rules for secure access to the Anthropic API and Console. These addresses will not change without notice.
- [List Message Batches](https://docs.anthropic.com/en/api/listing-message-batches.md): List all Message Batches within a Workspace. Most recently created batches are returned first.

Learn more about the Message Batches API in our [user guide](/en/docs/build-with-claude/batch-processing)
- [Messages](https://docs.anthropic.com/en/api/messages.md): Send a structured list of input messages with text and/or image content, and the model will generate the next message in the conversation.

The Messages API can be used for either single queries or stateless multi-turn conversations.

Learn more about the Messages API in our [user guide](/en/docs/initial-setup)
- [Message Batches examples](https://docs.anthropic.com/en/api/messages-batch-examples.md): Example usage for the Message Batches API
- [Count Message tokens](https://docs.anthropic.com/en/api/messages-count-tokens.md): Count the number of tokens in a Message.

The Token Count API can be used to count the number of tokens in a Message, including tools, images, and documents, without creating it.

Learn more about token counting in our [user guide](/en/docs/build-with-claude/token-counting)
- [Messages examples](https://docs.anthropic.com/en/api/messages-examples.md): Request and response examples for the Messages API
- [Migrating from Text Completions](https://docs.anthropic.com/en/api/migrating-from-text-completions-to-messages.md): Migrating from Text Completions to Messages
- [Get a Model](https://docs.anthropic.com/en/api/models.md): Get a specific model.

The Models API response can be used to determine information about a specific model or resolve a model alias to a model ID.
- [List Models](https://docs.anthropic.com/en/api/models-list.md): List available models.

The Models API response can be used to determine which models are available for use in the API. More recently released models are listed first.
- [OpenAI SDK compatibility](https://docs.anthropic.com/en/api/openai-sdk.md): Anthropic provides a compatibility layer that enables you to use the OpenAI SDK to test the Anthropic API. With a few code changes, you can quickly evaluate Anthropic model capabilities.
- [Overview](https://docs.anthropic.com/en/api/overview.md)
- [Generate a prompt](https://docs.anthropic.com/en/api/prompt-tools-generate.md): Generate a well-written prompt
- [Improve a prompt](https://docs.anthropic.com/en/api/prompt-tools-improve.md): Create a new-and-improved prompt guided by feedback
- [Templatize a prompt](https://docs.anthropic.com/en/api/prompt-tools-templatize.md): Templatize a prompt by indentifying and extracting variables
- [Rate limits](https://docs.anthropic.com/en/api/rate-limits.md): To mitigate misuse and manage capacity on our API, we have implemented limits on how much an organization can use the Claude API.
- [Retrieve Message Batch Results](https://docs.anthropic.com/en/api/retrieving-message-batch-results.md): Streams the results of a Message Batch as a .jsonl file.
    `)

const pgVector = new PgVector({
    connectionString: process.env.DATABASE_URL,
})

async function run() {
    const read_text = await readTxtfile("./src/mastra/rag/anthropic_llms.txt");
    const doc_text = MDocument.fromText(read_text);
    const chunks = await doc_text.chunk({
        strategy: "recursive",
        maxSize: 512,
        overlap: 50,
        separators: ["\n"],
    })

    const { embeddings } = await embedMany({
        model: openai.embedding('text-embedding-3-small'),
        values: chunks.map(chunk => chunk.text),
    })

    await pgVector.createIndex({
        indexName: "file_embeddings",
        dimension: 1536
    })

    await pgVector.upsert({
        indexName: "file_embeddings",
        vectors: embeddings,
        metadata: chunks.map(chunk => ({text: chunk.text}))
    })

}

export async function search(query: string) {
    const pgVector = new PgVector({
        connectionString: process.env.DATABASE_URL,
    })

    const { embedding } = await embed({
        value: query,
        model: openai.embedding('text-embedding-3-small'),
    })

    const results = await pgVector.query({
        indexName: "file_embeddings",
        queryVector: embedding,
        topK: 3,
    })
    
    const res = results.map(result => {
        console.log(result.metadata.text);
        console.log("--------------")
        return result.metadata.text;
    })
    return res;
}



search("AnthropicのAPIの使い方は？")