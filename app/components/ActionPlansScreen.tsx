interface ActionPlansScreenProps {
  actionPlans: string[]
}

export default function ActionPlansScreen({ actionPlans }: ActionPlansScreenProps) {
  return (
    <div className="h-full w-full bg-gray-900 p-4">
      <h1 className="text-white text-2xl font-bold mb-4">Action Plans</h1>
      
      {actionPlans.length === 0 ? (
        <div className="text-gray-400 text-center mt-20">
          <p>No action plans yet</p>
          <p className="text-sm mt-2">Chat with AI to generate action plans</p>
        </div>
      ) : (
        <div className="space-y-4">
          {actionPlans.map((plan, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Action Plan {index + 1}</h3>
              <div className="text-gray-300 whitespace-pre-line">{plan}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
