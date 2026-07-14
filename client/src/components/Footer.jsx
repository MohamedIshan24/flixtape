import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-panel-line px-4 md:px-10 py-10 bg-void text-smoke text-sm">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <p className="text-flix-red text-xl font-extrabold tracking-tight mb-2">FLIXTAPE</p>
            <p className="max-w-xs">
              Unlimited movies and TV shows, personalized to you. Built as a learning project.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-reel font-semibold mb-3">Company</p>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-flix-red transition">About</Link></li>
                <li><Link to="/" className="hover:text-flix-red transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-reel font-semibold mb-3">Support</p>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-flix-red transition">Help Center</Link></li>
                <li><Link to="/" className="hover:text-flix-red transition">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-reel font-semibold mb-3">Legal</p>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-flix-red transition">Terms of Use</Link></li>
                <li><Link to="/" className="hover:text-flix-red transition">Privacy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-panel-line pt-6 flex flex-col sm:flex-row justify-between gap-3">
          <p>© {new Date().getFullYear()} Flixtape. All rights reserved.</p>
          <p>Made by Ishan · Not affiliated with Netflix</p>
        </div>
      </div>
    </footer>
  )
}
