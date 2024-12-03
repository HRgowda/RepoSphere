import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash'
})

export const aiSummariseCommit = async (diff: string) => {
  const response = await model.generateContent([
    `Analyze the following code diff and provide a concise point-wise summary of the changes made. Limit the summary to 4 to 5 points:\n\n${diff}`
  ]);

  return response.response.text();
}
