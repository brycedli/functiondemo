import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a friendly, helpful AI assistant created by Function Health with access to comprehensive health analysis and action planning capabilities. You can have normal conversations about anything and intelligently choose when to use your available functions. 

Available functions:
- analyze_comprehensive_health: Use for ANY health-related questions - this performs deep analysis across health data, journal entries, and research articles
- create_action_plan: Use to give the user a 3-step daily action plan with appropriate icons:
  * exclamation-triangle: for warnings or important notices
  * bowl-food: for nutrition and food-related recommendations  
  * pills: for supplements or medication recommendations
  * vials: for lab testing or medical procedures

IMPORTANT: You can make multiple function calls in sequence! First analyze their health comprehensively, then create an action plan. This is a multi-turn conversation.

CRITICAL RULE: When creating action plans, NEVER list the steps in your text response. Instead:
- Say something like "Here's your personalized action plan:" or "I've created a plan for you:"
- Then call the create_action_plan function
- The function will display the steps with proper formatting and icons
- Do NOT repeat the steps in text after calling the function

Example flow:
1. User asks about fatigue
2. You call analyze_comprehensive_health to perform deep analysis across all data sources
3. You explain what you found from the comprehensive analysis
4. You say "Here's your action plan:" and call create_action_plan
5. You provide any final thoughts (without repeating the steps)

Be biased towards action– you are proactive agent that should analyze and create action plans for ANY health-related question, no matter how simple. Always use comprehensive analysis instead of basic search. Do not ask the user for permission to use functions. NEVER use markdown, numbered lists, or bolding. Keep responses friendly and conversational.`

const tools = [
  {
    type: "function" as const,
    function: {
      name: "analyze_comprehensive_health",
      description: "Perform a comprehensive multi-step analysis of the user's health data, journal entries, and research articles. Use this for ANY health-related questions - from simple biomarker questions to complex health concerns.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The health concern, question, or topic to analyze comprehensively across all available data sources"
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
        error: "OpenAI API key not configured"
      }, { status: 500 })
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

              if (functionName === "analyze_comprehensive_health") {
                // Stream function call start
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'function_start',
                  function: 'analyze_comprehensive_health',
                  query: functionArgs.query
                })}\n\n`))
                
                // Import the mock data generators and analysis logic
                const generateMockJournalEntries = (query: string) => {
                  const entries = [
                    {
                      icon: "utensils",
                      title: "Mexican food",
                      count: "3 Entries",
                      details: ["Experienced bloating after tacos", "Stomach discomfort with cheese", "Similar reaction to corn tortillas"]
                    },
                    {
                      icon: "glass-water",
                      title: "Dairy products",
                      count: "5 Entries", 
                      details: ["Milk caused digestive issues", "Ice cream triggered symptoms", "Yogurt seemed okay"]
                    },
                    {
                      icon: "wheat",
                      title: "Gluten foods",
                      count: "2 Entries",
                      details: ["Bread caused fatigue", "Pasta led to brain fog"]
                    }
                  ]
                  
                  if (query.toLowerCase().includes('mexican') || query.toLowerCase().includes('dairy')) {
                    return entries.slice(0, 2)
                  }
                  return entries.slice(0, 1)
                }

                const generateMockResearchArticles = (query: string) => {
                  const articles = [
                    {
                      icon: "file",
                      title: "The Future of Cow's Milk Allergy: Diagnostic Approaches",
                      url: "https://example.com/milk-allergy"
                    },
                    {
                      icon: "file", 
                      title: "Dairy and Corn Cross-Reactivity in Adults",
                      url: "https://example.com/dairy-corn"
                    },
                    {
                      icon: "file",
                      title: "Hidden Allergens in Processed Foods", 
                      url: "https://example.com/hidden-allergens"
                    },
                    {
                      icon: "file",
                      title: "Lactose Intolerance vs Milk Protein Allergy",
                      url: "https://example.com/lactose-vs-allergy"
                    },
                    {
                      icon: "file",
                      title: "Food Sensitivity Testing: IgG vs IgE Methods",
                      url: "https://example.com/sensitivity-testing"
                    },
                    {
                      icon: "file",
                      title: "Gut Microbiome and Food Sensitivities",
                      url: "https://example.com/microbiome-sensitivity"
                    },
                    {
                      icon: "file",
                      title: "Inflammatory Markers in Digestive Disorders",
                      url: "https://example.com/inflammatory-markers"
                    },
                    {
                      icon: "file",
                      title: "Elimination Diets: Evidence-Based Protocols",
                      url: "https://example.com/elimination-diets"
                    },
                    {
                      icon: "file",
                      title: "Histamine Intolerance and Food Reactions",
                      url: "https://example.com/histamine-intolerance"
                    },
                    {
                      icon: "file",
                      title: "FODMAP Sensitivity and IBS Management",
                      url: "https://example.com/fodmap-sensitivity"
                    },
                    {
                      icon: "file",
                      title: "Leaky Gut Syndrome: Current Research",
                      url: "https://example.com/leaky-gut"
                    },
                    {
                      icon: "file",
                      title: "Gluten Sensitivity Beyond Celiac Disease",
                      url: "https://example.com/gluten-sensitivity"
                    },
                    {
                      icon: "file",
                      title: "Nutritional Deficiencies in Food Allergies",
                      url: "https://example.com/nutritional-deficiencies"
                    },
                    {
                      icon: "file",
                      title: "Stress and Digestive Health Interactions",
                      url: "https://example.com/stress-digestion"
                    },
                    {
                      icon: "file",
                      title: "Probiotics in Allergy Management",
                      url: "https://example.com/probiotics-allergies"
                    }
                  ]
                  
                  // Shuffle and return a random number of articles (1-4)
                  const shuffled = articles.sort(() => 0.5 - Math.random())
                  const count = Math.floor(Math.random() * 4) + 1 // Random number between 1-4
                  return shuffled.slice(0, count)
                }

                const generateMockHealthData = (query: string) => {
                  const healthData = {
                    "inflammation": {
                      "CRP": { value: 2.1, unit: "mg/L", range: "<3.0", status: "normal" },
                      "ESR": { value: 15, unit: "mm/hr", range: "0-20", status: "normal" }
                    },
                    "digestive": {
                      "IgA": { value: 180, unit: "mg/dL", range: "70-400", status: "normal" },
                      "IgG": { value: 1200, unit: "mg/dL", range: "700-1600", status: "normal" }
                    },
                    "allergies": {
                      "Total_IgE": { value: 45, unit: "IU/mL", range: "<100", status: "normal" },
                      "Eosinophils": { value: 3.2, unit: "%", range: "1-4", status: "normal" }
                    }
                  }
                  
                  return healthData
                }

                // Step 1: Start analyzing health data
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'analysis_step_start',
                  step: {
                    id: 'health_data',
                    title: 'Analyzing your data',
                    icon: 'loader',
                    status: 'loading'
                  }
                })}\n\n`))
                
                // Simulate processing time
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                const healthData = generateMockHealthData(functionArgs.query)
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'analysis_step_complete',
                  step: {
                    id: 'health_data',
                    title: 'Analyzing your data',
                    icon: 'check',
                    status: 'completed',
                    data: {
                      title: 'Health Data',
                      items: Object.entries(healthData).map(([category, tests]) => ({
                        icon: 'vial',
                        title: category.charAt(0).toUpperCase() + category.slice(1),
                        count: `${Object.keys(tests).length} Tests`
                      }))
                    }
                  }
                })}\n\n`))
                
                // Step 2: Journal entries
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'analysis_step_start',
                  step: {
                    id: 'journal_entries',
                    title: 'Searching journal entries',
                    icon: 'book',
                    status: 'loading'
                  }
                })}\n\n`))
                
                await new Promise(resolve => setTimeout(resolve, 800))
                
                const journalEntries = generateMockJournalEntries(functionArgs.query)
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'analysis_step_complete',
                  step: {
                    id: 'journal_entries',
                    title: 'Journal Entries',
                    icon: 'book',
                    status: 'completed',
                    data: {
                      title: 'Journal Entries',
                      items: journalEntries
                    }
                  }
                })}\n\n`))
                
                // Step 3: Research articles
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'analysis_step_start',
                  step: {
                    id: 'research',
                    title: 'Researching',
                    icon: 'search',
                    status: 'loading'
                  }
                })}\n\n`))
                
                await new Promise(resolve => setTimeout(resolve, 1200))
                
                const researchArticles = generateMockResearchArticles(functionArgs.query)
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'analysis_step_complete',
                  step: {
                    id: 'research',
                    title: 'Researching',
                    icon: 'search',
                    status: 'completed',
                    data: {
                      title: 'Articles & Studies',
                      items: researchArticles
                    }
                  }
                })}\n\n`))
                
                // Step 4: Thinking phase
                const thinkingTime = Math.floor(Math.random() * 4) + 2
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'analysis_step_start',
                  step: {
                    id: 'thinking',
                    title: 'Thinking...',
                    icon: 'brain',
                    status: 'loading'
                  }
                })}\n\n`))
                
                // Simulate thinking time
                await new Promise(resolve => setTimeout(resolve, thinkingTime * 1000))
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'analysis_step_complete',
                  step: {
                    id: 'thinking',
                    title: `Thought for ${thinkingTime} seconds`,
                    icon: 'check',
                    status: 'completed',
                    data: {
                      summary: `${journalEntries.length} Journal Entries · ${researchArticles.length} Articles & Studies`
                    }
                  }
                })}\n\n`))
                
                // Skip the expensive final analysis generation since we're not showing it to users
                // The AI will provide its own conversational summary based on the structured data
                const analysisResponse = `Comprehensive analysis completed. Found ${Object.keys(healthData).length} health data categories, ${journalEntries.length} relevant journal entries, and ${researchArticles.length} research articles. The AI will now provide a conversational summary of the key insights.`
                
                // Stream analysis completion (without the full response)
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'analysis_complete',
                  metadata: {
                    journalEntriesCount: journalEntries.length,
                    researchArticlesCount: researchArticles.length,
                    thinkingTime: thinkingTime
                  }
                })}\n\n`))

                // Pass the analysis results back to the AI for it to summarize
                messages.push({
                  role: "tool" as const,
                  tool_call_id: toolCall.id,
                  content: `Analysis completed successfully. Key findings from comprehensive analysis:

Health Data Analysis: Found ${Object.keys(healthData).length} categories of biomarkers including ${Object.keys(healthData).map(cat => cat.replace(/_/g, ' ')).join(', ')}.

Journal Entries: Identified ${journalEntries.length} relevant entries: ${journalEntries.map(entry => entry.title).join(', ')}.

Research Articles: Found ${researchArticles.length} relevant studies: ${researchArticles.map(article => article.title).join(', ')}.

Detailed Analysis: ${analysisResponse}

Please provide a concise, conversational summary of the key insights and what this means for the user.`
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
      error: "Failed to process chat request"
    }, { status: 500 })
  }
}
