import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export async function POST(request: NextRequest) {
    try {
        const { position, difficulty, questionCount, questionTypes, generationMode, customPrompt } = await request.json()

        if (!process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json(
                { error: 'Google AI API key not configured' },
                { status: 500 }
            )
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        let prompt = ''

        if (generationMode === 'custom') {
            prompt = `${customPrompt}

IMPORTANT: You must return the response in a strict JSON format.
Return ONLY a valid JSON array of questions, no additional text.
Each question object must have:
1. question_type: one of 'mcq', 'short_answer', 'coding'
2. question_text: the question itself
3. options: (for MCQ only) an object with keys a, b, c, d
4. correct_answer: the correct answer (for MCQ, use the letter; for others, provide the expected answer)
5. explanation: brief explanation of the solution
6. points: suggested points (scale 5-20)

Example format:
[
  {
    "question_type": "mcq",
    "question_text": "What is React?",
    "options": {"a": "A library", "b": "A framework", "c": "A language", "d": "An IDE"},
    "correct_answer": "a",
    "explanation": "React is a JavaScript library for building user interfaces.",
    "points": 10
  }
]`
        } else {
            prompt = `You are a technical recruitment expert. Generate ${questionCount} ${difficulty} difficulty test questions for a ${position} position.

Question types to include: ${questionTypes.join(', ')}

For each question, provide:
1. question_type: one of ${questionTypes.join(', ')}
2. question_text: the question itself
3. options: (for MCQ only) an object with keys a, b, c, d
4. correct_answer: the correct answer (for MCQ, use the letter; for others, provide the expected answer)
5. explanation: brief explanation of the solution
6. points: suggested points (scale 5-20 based on difficulty)

Return ONLY a valid JSON array of questions, no additional text. Example format:
[
  {
    "question_type": "mcq",
    "question_text": "What is React?",
    "options": {"a": "A library", "b": "A framework", "c": "A language", "d": "An IDE"},
    "correct_answer": "a",
    "explanation": "React is a JavaScript library for building user interfaces.",
    "points": 10
  }
]`
        }

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = text.trim()
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '')
        }

        const questions = JSON.parse(jsonText)

        return NextResponse.json({ success: true, questions })
    } catch (error: any) {
        console.error('Error generating test:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate test' },
            { status: 500 }
        )
    }
}
