import Link from "next/link";
import { Home, FileText, Download, Settings } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/*Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center text-gray-800 hover:text-gray-900"
            >
              <FileText className="h-6 w-6 mr-2 text-red-600" />
              <span className="text-xl font-semibold">PDF Annotator</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Home className="h-5 w-5 mr-1" />
              Home
            </Link>
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FileText className="h-5 w-5 mr-1" />
              My Documents
            </Link>
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Download className="h-5 w-5 mr-1" />
              Export
            </Link>
          </div>

          {/*Settings Icon */}
          <div className="flex items-center">
            <button className="p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
