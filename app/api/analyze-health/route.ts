import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ANALYSIS_PROMPT = `You are a health analysis assistant. Analyze the provided health data in relation to the user's question.

Your response should:
1. Describe the issue and reason any causes for at least three sentences
2. Reference specific biomarkers and values from the health data
3. Explain connections between the data and the user's concern
4. Be informative but not provide action steps (those come later)

Focus on analysis and explanation, not recommendations.`

export async function POST(request: NextRequest) {
  try {
    const { message, healthData } = await request.json()
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: "OpenAI API key not configured"
      }, { status: 500 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: ANALYSIS_PROMPT },
        { role: "user", content: `User question: ${message}\n\nHealth data: ${JSON.stringify(healthData.data, null, 2)}` }
      ]
    })

    return NextResponse.json({
      response: completion.choices[0].message.content
    })

  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json({ 
      error: "Failed to analyze health data"
    }, { status: 500 })
  }
}
