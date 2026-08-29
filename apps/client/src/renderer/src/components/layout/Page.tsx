import {cva, type VariantProps } from "class-variance-authority"

const pageVariants = cva("max-w-full h-dvh overflow-hidden", {
    variants: {
        alignment: {
            default: "px-5 py-5",
            equal: "p-5",
            center: "flex items-center justify-center"
        }
    },
    defaultVariants: {
    alignment: "default",
  },
})

type PageProps = VariantProps<typeof pageVariants> & {
    children: React.ReactNode,
    className?: string
}

export default function Page({ alignment, children, className }: PageProps){
    return (
        <main className={`${pageVariants({ alignment })} ${className}`}>
            { children }
        </main>
    )
}
