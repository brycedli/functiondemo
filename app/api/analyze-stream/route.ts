import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Mock data generators (same as analyze-health)
function generateMockJournalEntries(query: string) {
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

function generateMockResearchArticles(query: string) {
  const articles = [
    {
      icon: "file",
      title: "The Future of Cow's Milk Allergy",
      url: "https://example.com/milk-allergy"
    },
    {
      icon: "file", 
      title: "Dairy and Corn Cross-Reactivity",
      url: "https://example.com/dairy-corn"
    },
    {
      icon: "file",
      title: "Hidden Allergens in Staple Foods", 
      url: "https://example.com/hidden-allergens"
    },
    {
      icon: "file",
      title: "Lactose Intolerance vs Milk Allergy",
      url: "https://example.com/lactose-vs-allergy"
    },
    {
      icon: "file",
      title: "Food Sensitivity Testing Methods",
      url: "https://example.com/sensitivity-testing"
    }
  ]
  
  if (query.toLowerCase().includes('mexican') || query.toLowerCase().includes('dairy')) {
    return articles.slice(0, 3)
  }
  return articles.slice(0, 2)
}

function generateMockHealthData(query: string) {
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

const ANALYSIS_PROMPT = `You are a comprehensive health analysis assistant. Based on the provided health data, journal entries, and research articles, provide a thorough analysis.

Your response should:
1. Synthesize information from all sources (health data, journal entries, research)
2. Identify patterns and connections between the data
3. Explain potential causes and mechanisms
4. Reference specific biomarkers, journal patterns, and research findings
5. Be informative and analytical, not prescriptive

Focus on connecting the dots between different data sources to provide insights.`

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: "OpenAI API key not configured"
      }, { status: 500 })
    }

    // Create a readable stream for progressive updates
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        // Step 1: Start analyzing health data
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'step_start',
          step: {
            id: 'health_data',
            title: 'Analyzing your data',
            icon: 'loader',
            status: 'loading'
          }
        })}\n\n`))
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const healthData = generateMockHealthData(message)
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'step_complete',
          step: {
            id: 'health_data',
            title: 'Analyzing your data',
            icon: 'loader',
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
          type: 'step_start',
          step: {
            id: 'journal_entries',
            title: 'Searching journal entries',
            icon: 'book',
            status: 'loading'
          }
        })}\n\n`))
        
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const journalEntries = generateMockJournalEntries(message)
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'step_complete',
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
          type: 'step_start',
          step: {
            id: 'research',
            title: 'Researching',
            icon: 'search',
            status: 'loading'
          }
        })}\n\n`))
        
        await new Promise(resolve => setTimeout(resolve, 1200))
        
        const researchArticles = generateMockResearchArticles(message)
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'step_complete',
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
          type: 'step_start',
          step: {
            id: 'thinking',
            title: 'Thinking...',
            icon: 'loader',
            status: 'loading'
          }
        })}\n\n`))
        
        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, thinkingTime * 1000))
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'step_complete',
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
        
        // Step 5: Generate final analysis
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'analysis_start'
        })}\n\n`))
        
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              { role: "system", content: ANALYSIS_PROMPT },
              { 
                role: "user", 
                content: `User question: ${message}

Health Data: ${JSON.stringify(healthData, null, 2)}

Journal Entries: ${JSON.stringify(journalEntries, null, 2)}

Research Articles: ${JSON.stringify(researchArticles, null, 2)}

Please provide a comprehensive analysis connecting all this information.`
              }
            ]
          })
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'analysis_complete',
            response: completion.choices[0].message.content,
            metadata: {
              journalEntriesCount: journalEntries.length,
              researchArticlesCount: researchArticles.length,
              thinkingTime: thinkingTime
            }
          })}\n\n`))
          
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: 'Failed to generate analysis'
          })}\n\n`))
        }
        
        controller.close()
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
    console.error('Analysis streaming error:', error)
    return NextResponse.json({ 
      error: "Failed to start analysis stream"
    }, { status: 500 })
  }
}
