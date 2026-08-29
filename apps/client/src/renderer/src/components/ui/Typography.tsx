import React from 'react'
import { cva, type VariantProps } from "class-variance-authority"

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "font-extrabold text-6xl leading-[0.95] tracking-[-0.075em]",
      h2: "font-extrabold text-4xl leading-[0.98] tracking-[-0.07em]",
      h3: "font-semibold text-2xl leading-[1.08] tracking-[-0.06em]",
      h4: "font-semibold text-xl",
      p: "text-base leading-normal",
      lead: "text-lg leading-[1.45]",
      small: "text-xs",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "p",
  },
})

type TypographyProps = VariantProps<typeof typographyVariants> & {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export default function Typography({
  variant,
  children,
  className,
  as: Component = 'p',
}: TypographyProps) {
  return (
    <Component className={`${typographyVariants({ variant })} ${className || ''}`}>
      {children}
    </Component>
  )
}