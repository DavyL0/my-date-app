import { LMStudioClient } from "@lmstudio/sdk";
const client = new LMStudioClient();

const model = await client.llm.model("llama-3.2-1b-instruct");
const result = await model.respond("What is the meaning of life?");

console.info(result.content);
