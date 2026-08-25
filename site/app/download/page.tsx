'use client'

import { Download, ArrowUpRight } from 'lucide-react'

export default function DownloadPage() {
  return (
    <main>
      <section className="download-hero">
        <div className="download-container">
          <h1>Download Renaissance</h1>
          <p>Choose your platform and begin your literary journey.</p>
          
          <div className="download-options">
            <a href="#" className="download-card">
              <div className="download-icon">
                <Download size={32} />
              </div>
              <div className="download-info">
                <h3>Windows</h3>
                <p>Windows 10 or later</p>
                <span className="download-version">v1.0.0</span>
              </div>
              <div className="download-arrow">
                <ArrowUpRight size={20} />
              </div>
            </a>
            
            <a href="#" className="download-card">
              <div className="download-icon">
                <Download size={32} />
              </div>
              <div className="download-info">
                <h3>Linux</h3>
                <p>Ubuntu, Debian, Fedora, Arch</p>
                <span className="download-version">v1.0.0</span>
              </div>
              <div className="download-arrow">
                <ArrowUpRight size={20} />
              </div>
            </a>
          </div>
          
          <p className="download-note">
            Renaissance is currently in beta. Your feedback helps shape the future of literary tools.
          </p>
        </div>
      </section>
    </main>
  )
}
