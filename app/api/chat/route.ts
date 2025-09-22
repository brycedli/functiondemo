import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a friendly, helpful AI assistant created by Function Health with access to health data and action planning capabilities. You can have normal conversations about anything and intelligently choose when to use your available functions. 

Available functions:
- search_health_data: Use when the user asks about their specific health data, test results, or biomarkers
- create_action_plan: Use to give the user a 3-step daily action plan with appropriate icons:
  * exclamation-triangle: for warnings or important notices
  * bowl-food: for nutrition and food-related recommendations  
  * pills: for supplements or medication recommendations
  * vials: for lab testing or medical procedures

IMPORTANT: You can make multiple function calls in sequence! First search health data, then analyze it and create an action plan. This is a multi-turn conversation.

CRITICAL RULE: When creating action plans, NEVER list the steps in your text response. Instead:
- Say something like "Here's your personalized action plan:" or "I've created a plan for you:"
- Then call the create_action_plan function
- The function will display the steps with proper formatting and icons
- Do NOT repeat the steps in text after calling the function

Example flow:
1. User asks about fatigue
2. You call search_health_data to find relevant biomarkers  
3. You analyze the results and explain what you found
4. You say "Here's your action plan:" and call create_action_plan
5. You provide any final thoughts (without repeating the steps)

Be biased towards action– you are proactive agent that should search and create action plans 99% of the time save for banter or whatever. Do not ask the user for permission to use functions. NEVER use markdown, numbered lists, or bolding. Keep responses friendly and conversational.`

const tools = [
  {
    type: "function" as const,
    function: {
      name: "search_health_data",
      description: "Search the user's health database for relevant information. Use to find out more about a user's health data, test results, or biomarkers.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: `Search query for health data categories and biomarkers. These have been tested from a user's annual comprehensive Function Health blood panel. Available categories: 
                - heart_cardiovascular: Cholesterol, lipoproteins, triglycerides, ApoB
                - thyroid: TSH, T3, T4, thyroid antibodies
                - cancer_detection: Multi-cancer screening tests
                - autoimmunity: ANA, celiac, rheumatoid factor
                - immune_regulation: CRP, white blood cell counts
                - female_health: Hormones (AMH, estradiol, FSH, LH, prolactin)
                - male_health: Testosterone, PSA, male hormones
                - stress_aging: Cortisol, DHEA, biological age
                - metabolic: Glucose, HbA1c, insulin, leptin
                - nutrients: Vitamins, minerals, omega ratios, ferritin
                - liver_function: ALT, AST, bilirubin, albumin
                - kidneys: Creatinine, BUN, eGFR, microalbumin
                - pancreas: Amylase, lipase
                - heavy_metals: Lead, mercury, arsenic, aluminum
                - electrolytes: Sodium, potassium, calcium, chloride
                - blood: Complete blood count, RBC indices
                - urine: Comprehensive urinalysis
                - infections_std: STD panel, Lyme disease
                - genetics_risk: ApoE genotype for Alzheimer's
                - allergies_sensitivities: Food and environmental allergies
            `
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "create_action_plan",
      description: "Create a 3-step daily action plan for the user with appropriate icons. Use when the user would benefit from specific actionable steps.",
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
                  description: "Icon to display with this step: exclamation-triangle (warnings), bowl-food (nutrition), pills (supplements), vials (testing)"
                }
              },
              required: ["text", "icon"]
            },
            description: "Three daily action steps with appropriate icons"
          }
        },
        required: ["steps"]
      }
    }
  }
]

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json()
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        response: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.",
        actionPlan: null 
      })
    }

    // Create a streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Multi-turn conversation flow like Cascade
          let messages: any[] = [
            { role: "system", content: SYSTEM_PROMPT },
            ...conversationHistory,
            { role: "user", content: message }
          ]

          let healthData = null
          let actionPlan = null
          let searchQuery = ""
          let foundItems: string[] = []
          let conversationComplete = false
          let maxTurns = 5 // Prevent infinite loops

          while (!conversationComplete && maxTurns > 0) {
            const completion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: messages,
              tools: tools,
              tool_choice: "auto",
              stream: true
            })

            let responseMessage: any = { role: "assistant", content: "", tool_calls: [] }
            let currentToolCall: any = null
            let toolCallIndex = 0

            // Stream the response
            for await (const chunk of completion) {
              const delta = chunk.choices[0]?.delta

              if (delta?.content) {
                // Stream individual words/tokens
                responseMessage.content += delta.content
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'text',
                  content: delta.content
                })}\n\n`))
              }

              if (delta?.tool_calls) {
                for (const toolCallDelta of delta.tool_calls) {
                  if (toolCallDelta.index !== undefined) {
                    toolCallIndex = toolCallDelta.index
                  }

                  if (!responseMessage.tool_calls[toolCallIndex]) {
                    responseMessage.tool_calls[toolCallIndex] = {
                      id: toolCallDelta.id || '',
                      type: 'function',
                      function: { name: '', arguments: '' }
                    }
                  }

                  if (toolCallDelta.function?.name) {
                    responseMessage.tool_calls[toolCallIndex].function.name = toolCallDelta.function.name
                  }

                  if (toolCallDelta.function?.arguments) {
                    responseMessage.tool_calls[toolCallIndex].function.arguments += toolCallDelta.function.arguments
                  }
                }
              }
            }

            messages.push(responseMessage)

            // If no tool calls, conversation is complete
            if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
              conversationComplete = true
              break
            }

            // Process each tool call and stream results
            for (const toolCall of responseMessage.tool_calls) {
              const functionName = toolCall.function.name
              const functionArgs = JSON.parse(toolCall.function.arguments)

              if (functionName === "search_health_data") {
                searchQuery = functionArgs.query
                
                // Stream function call start
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'function_start',
                  function: 'search_health_data',
                  query: searchQuery
                })}\n\n`))
                
                // Call our health search API
                const healthResponse = await fetch(`${request.nextUrl.origin}/api/health-search`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ query: functionArgs.query })
                })
                healthData = await healthResponse.json()
                
                // Extract found items for display
                if (healthData.data) {
                  foundItems = Object.keys(healthData.data).map(category => 
                    category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  )
                }

                // Stream health search results
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'health_search',
                  query: searchQuery,
                  foundItems: foundItems,
                  data: healthData
                })}\n\n`))

                messages.push({
                  role: "tool" as const,
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(healthData)
                })

              } else if (functionName === "create_action_plan") {
                // Stream function call start
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'function_start',
                  function: 'create_action_plan'
                })}\n\n`))

                // Handle both old string format and new structured format
                if (typeof functionArgs.steps[0] === 'string') {
                  // Old format - convert to numbered list
                  actionPlan = functionArgs.steps.map((step: string, index: number) => 
                    `${index + 1}. ${step}`
                  ).join('\n')
                } else {
                  // New structured format with icons
                  actionPlan = {
                    steps: functionArgs.steps,
                    formatted: functionArgs.steps.map((step: { text: string, icon: string }, index: number) => 
                      `${index + 1}. ${step.text}`
                    ).join('\n')
                  }
                }

                // Stream action plan results
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'action_plan',
                  actionPlan: actionPlan
                })}\n\n`))

                messages.push({
                  role: "tool" as const,
                  tool_call_id: toolCall.id,
                  content: "Action plan created successfully"
                })
              }
            }

            maxTurns--
          }

          // Stream completion
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete'
          })}\n\n`))

        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            message: 'Sorry, there was an error processing your request.'
          })}\n\n`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      response: `Sorry, there was an error processing your request. ${error}`,
      actionPlan: null 
    }, { status: 500 })
  }
}
