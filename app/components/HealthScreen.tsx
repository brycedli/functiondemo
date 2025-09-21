export default function HealthScreen() {
  // Day data for the week
  const days = [
    { name: 'Fri', status: 'moderate', selected: false },
    { name: 'Sat', status: 'moderate', selected: false },
    { name: 'Sun', status: 'in-range', selected: false },
    { name: 'Mon', status: 'in-range', selected: false },
    { name: 'Tue', status: 'today', selected: true },
    { name: 'Wed', status: 'future', selected: false },
    { name: 'Thu', status: 'future', selected: false },
  ]
  
  // Function to render the status indicator based on the day's status
  const renderStatusIndicator = (status: string) => {
    switch (status) {
      case 'moderate':
        return <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
      case 'in-range':
        return <div className="w-4 h-4 bg-green-500 rounded-full border border-green-500"></div>
      case 'today':
        return (
          <div className="w-5 h-5 relative overflow-hidden">
            <div className="w-5 h-5 left-0 top-0 absolute rounded-full border-4 border-orange-200"></div>
            <div className="w-5 h-5 left-0 top-0 absolute rounded-full border-4 border-orange-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)' }}></div>
            <div className="w-3 h-3 left-[4px] top-[4px] absolute flex items-center justify-center text-orange-100">
              <i className="fas fa-circle text-xs"></i>
            </div>
          </div>
        )
      case 'future':
      default:
        return <div className="w-4 h-4 bg-khaki-50 rounded-full border border-gray-300"></div>
    }
  }
  
  return (
    <div className="h-full w-full bg-khaki-50 p-4">
      {/* Day picker component */}
      <div className="w-full flex flex-col justify-start items-start gap-2">
        <div className="w-full flex justify-between items-start">
          {days.map((day, index) => (
            <div 
              key={index}
              className={`p-3 flex-1 ${day.selected ? 'outline outline-1 outline-offset-[-1px] outline-khaki-150 ' : ''} rounded-[12px] flex flex-col justify-center items-center gap-3`}
            >
              <div 
                className={`text-center justify-center ${day.selected ? 'text-gray-800 font-semibold' : 'text-gray-600 font-normal'} text-sm leading-snug`}
              >
                {day.name}
              </div>
              {renderStatusIndicator(day.status)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Task card component */}
      <div className="w-full mt-4 relative flex flex-col justify-start items-start gap-2">
        <div className="w-full flex flex-col justify-start items-center">
          <div className="w-full flex flex-col justify-start items-center pr-4">
            <div className="w-full pl-1.5 pr-4 py-1.5 bg-khaki-50 rounded-2xl outline outline-1 outline-offset-[-1px] outline-khaki-150 flex flex-col justify-center items-center gap-3">
              <div className="self-stretch inline-flex justify-start items-center gap-2">
                <div className="px-2 py-2 relative bg-orange-100 rounded-xl inline-flex flex-col justify-center items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className="fas fa-walking text-orange-500 text-2xl"></i>
                  </div>
                </div>
                <div className="flex-1 inline-flex flex-col justify-center items-start">
                  <div className="self-stretch justify-start text-gray-800 text-sm font-semibold leading-snug">Take a 20 min brisk walk</div>
                  <div className="self-stretch justify-start text-gray-600 text-sm font-normal leading-snug">Keep your glucose from spiking</div>
                </div>
                <div className="w-5 h-5 rounded-full border border-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pagination dots */}
        <div className="py-1 absolute right-0 top-1/2 -translate-y-1/2 inline-flex justify-center items-center gap-1.5 flex-col">
          <div className="w-1.5 h-5 bg-gray-500 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
