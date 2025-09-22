interface DiscoverScreenProps {
  onNavigateToChat?: () => void
}

export default function DiscoverScreen({ onNavigateToChat }: DiscoverScreenProps) {
  return (
    <div className="h-full w-full bg-khaki-50 flex flex-col pt-[54px] pb-[24px] rounded-l-[32px]">
      {/* Discover Navigation Menu */}
      <div className="h-[52px] flex items-center px-4 justify-between">
        <button 
          onClick={onNavigateToChat}
          className="text-gray-800 flex items-center justify-center"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        
        <div className="flex-1 self-stretch flex justify-center items-center gap-7">
          <div className="py-0.5 border-b-2 border-gray-800 flex justify-center items-center gap-1">
            <div className="text-center justify-center text-gray-800 text-base font-semibold leading-relaxed">Discover</div>
          </div>
          <div className="py-0.5 border-b-2 border-transparent flex justify-center items-center gap-1">
            <div className="text-center justify-center text-gray-500 text-base font-semibold leading-relaxed">Circles</div>
          </div>
        </div>
        
        <div className="w-8 h-8 bg-khaki-150 rounded-full flex items-center justify-center">
          <i className="fas fa-sliders text-gray-800"></i>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
      <h1 className="text-gray-800 text-2xl font-bold mb-4">Discover</h1>
      <div className="text-gray-600 text-center mt-20">
        <p>Discover content will go here</p>
        <p className="text-sm mt-2">(Empty for now as requested)</p>
      </div>
      </div>
    </div>
  )
}
