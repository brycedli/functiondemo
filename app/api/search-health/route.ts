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

const SUMMARY_PROMPT = `You are a health data interpreter. Your job is to provide concise, insightful summaries of health data findings.

For each health category, provide a brief summary that includes:
1. Whether values are within normal range or out of range
2. The potential health implications of these findings
3. Any notable patterns or concerns

Keep each summary as short as possible (<1 sentence). Use plain language that a patient can understand. Mention specific biomarkers only when relevant.

Examples:
- "Your bone health is significantly out of range, possibly indicating early osteopenia."
- "Your blood markers are within normal range, suggesting healthy red blood cell function."
- "Your vitamin D is below optimal levels, which may affect immune function and mood."`

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

    // Generate health data summaries using LLM
    let healthSummaries: string[] = []
    if (healthData.data && Object.keys(healthData.data).length > 0) {
      // Format health data for the LLM
      const healthDataFormatted = Object.entries(healthData.data).map(([category, data]) => {
        const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        return `${categoryName}:\n${JSON.stringify(data, null, 2)}`
      }).join('\n\n')

      // Get summaries from OpenAI
      const summaryCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SUMMARY_PROMPT },
          { role: "user", content: `Based on the following health data, provide concise summaries for each category:\n\n${healthDataFormatted}` }
        ],
        temperature: 0.3,
      })

      const summaryContent = summaryCompletion.choices[0].message.content
      if (summaryContent) {
        // Extract individual summaries (one per line)
        healthSummaries = summaryContent
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^- /, '')) // Remove leading bullet points if present
      }
    }

    return NextResponse.json({
      query: searchQuery,
      foundItems: foundItems,
      healthSummaries: healthSummaries,
      healthData: healthData
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ 
      error: "Failed to search health data"
    }, { status: 500 })
  }
}
