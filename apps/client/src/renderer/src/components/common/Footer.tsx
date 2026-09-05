import React from "react"

type FooterProps = {
  className?: string
}

export default function Footer({ className }: FooterProps): React.JSX.Element {
  return (
    <footer className={`flex justify-between items-center text-[10px] uppercase tracking-wider py-6 px-[5vw] ${className ?? ""}`}>
      <span className="text-muted-foreground">
        RENAISSANCE / 2026
      </span>
      <span className="text-muted-foreground">
        This is a Personal Project.{" "}
        <a 
          href={config.getRenaissanceURL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-foreground border-b border-foreground/30 hover:border-foreground transition-colors"
        >
          Know more here.
        </a>
      </span>
      <span className="text-muted-foreground">
        Developed & Designed by{" "}
        <a 
          href="https://github.com/suu-b" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-foreground border-b border-foreground/30 hover:border-foreground transition-colors"
        >
          Shubham Thakur
        </a>
      </span>
    </footer>
  )
}
