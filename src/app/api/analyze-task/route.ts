import { NextResponse } from 'next/server';
import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const { task } = await req.json();

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is not set' }, { status: 500 });
    }

    console.log('Analyzing task:', task);

    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        score: z.number().int().min(1).max(100).describe('The difficulty score of the task'),
      })
    );
    
    const formatInstructions = parser.getFormatInstructions();
    console.log(formatInstructions);
    const prompt = new PromptTemplate({
      template: `
      Evaluate the difficulty of tasks and assign a numerical score based on perceived complexity and time commitment.

      Some examples of tasks and their scores:
      "Finish computer science homework" - 50
      "Go grocery shopping" - 23
      "Go on a walk" - 12
      "Learn a new programming language" - 100
      "Learn how to use a new software" - 73
      "Learn how to play the guitar" - 98
      "Call grandma" - 15
      "Put notebook in backpack" - 3
      "Do the dishes" - 10
      "Do the laundry" - 17

      Consider factors like required effort, complexity, skill level, and time required when scoring tasks.

      {format_instructions}

      Task: {task}

      Difficulty score:`,
      inputVariables: ['task'],
      partialVariables: { format_instructions: formatInstructions },
    });

    const model = new ChatOpenAI({ modelName: 'gpt-4o-mini', temperature: 0 });

    const input = await prompt.format({ task });
    const response = await model.call([
      { role: 'user', content: input },
    ]);

    const parsedOutput = await parser.parse(response.content as string);
    console.log(response.content);
    console.log('Difficulty score:', parsedOutput.score);

    return NextResponse.json({
      diamonds: parsedOutput.score,
      rawResponse: response.content
    });
  } catch (error: unknown) {
    console.error('Error analyzing task:', error);
    return NextResponse.json({
      error: 'Failed to analyze task',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
