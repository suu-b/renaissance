'use client'

import { ArrowUpRight } from 'lucide-react'

export default function JoinPage() {
  return (
    <main>
      <section className="join-hero">
        <div className="join-container">
          <h1>Join Renaissance</h1>
          <p>Begin your literary journey in a space designed for thoughtful creation.</p>
          
          <form className="join-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input type="password" id="confirm-password" name="confirm-password" required />
            </div>
            
            <button type="submit" className="submit-button">
              Register <ArrowUpRight size={15} />
            </button>
          </form>
          
          <p className="form-note">
            By joining, you agree to create meaningful literature and respect the quiet space we've built.
          </p>
        </div>
      </section>
    </main>
  )
}
