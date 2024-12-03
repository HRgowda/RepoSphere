// this is a function that allows us to take in github url and give us back the list of files in the Url of the repository
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github"
import { Document } from "@langchain/core/documents"
import { generateEmbedding, summariseCode } from "./gemini"
import { db } from '@/server/db';

export const loadGithubRepo = async(githubUrl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || '',
    branch: 'main',
    ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5
  })

  const docs = await loader.load()
  return docs;
}

// console.log(await loadGithubRepo(' https://github.com/HRgowda/Password_Generator'))

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
  const docs = await loadGithubRepo(githubUrl, githubToken)
  const allEmbeddings = await generateEmbeddings(docs)
  await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
    console.log(`porcessing ${index} of ${allEmbeddings.length}`)
    if(!embedding) return
    
    // insert the row first without the vector
    const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
      data: {
        summary: embedding.summary,
        sourceCode: embedding.sourceCode,
        fileName: embedding.fileName,
        projectId,        
      }
    })

    // prisma doesnt store the the vector to the databse directly so we are running raw sql queries to store them in the database.

    await db.$executeRaw `
    UPDATE "SourceCodeEmbedding"
    SET "summaryEmbedding" = ${embedding.embedding}::vector
    WHERE "id" = ${sourceCodeEmbedding.id}
    `
  }))
}

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(docs.map(async doc => {
    const summary = await summariseCode(doc)
    const embedding = await generateEmbedding(summary)
    return  {
      summary,
      embedding,
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
      fileName: doc.metadata.source,
    }
  }))
}
