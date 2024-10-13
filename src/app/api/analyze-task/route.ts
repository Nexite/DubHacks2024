import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { task } = await req.json();

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is not set' }, { status: 500 });
    }

    console.log('Sending request to OpenAI with task:', task);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI that analyzes tasks and assigns them a difficulty score from 1 to 100. 1 is very easy, 100 is extremely difficult. Your response should be ANYWHERE from 1 to 100 not just increments of 5. There are some examples listed below. Respond with a JSON object containing a 'score' key with the difficulty value. If you are given a task that is not an action, interpret it as an action that you would see on a to-do list like "read" or "write" or "call", etc. and then give it a score.
          
          Example 1: "Finish computer science homework" -> {"score": 50}
          Example 2: "Go grocery shopping" -> {"score": 23}
          Example 3: "Go on a walk" -> {"score": 12}
          Example 4: "Learn a new programming language" -> {"score": 100}
          Example 5: "Learn how to use a new software" -> {"score": 73}
          Example 6: "Learn how to play the guitar" -> {"score": 98}
          Example 7: "Call grandma" -> {"score": 15}
          Example 8: "Put notebook in backpack" -> {"score": 3}
          Example 9: "Do the dishes" -> {"score": 10}
          Example 10: "Do the laundry" -> {"score": 17}
          `
        },
        {
          role: "user",
          content: `Analyze this task and give it a difficulty score from 1 to 100: "${task}". Respond with a JSON object containing only a 'score' key and its numeric value.`
        }
      ],
      max_tokens: 60,
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // If parsing fails, attempt to extract the score using regex
      const scoreMatch = content.match(/\d+/);
      if (scoreMatch) {
        parsedContent = { score: parseInt(scoreMatch[0], 10) };
      } else {
        throw new Error('Invalid response format from OpenAI');
      }
    }

    if (typeof parsedContent.score !== 'number') {
      throw new Error('Invalid score format in OpenAI response');
    }

    const difficultyScore = parsedContent.score;
    console.log('Difficulty score:', difficultyScore);

    // Ensure the score is within the 1-100 range
    const normalizedScore = Math.max(1, Math.min(100, difficultyScore));

    return NextResponse.json({ 
      diamonds: normalizedScore,
      rawResponse: content  // Include the raw response in the API response
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
