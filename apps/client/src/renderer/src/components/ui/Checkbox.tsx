import { cva, type VariantProps } from "class-variance-authority"

const checkboxVariants = cva(
  "w-4 h-4 accent-primary cursor-pointer",
  {
    variants: {
      variant: {
        default: "",
        error: "accent-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type CheckboxProps = VariantProps<typeof checkboxVariants> & {
  id?: string
  name?: string
  checked?: boolean
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}

export default function Checkbox({
  id,
  name,
  checked = false,
  disabled = false,
  onChange,
  variant,
  className,
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      id={id}
      name={name}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className={`${checkboxVariants({ variant })} ${className ?? ""}`}
    />
  )
}
