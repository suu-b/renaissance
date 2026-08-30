import { cva, type VariantProps } from "class-variance-authority"

const selectVariants = cva(
  "bg-transparent border border-border rounded-lg font-sans text-sm px-4 py-3 transition-all duration-200 ease-out focus:outline-none cursor-pointer appearance-none pr-10",
  {
    variants: {
      variant: {
        default: "focus:border-primary focus:shadow-[0_0_0_3px_rgba(155,205,237,0.2)]",
        error: "focus:border-destructive focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type SelectProps = VariantProps<typeof selectVariants> & {
  id?: string
  name?: string
  value?: string
  children: React.ReactNode
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  className?: string
}

export default function Select({
  id,
  name,
  value,
  children,
  disabled = false,
  onChange,
  variant,
  className,
}: SelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={`${selectVariants({ variant })} ${className ?? ""}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231c1c1c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          backgroundSize: "16px",
        }}
      >
        {children}
      </select>
    </div>
  )
}
