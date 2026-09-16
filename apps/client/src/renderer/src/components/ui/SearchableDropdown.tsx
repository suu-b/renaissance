import React, { useState, useRef, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { FiChevronDown } from 'react-icons/fi'

const dropdownVariants = cva('relative', {
  variants: {
    variant: {
      default: '',
      error: ''
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

const inputVariants = cva(
  'bg-transparent border border-border rounded-lg font-sans text-sm px-4 py-3 transition-all duration-200 ease-out focus:outline-none placeholder:text-muted placeholder:opacity-60',
  {
    variants: {
      variant: {
        default: 'focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,205,237,0.2)]',
        error: 'focus:border-destructive focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

type SearchableDropdownProps = VariantProps<typeof dropdownVariants> & {
  options: string[]
  value?: string
  defaultIndex?: number
  placeholder?: string
  disabled?: boolean
  onSelect?: (value: string) => void
  className?: string
  inputClassName?: string
}

export default function SearchableDropdown({
  options,
  value,
  defaultIndex = 0,
  placeholder = 'Select an option',
  disabled = false,
  onSelect,
  variant,
  className,
  inputClassName
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState(
    value ?? (defaultIndex !== undefined ? (options[defaultIndex] ?? '') : '')
  )

  const [filteredOptions, setFilteredOptions] = useState<string[]>(options)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Update selected value when parent value changes
  useEffect(() => {
    if (value !== undefined) {
      setSearchTerm(value)
    }
  }, [value])

  // Keep filtered options in sync when the options prop itself changes
  useEffect(() => {
    setFilteredOptions(options)
  }, [options])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (option: string) => {
    setSearchTerm(option)
    setIsOpen(false)
    onSelect?.(option)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    setSearchTerm(nextValue)
    setIsOpen(true)
    setFilteredOptions(
      options.filter((option) => option.toLowerCase().includes(nextValue.toLowerCase()))
    )
  }

  const handleToggle = () => {
    if (disabled) return

    const nextIsOpen = !isOpen

    setIsOpen(nextIsOpen)

    // Show all options when opening
    if (nextIsOpen) {
      setFilteredOptions(options)
    }
  }

  const handleFocus = () => {
    if (disabled) return

    setIsOpen(true)

    // Show all options when focusing
    setFilteredOptions(options)
  }

  return (
    <div ref={dropdownRef} className={`${dropdownVariants({ variant })} ${className ?? ''}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className={`${inputVariants({ variant })} ${inputClassName ?? ''} pr-10 cursor-pointer`}
        />

        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-foreground/20 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results found</div>
          ) : (
            filteredOptions.map((option, index) => (
              <button
                key={`${option}-${index}`}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-foreground/5 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {option}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}