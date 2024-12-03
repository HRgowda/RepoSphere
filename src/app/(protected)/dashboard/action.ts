"use server";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc"; // rsc stands for react-server-components
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateEmbedding(question);

  const vectorQuery = `[${queryVector.join(",")}]`;

  // Prisma raw query
  const result = (await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
  `) as { fileName: string; sourceCode: string; summary: string }[];

  let context = "";

  for (const doc of result) {
    context += `Source: ${doc.fileName}\nCode Content: ${doc.sourceCode}\nSummary of File: ${doc.summary}\n\n`;
  }

  (async () => {
    try {
      const { textStream } = await streamText({
        model: google("gemini-1.5-flash"),
        prompt: `
          You are an AI code assistant who answers questions about the codebase. 
          Your target audience is a technical intern. You are friendly, articulate, and eager to provide detailed and thoughtful responses.
          START CONTEXT BLOCK
          ${context}
          END CONTEXT BLOCK

          START QUESTION
          ${question}
          END QUESTION

          AI assistant will only answer questions based on the CONTEXT BLOCK. 
          If the context does not provide the answer, respond with "I'm sorry, but I don't know the answer." 
          Do not invent or fabricate information.
          Answer in markdown syntax, including code snippets if needed. Be detailed and accurate in your response.
        `,
      });

      for await (const delta of textStream) {
        stream.update(delta);
      }

      await stream.done();
    } catch (err) {
      console.error("Error during text streaming:", err);
      stream.done(); // Ensure the stream is finalized in case of an error
    }
  })();

  return {
    output: stream.value,
    filesReferences: result,
  };
}
