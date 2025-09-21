interface HealthSearchCardProps {
  searchQuery: string
  foundItems: string[]
}

export default function HealthSearchCard({ searchQuery, foundItems }: HealthSearchCardProps) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 mb-3 text-sm">
      <div className="flex items-center mb-1">
        <span className="mr-2">🔍</span>
        <span className="font-bold text-gray-200">Searched your health data</span>
      </div>
      <div className="text-gray-400">
        <span className="font-medium">Found:</span> {foundItems.length > 0 ? foundItems.join(', ') : 'No specific matches'}
      </div>
    </div>
  )
}
