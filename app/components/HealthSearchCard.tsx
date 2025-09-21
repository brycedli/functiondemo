interface HealthSearchCardProps {
  searchQuery: string
  foundItems: string[]
  summaries?: string[]
}

export default function HealthSearchCard({ searchQuery, foundItems, summaries = [] }: HealthSearchCardProps) {
  return (
    <div className="">
      <div className="flex items-center mb-2">
        <i className="fa-solid fa-magnifying-glass mr-2 text-gray-600"></i>
        <span className="text-[18px] font-semibold text-gray-850">Searched your health data</span>
      </div>
      
      {summaries && summaries.length > 0 ? (
        <div className="pl-[6px] flex flex-row gap-[14px]">
          <div className="w-2 self-stretch bg-khaki-150 rounded-sm"></div>
          <div className="space-y-2 text-gray-800">
            {summaries.map((summary, index) => (
              <div key={index} className="flex items-start">
                <p className="text-[14px] text-gray-600">{summary}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-600">
          <span className="font-medium">Found:</span> {foundItems.length > 0 ? foundItems.join(', ') : 'No specific matches'}
        </div>
      )}
    </div>
  )
}
