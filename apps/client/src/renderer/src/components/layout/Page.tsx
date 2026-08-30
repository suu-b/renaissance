import {cva, type VariantProps } from "class-variance-authority"
import Footer from "../common/Footer"

const pageVariants = cva("max-w-full overflow-x-hidden", {
    variants: {
        alignment: {
            default: "px-8 py-10",
            equal: "p-5",
            center: "flex items-center justify-center h-[calc(100vh-64px)]"
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
        <>
            <main className={`${pageVariants({ alignment })} ${className}`}>
                { children }
            </main>
            {alignment !== "center" && <Footer />}
        </>
    )
}
