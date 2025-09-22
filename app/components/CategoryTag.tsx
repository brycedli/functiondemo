interface CategoryTagProps {
  label: string
  icon?: string
  isActive?: boolean
  onClick?: () => void
}

export default function CategoryTag({ label, icon, isActive = false, onClick }: CategoryTagProps) {
  return (
    <button
      onClick={onClick}
      className={`
        h-8 px-3 py-2 rounded-full flex justify-center items-center gap-1 whitespace-nowrap
        ${isActive 
          ? 'bg-gray-800 text-khaki-50' 
          : 'bg-khaki-100 text-gray-600 hover:bg-khaki-150'
        }
        transition-colors duration-200
      `}
    >
      {icon && (
        <i className={`${icon} w-4 h-4 text-xs`}></i>
      )}
      <span className="text-sm font-normal leading-snug">{label}</span>
    </button>
  )
}
