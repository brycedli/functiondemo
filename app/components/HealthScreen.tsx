interface HealthScreenProps {
  onChatClick: () => void
  onActionsClick: () => void
}

export default function HealthScreen({ onChatClick, onActionsClick }: HealthScreenProps) {
  return (
    <div className="h-full w-full bg-khaki-50 flex flex-col" style={{ minHeight: 0 }}>
      {/* Navigation buttons */}
      <div className="h-[52px] items-center px-[12px] flex flex-row justify-between">
        <div className="w-[40px] h-[40px]">
          <img 
            src="/images/Avatar.svg" 
            className="w-full h-full"
            alt="Profile"
          />
        </div>
        <div className="flex gap-2">
          <div className="w-[40px] h-[40px] cursor-pointer" onClick={onChatClick}>
            <img 
              src="/images/Chat.svg" 
              className="w-full h-full"
              alt="Chat"
            />
          </div>
          <div className="w-[40px] h-[40px] cursor-pointer" onClick={onActionsClick}>
            <img 
              src="/images/Actions.svg" 
              className="w-full h-full"
              alt="Actions"
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <h1 className="text-gray-800 text-2xl font-bold mb-4">Health Data</h1>
        <div className="text-gray-400 text-center mt-20">
          <p>Health data display will go here</p>
          <p className="text-sm mt-2">(Empty for now as requested)</p>
        </div>
      </div>
    </div>
  )
}
