import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ACTION_PLAN_PROMPT = `You are a health action plan assistant. Based on the user's question, health data analysis, create a specific 3-step daily action plan.

Your action plan should:
1. Be specific and actionable
2. Be based on the health data findings
3. Be realistic for daily implementation
4. Address the user's specific concern

You must use the create_action_plan function to provide the steps. Do not number the steps in the function - just provide clean step descriptions.`

const tools = [
  {
    type: "function" as const,
    function: {
      name: "create_action_plan",
      description: "Create a 3-step daily action plan for the user. Do not number the steps.",
      parameters: {
        type: "object",
        properties: {
          steps: {
            type: "array",
            items: { type: "string" },
            description: "Three daily action steps without numbers"
          }
        },
        required: ["steps"]
      }
    }
  }
]

export async function POST(request: NextRequest) {
  try {
    const { message, healthData, analysis } = await request.json()
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: "OpenAI API key not configured"
      }, { status: 500 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: ACTION_PLAN_PROMPT },
        { role: "user", content: `User question: ${message}\n\nHealth data: ${JSON.stringify(healthData.data, null, 2)}\n\nAnalysis: ${analysis}` }
      ],
      tools: tools,
      tool_choice: { type: "function", function: { name: "create_action_plan" } }
    })

    const toolCall = completion.choices[0].message.tool_calls?.[0]
    if (!toolCall) {
      return NextResponse.json({ error: "No action plan generated" }, { status: 500 })
    }

    const planArgs = JSON.parse(toolCall.function.arguments)
    const actionPlan = planArgs.steps.map((step: string, index: number) => 
      `${index + 1}. ${step}`
    ).join('\n')

    return NextResponse.json({
      actionPlan: actionPlan
    })

  } catch (error) {
    console.error('Action Plan API error:', error)
    return NextResponse.json({ 
      error: "Failed to create action plan"
    }, { status: 500 })
  }
}
