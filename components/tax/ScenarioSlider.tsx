'use client'

interface Props {
  label: string
  value: number
  min: number
  max: number
  step: number
  prefix?: string
  onChange: (value: number) => void
}

export default function ScenarioSlider({ label, value, min, max, step, prefix = '', onChange }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-gray-900">
          {prefix} {value.toLocaleString()}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{prefix} {min.toLocaleString()}</span>
        <span>{prefix} {max.toLocaleString()}</span>
      </div>
    </div>
  )
}
