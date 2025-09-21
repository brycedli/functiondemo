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

For each step, you must choose an appropriate icon from this list:
- exclamation-triangle (for warnings or important notices)
- bowl-food (for food-related recommendations)
- pills (for supplements or medication)
- vials (for lab testing or medical procedures)

You must use the create_action_plan function to provide the steps. Do not number the steps in the function - just provide clean step descriptions with appropriate icons.`

const tools = [
  {
    type: "function" as const,
    function: {
      name: "create_action_plan",
      description: "Create a 3-step daily action plan for the user with appropriate icons.",
      parameters: {
        type: "object",
        properties: {
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: {
                  type: "string",
                  description: "The action step text"
                },
                icon: {
                  type: "string",
                  enum: ["exclamation-triangle", "bowl-food", "pills", "vials"],
                  description: "Icon to display with this step"
                }
              },
              required: ["text", "icon"]
            },
            description: "Three daily action steps with icons"
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
    
    // Format the action plan as a numbered list for display purposes
    const actionPlan = planArgs.steps.map((step: { text: string, icon: string }, index: number) => 
      `${index + 1}. ${step.text}`
    ).join('\n')

    return NextResponse.json({
      actionPlan: actionPlan,
      steps: planArgs.steps
    })

  } catch (error) {
    console.error('Action Plan API error:', error)
    return NextResponse.json({ 
      error: "Failed to create action plan"
    }, { status: 500 })
  }
}
