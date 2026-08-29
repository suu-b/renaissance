'use client'

import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  GitBranch,
  Globe2,
  PenLine,
} from 'lucide-react'

const features = [
  {
    icon: PenLine,
    eyebrow: '01 / MAKE',
    title: 'Write without leaving the work.',
    body: 'A calm, local writing space for ideas that deserve room to become literature. Your drafts stay on your machine, under your control.',
    detail: 'LOCAL FIRST · DESKTOP APP',
  },
  {
    icon: GitBranch,
    eyebrow: '02 / EXPLORE',
    title: 'Every direction is worth keeping.',
    body: 'Branch your work, follow a different thread, and return to earlier versions whenever you need. Change becomes part of the story.',
    detail: 'LOCAL HISTORY · BRANCHING',
  },
  {
    icon: Globe2,
    eyebrow: '03 / SHARE',
    title: 'Publish on your own terms.',
    body: 'Keep a project private while it is becoming, or publish it for others to read. Renaissance gives your work a considered path from page to public.',
    detail: 'PRIVATE OR PUBLIC · ASYNC',
  },
]

function Button({ children, secondary = false }: { children: React.ReactNode; secondary?: boolean }) {
  if (secondary) {
    return <a className="cta cta-secondary" href="/download" target="_blank" rel="noopener noreferrer">{children}<Download size={15} /></a>
  }
  return <a className="cta cta-primary" href="/join" target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={15} /></a>
}

function Feature({ feature, reverse }: { feature: typeof features[number]; reverse?: boolean }) {
  const Icon = feature.icon
  return (
    <article className={`feature ${reverse ? 'feature-reverse' : ''}`}>
      <div className="feature-orbit"><Icon strokeWidth={1.25} size={54} /><span>{feature.eyebrow}</span></div>
      <div className="feature-copy">
        <span className="feature-kicker">{feature.detail}</span>
        <h3>{feature.title}</h3>
        <p>{feature.body}</p>
        <span className="feature-arrow"><ArrowDownRight size={17} /></span>
      </div>
    </article>primary
  )
}

export default function Page() {
  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-banner-container">
          <img src="/banner.png" alt="Renaissance writing workspace preview" className="hero-banner" />
          <p className="banner-credit">Illustrations by Magtira Paolo of Sketchify Germany, sourced via Canva. Used with appreciation.</p>
        </div>
        <div className="hero-copy">
          <h1>Renaissance</h1>
          <p>A Bower for thee</p>
          <div className="cta-row"><Button>Get Started</Button><Button secondary>Download</Button></div>
        </div>
      </section>

      <section className="manifesto" id="about">
        <p>For people who write, read, discuss, and collaborate around literature. A quiet place for the work before it becomes the world&apos;s.</p>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading"><h2>Make room for<br /><em>the sentence.</em></h2></div>
        <div className="features-list">{features.map((feature, index) => <Feature key={feature.title} feature={feature} reverse={index % 2 === 1} />)}</div>
      </section>

      <footer><span>RENAISSANCE / 2026</span><span>Developed &amp; Designed by <a href="https://shbhmt.netlify.app" target="_blank" rel="noreferrer">Shubham Thakur</a></span></footer>
    </main>
  )
}
