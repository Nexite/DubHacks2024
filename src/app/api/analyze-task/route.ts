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
          content: `
          Evaluate the difficulty of tasks and assign a numerical score based on perceived complexity and time commitment.

          Consider factors like required effort, complexity, skill level, and time required when scoring tasks.

          # Steps

          1. **Analyze the Task**: Determine the nature of the task, considering attributes like effort, complexity, skills required, and the time involved.
          2. **Assign a Score**: Based on the analysis, assign a difficulty score from 0 to 100, where 0 is least difficult and 100 is most difficult.

          # Output Format

          Provide the output in JSON format, where the task is the key, and the difficulty score is the value, e.g., {"score": score}.

          # Examples

          - Input: "Finish computer science homework"
            - Output: {"score": 50}

          - Input: "Go grocery shopping"
            - Output: {"score": 23}

          - Input: "Go on a walk"
            - Output: {"score": 12}

          - Input: "Learn a new programming language"
            - Output: {"score": 100}

          - Input: "Learn how to use a new software"
            - Output: {"score": 73}

          - Input: "Learn how to play the guitar"
            - Output: {"score": 98}

          - Input: "Call grandma"
            - Output: {"score": 15}

          - Input: "Put notebook in backpack"
            - Output: {"score": 3}

          - Input: "Do the dishes"
            - Output: {"score": 10}

          - Input: "Do the laundry"
            - Output: {"score": 17}

          # Notes

          Consider edge cases where some tasks may appear simple but require a significant time commitment due to external factors, such as waiting time or preparation. Adjust scores accordingly.
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
      rawResponse: content
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
