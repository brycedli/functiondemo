interface HealthSearchCardProps {
  searchQuery: string
  foundItems: string[]
  summaries?: string[]
}

export default function HealthSearchCard({ searchQuery, foundItems, summaries = [] }: HealthSearchCardProps) {
  return (
    <div className="">
      <div className="flex items-center mb-2">
        <div className="flex mr-2">
          <div className="w-7 h-7 relative bg-khaki-150 rounded-2xl outline outline-2 outline-khaki-50 overflow-hidden flex justify-center items-center">
            <div className="text-gray-800 text-xs">
              <i className="fas fa-stethoscope"></i>
            </div>
          </div>
          <div className="w-7 h-7 ml-[-6px] relative bg-khaki-150 rounded-2xl outline outline-2 outline-khaki-50 overflow-hidden flex justify-center items-center">
            <div className="text-gray-800 text-xs">
              <i className="fas fa-chart-line"></i>
            </div>
          </div>
          <div className="w-7 h-7 ml-[-6px] relative bg-khaki-150 rounded-2xl outline outline-2 outline-khaki-50 overflow-hidden flex justify-center items-center">
            <div className="text-gray-800 text-xs">
              <i className="fas fa-vials"></i>
            </div>
          </div>
        </div>
        <span className="text-[18px] font-semibold text-gray-850">Analyzing your data</span>
      </div>
      
      {summaries && summaries.length > 0 && (
        <div className="pl-[10px] flex flex-row gap-[12px]">
          <div className="w-3 self-stretch bg-khaki-150 rounded-sm"></div>
          <div className="space-y-2 text-gray-800">
            {summaries.map((summary, index) => (
              <div key={index} className="flex items-start">
                <p className="text-[14px] text-gray-600">{summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
