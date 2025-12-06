import {
  Gamepad2,
  User,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
} from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8">
      <div className="flex items-center space-x-reverse space-x-4 mb-6 md:mb-0">
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30"></div>
          <div className="relative p-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-lg">
            <Gamepad2 size={34} className="text-blue-400" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
            نظام حجز جلسات PlayStation
          </h1>
          <p className="text-gray-400/80 text-sm mt-1 flex items-center">
            نظام متكامل لإدارة جلسات الألعاب
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={toggleDropdown}
          onBlur={() => setTimeout(closeDropdown, 200)}
          className="flex items-center gap-3 bg-gradient-to-r from-gray-900/90 to-gray-800/90 px-6 py-3 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/50 hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] group"
        >
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-md"></div>
            <div className="relative p-2 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 rounded-full border border-blue-500/30">
              <User size={20} className="text-blue-300" />
            </div>
          </div>
          <div className="text-left">
            <p className="font-semibold text-white">مدير النظام</p>
            <p className="text-xs text-gray-400/70">Admin Panel</p>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-all duration-300 transform ${
              isDropdownOpen
                ? "rotate-180 text-blue-300"
                : "group-hover:text-blue-300"
            }`}
          />
        </button>

        <div
          className={`absolute right-0 top-full mt-2 w-48 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-2xl shadow-black/30 transition-all duration-300 z-50 ${
            isDropdownOpen
              ? "opacity-100 visible transform translate-y-0"
              : "opacity-0 invisible transform translate-y-2"
          }`}
        >
          <div className="p-2">
            <button
              onClick={closeDropdown}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors w-full text-left"
            >
              <div className="p-1.5 bg-blue-500/10 rounded-md">
                <UserCircle size={16} className="text-blue-400" />
              </div>
              <span>الملف الشخصي</span>
            </button>
            <button
              onClick={closeDropdown}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors w-full text-left"
            >
              <div className="p-1.5 bg-emerald-500/10 rounded-md">
                <Settings size={16} className="text-emerald-400" />
              </div>
              <span>الإعدادات</span>
            </button>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2"></div>
            <button
              onClick={closeDropdown}
              className="flex items-center gap-3 px-4 py-3 text-sm text-red-300 hover:text-red-200 hover:bg-red-900/20 rounded-lg transition-colors w-full text-left"
            >
              <div className="p-1.5 bg-red-500/10 rounded-md">
                <LogOut size={16} className="text-red-400" />
              </div>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
