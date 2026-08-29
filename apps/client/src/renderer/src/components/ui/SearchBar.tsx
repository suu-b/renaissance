import React from "react"
import { FiSearch } from "react-icons/fi"
import { cva, type VariantProps } from "class-variance-authority"

const searchBarVariants = cva(
  "flex items-center gap-3 rounded-lg border border-foreground/20 bg-transparent transition-all duration-300 focus-within:border-foreground/40 focus-within:ring-1 focus-within:ring-foreground/10",
  {
    variants: {
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-4",
        lg: "h-13 px-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

type SearchBarProps = VariantProps<typeof searchBarVariants> & {
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  size,
  className,
}: SearchBarProps) {
  return (
    <div className={`${searchBarVariants({ size })} ${className ?? ""}`}>
      <FiSearch className="shrink-0 text-foreground/50" />

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
      />
    </div>
  )
}