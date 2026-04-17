interface Props {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

export default function LoadingSpinner({ size = 'md', label }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`} />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  )
}
