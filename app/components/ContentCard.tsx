interface ContentCardProps {
  type: 'image' | 'quote'
  title: string
  category: string
  imageUrl?: string
  quote?: string
  gradientColors?: string
  onLike?: () => void
  onMore?: () => void
  isLiked?: boolean
}

export default function ContentCard({ 
  type, 
  title, 
  category, 
  imageUrl, 
  quote, 
  gradientColors = 'from-orange-500 via-orange-400 to-yellow-300',
  onLike,
  onMore,
  isLiked = false
}: ContentCardProps) {
  return (
    <div className="w-full rounded-xl border border-khaki-150 flex flex-col overflow-hidden  transition-shadow duration-200">
      {/* Content Section */}
      {type === 'image' && imageUrl && (
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/343/193';
            }}
          />
        </div>
      )}
      
      {type === 'quote' && quote && (
        <div className={`h-48 px-8 py-5 bg-gradient-to-br ${gradientColors} flex flex-col justify-center items-center`}>
          <div className="text-center text-white text-4xl font-light leading-9 font-serif">
            "{quote}"
          </div>
        </div>
      )}
      
      {/* Info Section */}
      <div className="px-4 py-3 flex flex-col gap-2">
        <h3 className="text-gray-800 text-base font-semibold leading-snug">
          {title}
        </h3>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm font-normal leading-snug">
            {category}
          </span>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onLike}
              className={`w-6 h-6 flex items-center justify-center transition-colors duration-200 ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <i className={`fas fa-heart text-base ${isLiked ? 'fas' : 'far'}`}></i>
            </button>
            
            <button 
              onClick={onMore}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <i className="fas fa-ellipsis text-base"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
