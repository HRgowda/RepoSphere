import { GoogleGenerativeAI } from "@google/generative-ai"
import { Document } from "@langchain/core/documents"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash'
})

// function to generate the summary of the commit from the commit hash 
export const aiSummariseCommit = async (diff: string) => {
  const response = await model.generateContent([
    `Analyze the following code diff and provide a concise point-wise summary of the changes made. If you are unable to provide the response dont give an empty string atleast give a message. :\n\n${diff}`
  ]);

  return response.response.text();
}

export async function summariseCode(doc: Document) { 
  console.log("Getting summary for", doc.metadata.source);
  try{
    const code = doc.pageContent.slice(0, 10000); // limiting to 10000 characters

    const response = await model.generateContent([
      `You are an intelligent senior software enginerr who specialises in onboarding junior software engineers onto projets`,
      `You are onboarding a junior software enginerr and explaining to them the purpose of the ${doc.metadata.source} file 
      Here is the code:
      ---
      ${code}
      ---
      Give a summary no more then 100 words of the code above`,

    ]);

      return response.response.text();
  } catch (error) {
    return ''
  } 
}

// function to generate embeddings
export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004"
  })
  const result = await model.embedContent(summary)
  const embedding = result.embedding;
  return embedding.values;
}

// console.log(await generateEmbedding("hello world"))

