import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SEARCH_PROMPT = `You are a health data search assistant. Your job is to determine what health data categories to search based on the user's question.

Available categories:
- heart_cardiovascular: Cholesterol, lipoproteins, triglycerides, ApoB
- thyroid: TSH, T3, T4, thyroid antibodies
- autoimmunity: ANA, celiac, rheumatoid factor
- immune_regulation: CRP, white blood cell counts
- female_health: Hormones (AMH, estradiol, FSH, LH, prolactin)
- male_health: Testosterone, PSA, male hormones
- stress_aging: Cortisol, DHEA, biological age
- metabolic: Glucose, HbA1c, insulin, leptin
- nutrients: Vitamins, minerals, omega ratios, ferritin
- liver_function: ALT, AST, bilirubin, albumin
- kidneys: Creatinine, BUN, eGFR, microalbumin
- heavy_metals: Lead, mercury, arsenic, aluminum
- electrolytes: Sodium, potassium, calcium, chloride
- blood: Complete blood count, RBC indices
- allergies_sensitivities: Food and environmental allergies

Return a search query that includes relevant category names and biomarkers.`

const tools = [
  {
    type: "function" as const,
    function: {
      name: "search_health_data",
      description: "Search the user's health database for relevant information",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for health data categories and biomarkers"
          }
        },
        required: ["query"]
      }
    }
  }
]

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: "OpenAI API key not configured"
      }, { status: 500 })
    }

    // Get search query from AI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SEARCH_PROMPT },
        { role: "user", content: message }
      ],
      tools: tools,
      tool_choice: { type: "function", function: { name: "search_health_data" } }
    })

    const toolCall = completion.choices[0].message.tool_calls?.[0]
    if (!toolCall) {
      return NextResponse.json({ error: "No search query generated" }, { status: 500 })
    }

    const searchQuery = JSON.parse(toolCall.function.arguments).query

    // Search health data
    const healthResponse = await fetch(`${request.nextUrl.origin}/api/health-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: searchQuery })
    })
    const healthData = await healthResponse.json()

    // Extract found items for display
    let foundItems: string[] = []
    if (healthData.data) {
      foundItems = Object.keys(healthData.data).map(category => 
        category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      )
    }

    return NextResponse.json({
      query: searchQuery,
      foundItems: foundItems,
      healthData: healthData
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ 
      error: "Failed to search health data"
    }, { status: 500 })
  }
}
