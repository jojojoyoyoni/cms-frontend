export default function Footer() {
  const currentYear = new Date().getFullYear();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 transition-colors duration-200">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Left Section: Copyright & Version */}
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
          <p>© {currentYear} Enterprise CMS. All rights reserved.</p>
          <span className="hidden md:inline">|</span>
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">v1.0.0</span>
          <span className="hidden md:inline">|</span>
          {/* Environment Indicator */}
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
            <span className="font-semibold text-yellow-600 dark:text-yellow-400">DEVELOPMENT</span>
          </span>
        </div>

        {/* Right Section: Status, Timezone, Links */}
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
          {/* Server Status */}
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>All systems operational</span>
          </span>
          
          <span className="hidden md:inline">|</span>
          
          {/* User Timezone */}
          <span className="hidden md:flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {userTimezone}
          </span>

          <span className="hidden md:inline">|</span>
          
          {/* Legal Links */}
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Support</a>
          </div>
        </div>

      </div>
    </footer>
  );
}