interface ActionPlanCardProps {
  steps: string[]
  timestamp?: string
}

export default function ActionPlanCard({ steps, timestamp }: ActionPlanCardProps) {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 mt-3 border border-blue-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm flex items-center">
          <span className="mr-2">📋</span>
          Action Plan
        </h3>
        {timestamp && (
          <span className="text-blue-300 text-xs">{timestamp}</span>
        )}
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {index + 1}
            </div>
            <div className="flex-1 text-gray-100 text-sm leading-relaxed">
              {step}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-blue-800">
        <div className="flex items-center justify-between">
          <span className="text-blue-300 text-xs">
            💡 Personalized based on your health data
          </span>
          <button className="text-blue-400 hover:text-blue-300 text-xs underline">
            Save to Actions
          </button>
        </div>
      </div>
    </div>
  )
}
