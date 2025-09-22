interface HealthScreenProps {
  onNavigateToChat?: () => void
}

export default function HealthScreen({ onNavigateToChat }: HealthScreenProps) {
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
            <div className="w-5 h-5 left-0 top-0 absolute rounded-full border-4 border-orange-150"></div>
            <div className="w-5 h-5 left-0 top-0 absolute rounded-full border-4 border-orange-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)' }}></div>
            <div className="w-3 h-3 left-[4px] top-[4px] absolute flex items-center justify-center text-orange-50">
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
    <div className="h-full w-full bg-khaki-50 flex flex-col pt-[54px] pb-[24px] rounded-r-[32px]">
      {/* Health Navigation Menu */}
      <div className="self-stretch pl-4 pr-1 py-1 inline-flex justify-between items-center">
        <div className="h-11 flex justify-start items-center gap-2.5">
          <div className="w-11 h-11 p-2.5 inline-flex flex-col justify-center items-center gap-2.5">
            <div className="w-11 h-11 text-center justify-center text-gray-800 text-xl">
              <i className="fas fa-user-gear"></i>
            </div>
          </div>
        </div>
        <div className="flex-1 self-stretch flex justify-center items-center gap-7">
          <div className="py-0.5 border-b-2 border-gray-800 flex justify-center items-center gap-1">
            <div className="text-center justify-center text-gray-800 text-base font-semibold leading-relaxed">My Data</div>
          </div>
          <div className="py-0.5 border-b-2 border-transparent flex justify-center items-center gap-1">
            <div className="text-center justify-center text-gray-500 text-base font-semibold leading-relaxed">Get Tests</div>
          </div>
        </div>
        <div className="h-11 flex justify-start items-center gap-2.5">
          <button 
            onClick={onNavigateToChat}
            className="w-11 h-11 p-2.5 inline-flex flex-col justify-center items-center gap-2.5"
          >
            <div className="w-11 h-11 text-center justify-center text-gray-800 text-xl">
              <i className="fas fa-arrow-right"></i>
            </div>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
      {/* Day picker component */}
      <div className="w-full flex flex-col justify-start items-start gap-2 px-4 py-2">
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
      <div className="w-full relative flex flex-col justify-start items-start gap-2 px-4 py-3">
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
        <div className="py-1 absolute right-4 top-1/2 -translate-y-1/2 inline-flex justify-center items-center gap-1.5 flex-col">
          <div className="w-1.5 h-5 bg-gray-500 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      <div className="w-full h-2 bg-khaki-150"></div>

      {/* Biomarkers chart */}
      <div className="w-full inline-flex flex-col justify-start items-start gap-3">
        <div className="w-full px-4 pt-6 pb-3 inline-flex justify-start items-center gap-6">
          <div className="flex-1 justify-start text-gray-800 text-xl font-semibold leading-7">146 Biomarkers</div>
          <div className="pl-2 pr-3 py-[5px] bg-khaki-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-khaki-150 flex justify-start items-center gap-1">
            <div className="w-5 h-5 text-center justify-center text-gray-800 text-sm font-normal">
              <i className="fas fa-plus"></i>
            </div>
            <div className="justify-start text-gray-800 text-sm font-semibold leading-snug">Upload</div>
          </div>
        </div>
        <div className="w-full flex flex-col justify-start items-start gap-2 overflow-hidden">
          <div className="w-full px-4 py-1 inline-flex justify-center items-end gap-1">
            <div className="flex-1 inline-flex flex-col justify-end items-center gap-3">
              <div className="w-full h-20 flex flex-col justify-end items-center">
                <div className="text-center justify-start text-green-500 text-3xl font-bold leading-10">131</div>
                <div className="w-full text-center justify-start text-gray-800 text-base font-normal leading-relaxed">In Range</div>
              </div>
              <div className="w-full h-36 relative bg-green-500 rounded-lg"></div>
            </div>
            <div className="flex-1 inline-flex flex-col justify-end items-center gap-3">
              <div className="w-full flex flex-col justify-end items-center">
                <div className="text-center justify-start text-orange-500 text-3xl font-bold leading-10">16</div>
                <div className="w-full text-center justify-start text-gray-800 text-base font-normal leading-relaxed">Out of Range</div>
              </div>
              <div className="w-full h-8 relative bg-orange-500 rounded-lg"></div>
            </div>
            <div className="flex-1 inline-flex flex-col justify-end items-center gap-3">
              <div className="w-full flex flex-col justify-end items-center">
                <div className="text-center justify-start text-gray-500 text-3xl font-bold leading-10">7</div>
                <div className="w-full text-center justify-start text-gray-800 text-base font-normal leading-relaxed">Other</div>
              </div>
              <div className="w-full h-3.5 relative bg-gray-500 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Health metrics cards */}
      <div className="w-full p-4 inline-flex justify-start items-center gap-2">
        {[
          {
            icon: 'fas fa-shoe-prints',
            label: 'Steps',
            value: '2,787',
            unit: 'avg',
            trend: 'down',
            color: 'blue',
            chartType: 'bars',
            chartData: [7, 5, 7, 7, 5, 6, 2.5]
          },
          {
            icon: 'fas fa-bed',
            label: 'Sleep',
            value: '7.5',
            unit: 'hours avg',
            trend: 'up',
            color: 'purple',
            chartType: 'bars',
            chartData: [7, 5, 7, 7, 5, 6, 2.5]
          },
          {
            icon: 'fas fa-heart',
            label: 'Resting HR',
            value: '48',
            unit: 'bpm avg',
            trend: 'down',
            color: 'red',
            chartType: 'line',
            chartData: [10, 7, 7, 7, 18, 9, 18]
          }
        ].map((metric, index) => (
          <div key={index} className="flex-1 max-w-32 min-w-24 p-3 rounded-xl outline outline-1 outline-offset-[-1px] outline-khaki-150 inline-flex flex-col justify-start items-start gap-2">
            {/* Header with icon and trend */}
            <div className="self-stretch inline-flex justify-start items-start gap-0.5">
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5">
                <div
                  className={`w-5 h-5 text-center justify-center text-base ${metric.color === 'red' ? 'text-red-500' :
                      metric.color === 'green' ? 'text-green-500' :
                        metric.color === 'blue' ? 'text-blue-500' :
                          metric.color === 'purple' ? 'text-purple-500' :
                          ''
                    }`}
                >
                  <i className={metric.icon}></i>
                </div>
                <div className="justify-start text-gray-800 text-xs font-normal leading-tight">{metric.label}</div>
              </div>
              {/* <div className="w-5 h-5 relative">
                <div className="w-5 h-5 text-center justify-center text-gray-800 text-base">
                  <i className={`fas fa-arrow-${metric.trend === 'up' ? 'up' : 'down'}-right`}></i>
                </div>
              </div> */}
            </div>

            {/* Value and chart */}
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="self-stretch inline-flex justify-start items-baseline gap-0.5">
                <div className="justify-end text-gray-800 text-lg font-bold leading-normal">{metric.value}</div>
                <div className="flex-1 justify-start text-gray-600 text-xs font-normal leading-tight">{metric.unit}</div>
              </div>

              {/* Chart visualization */}
              <div className="self-stretch h-8 inline-flex justify-start items-end gap-0.5">
                {metric.chartType === 'bars' ? (
                  // Bar chart
                  metric.chartData.map((height, barIndex) => (
                    <div key={barIndex} className="w-2 self-stretch rounded-md flex justify-between items-end">
                      <div
                        className={`w-2 rounded-md ${metric.color === 'blue' ? 'bg-blue-300' :
                            metric.color === 'purple' ? 'bg-purple-300' : 'bg-red-300'
                          }`}
                        style={{ height: `${height * 4}px` }}
                      ></div>
                    </div>
                  ))
                ) : (
                  // Line chart (simplified as positioned dots)
                  <div className="w-full h-8 relative">
                    {metric.chartData.map((yPos, pointIndex) => (
                      <div
                        key={pointIndex}
                        className="w-2.5 h-2.5 absolute"
                        style={{
                          left: `${pointIndex * 10}px`,
                          top: `${yPos}px`
                        }}
                      >
                        <div className="w-2.5 h-2.5 bg-white rounded-full border border-khaki-50"></div>
                        <div className="w-2 h-2 absolute left-[1px] top-[1px] bg-red-400 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="w-full h-12 px-4 py-1.5 border-t border-khaki-150 inline-flex justify-start items-center gap-2">
        <div className="h-10 flex justify-start items-center">
          <div className="justify-start text-gray-800 text-base font-semibold leading-relaxed">View all</div>
          <div className="w-5 h-5 text-center justify-center text-gray-500 text-xs">
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
        <div className="flex-1 h-10 flex justify-end items-center gap-2"></div>
      </div>
      </div>
    </div>
  )
}
