interface ActionPlanCardProps {
  steps: {
    text: string;
    icon?: string;
  }[]
  timestamp?: string
}

export default function ActionPlanCard({ steps, timestamp }: ActionPlanCardProps) {
  return (
    <div className="rounded-xl outline outline-1 outline-khaki-150 inline-flex flex-col justify-start items-start overflow-hidden">
      <div className="self-stretch flex flex-col justify-start items-start">
        {/* Header */}
        <div className="self-stretch px-4 py-3 bg-khaki-100 flex flex-col justify-center items-start">
          <div className="self-stretch inline-flex justify-start items-center gap-2">
            <div className="flex-1 inline-flex flex-col justify-start items-start">
              <div className="self-stretch inline-flex justify-start items-center gap-4">
                <div className="flex-1 justify-start text-gray-800 text-base font-semibold leading-relaxed">Next Steps</div>
                <div className="w-6 h-6 text-center justify-center text-gray-500 text-xl">
                  <i className="fas fa-ellipsis"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Steps */}
        <div className="self-stretch px-4 pt-4 flex flex-col justify-start items-start gap-3 overflow-hidden">
          {steps.map((step, index) => (
            <div key={index}>
              <div className="self-stretch inline-flex justify-start items-start gap-2 pb-3">
                <div className="w-8 h-8 text-center justify-center text-orange-500 text-xl">
                  <i className={`fas fa-${step.icon || 'exclamation-triangle'}`}></i>
                </div>
                <div className="flex-1 justify-start text-gray-800 text-base font-normal leading-relaxed">
                  {step.text}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="self-stretch h-px bg-khaki-150 mb-3"></div>
              )}
            </div>
          ))}
        </div>
        <div className="self-stretch h-px bg-khaki-150 mx-4"></div>
        {/* Footer */}
        <div className="self-stretch p-4 inline-flex justify-between items-center">
          
          <div className="flex justify-start items-center gap-1 text-orange-500">
            <div className="justify-start text-base font-normal leading-relaxed">View</div>
            <div className="w-4 h-4 text-center justify-center text-xs">
              <i className="fas fa-chevron-right"></i>
            </div>
          </div>
          <div className="flex justify-end items-center gap-2">
            <div className="w-6 h-6 text-center justify-center text-gray-800 text-base">
              <i className="fas fa-bell"></i>
            </div>
            <div className="justify-start text-gray-800 text-base font-normal leading-relaxed">Remind me</div>
            <div className="w-7 h-4 relative bg-gray-800 rounded-full flex items-center justify-end px-[1px]">
              <div className="w-3.5 h-3.5 bg-khaki-50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
