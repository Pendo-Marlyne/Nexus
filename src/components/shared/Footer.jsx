import { NexusLogo } from './NexusLogo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <NexusLogo compact />
          <p>One connected system for agency projects, tasks, leads, and handoffs.</p>
        </div>
        <button className="btn">Get Started</button>
      </div>
      <div className="footer-links">
        <div>
          <h4>Product</h4>
          <a href="#">Dashboard</a>
          <a href="#">Tasks</a>
          <a href="#">Analytics</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Careers</a>
          <a href="#">Contact</a>
        </div>
        <div>
          <h4>Resources</h4>
          <a href="#">Help Center</a>
          <a href="#">API Docs</a>
          <a href="#">Status</a>
        </div>
        <div>
          <h4>Social</h4>
          <a href="#">Dribbble</a>
          <a href="#">Behance</a>
          <a href="#">LinkedIn</a>
        </div>
      </div>
      <small>© {new Date().getFullYear()} Nexus. All rights reserved.</small>
    </footer>
  )
}
