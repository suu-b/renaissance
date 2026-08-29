import {cva, type VariantProps } from "class-variance-authority"

const imageVariants = cva("", {
  variants: {
    variant: {
      default: "object-cover",
      hero: "object-cover w-full h-auto rounded-lg",
      pfp: "object-cover rounded-full",
      banner: "object-cover w-full h-auto",
    },
    size: {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16",
      xl: "w-32 h-32",
      full: "w-full h-full",
    },
  },

  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

type ImageProps = VariantProps<typeof imageVariants> & {
  src: string
  alt: string
  className?: string
}

export default function Image({
  variant,
  size,
  src,
  alt,
  className,
}: ImageProps) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${imageVariants({ variant, size })} ${className ?? ""}`}
    />
  )
}