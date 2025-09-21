interface ActionPlansScreenProps {
  actionPlans: string[]
  onChatClick: () => void
  onHealthClick: () => void
}

export default function ActionPlansScreen({ actionPlans, onChatClick, onHealthClick }: ActionPlansScreenProps) {
  return (
    <div className="h-full w-full bg-khaki-50 flex flex-col" style={{ minHeight: 0 }}>
      {/* Navigation buttons */}
      <div className="h-[52px] items-center px-[12px] flex flex-row justify-between">
        <div className="flex gap-2">
          <div className="w-[40px] h-[40px] cursor-pointer" onClick={onHealthClick}>
            <img 
              src="/images/Avatar.svg" 
              className="w-full h-full"
              alt="Health"
            />
          </div>
          <div className="w-[40px] h-[40px] cursor-pointer" onClick={onChatClick}>
            <img 
              src="/images/Chat.svg" 
              className="w-full h-full"
              alt="Chat"
            />
          </div>
        </div>
        <div className="w-[40px] h-[40px]">
          <img 
            src="/images/Actions.svg" 
            className="w-full h-full"
            alt="Actions"
          />
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <h1 className="text-gray-800 text-2xl font-bold mb-4">Action Plans</h1>
      
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
    </div>
  )
}
