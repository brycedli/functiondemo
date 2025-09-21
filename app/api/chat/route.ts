import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a health AI assistant with access to comprehensive health data. For EVERY health question:

1. ALWAYS call search_health_data function first to look for relevant biomarkers
2. ALWAYS call create_action_plan function to provide 3 specific daily steps
3. Never provide action steps in regular text - only through the create_action_plan function

IMPORTANT: You must use both functions for every health-related query. Do not give advice without calling these functions.

Available health data categories:
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

Example workflow:
User: "I have acne issues"
1. Call search_health_data with query "hormones nutrients inflammatory markers"
2. Analyze the data for hormone imbalances, nutrient deficiencies, inflammation. Describe the issue and reason any causes for at least three sentences.
3. Call create_action_plan with 3 specific daily steps based on the data findings

NEVER provide numbered action steps in your response text - always use the create_action_plan function.
NEVER use markdown or bolding. Respond conversationally.`

const tools = [
  {
    type: "function" as const,
    function: {
      name: "search_health_data",
      description: "Search the user's health database for relevant information. Can search specific categories (e.g. 'heart_cardiovascular thyroid') or biomarkers (e.g. 'cholesterol glucose vitamin d'). Use targeted searches for better results.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for health data. Can include category names, biomarker names, or health conditions. Examples: 'heart cardiovascular', 'cholesterol ldl', 'thyroid tsh', 'nutrients vitamins', 'metabolic glucose insulin'"
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
      description: "Create a 3-step daily action plan for the user. Do not number the steps.",
      parameters: {
        type: "object",
        properties: {
          steps: {
            type: "array",
            items: { type: "string" },
            description: "Three daily action steps"
          }
        },
        required: ["steps"]
      }
    }
  }
]

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        response: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.",
        actionPlan: null 
      })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      tools: tools,
      tool_choice: { type: "function", function: { name: "search_health_data" } }
    })

    const responseMessage = completion.choices[0].message
    let healthData = null
    let actionPlan = null
    let searchQuery = ""
    let foundItems: string[] = []

    // Handle tool calls
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0]
      const functionName = toolCall.function.name
      const functionArgs = JSON.parse(toolCall.function.arguments)

      if (functionName === "search_health_data") {
        searchQuery = functionArgs.query
        
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

        // Get follow-up response with health data
        const followUpCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message },
            responseMessage,
            {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(healthData)
            }
          ],
          tools: tools,
          tool_choice: { type: "function", function: { name: "create_action_plan" } }
        })

        const followUpMessage = followUpCompletion.choices[0].message
        
        // Check if it wants to create an action plan
        if (followUpMessage.tool_calls && followUpMessage.tool_calls.length > 0) {
          const actionPlanCall = followUpMessage.tool_calls.find(call => call.function.name === "create_action_plan")
          if (actionPlanCall) {
            const planArgs = JSON.parse(actionPlanCall.function.arguments)
            actionPlan = planArgs.steps.map((step: string, index: number) => 
              `${index + 1}. ${step}`
            ).join('\n')

            // Get final response
            const finalCompletion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: message },
                responseMessage,
                {
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(healthData)
                },
                followUpMessage,
                {
                  role: "tool",
                  tool_call_id: actionPlanCall.id,
                  content: "Action plan created successfully"
                }
              ]
            })

            return NextResponse.json({
              response: finalCompletion.choices[0].message.content,
              actionPlan,
              healthSearch: {
                query: searchQuery,
                foundItems: foundItems
              }
            })
          }
        }

        return NextResponse.json({
          response: followUpMessage.content,
          actionPlan,
          healthSearch: {
            query: searchQuery,
            foundItems: foundItems
          }
        })
      }
    }

    return NextResponse.json({
      response: responseMessage.content,
      actionPlan,
      healthSearch: searchQuery ? {
        query: searchQuery,
        foundItems: foundItems
      } : null
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      response: "Sorry, there was an error processing your request. Make sure your OpenAI API key is configured.",
      actionPlan: null 
    }, { status: 500 })
  }
}
