import { Search, ArrowLeft } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="w-full lg:max-w-[700px]">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن عميل أو رقم غرفة..."
            className="w-full bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-2xl py-4 pr-32 pl-14 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-gray-100 placeholder-gray-400 text-base shadow-2xl shadow-black/30 transition-all duration-200 hover:bg-gray-900/95"
          />
          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 flex items-center">
            <Search
              className="text-cyan-300/80 group-hover:text-cyan-300 transition-colors duration-200"
              size={24}
            />
            <div className="h-6 w-px bg-gradient-to-b from-gray-600 to-gray-700 mx-3"></div>
          </div>
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 group-hover:scale-105">
            <span>ابحث</span>
            <ArrowLeft className="w-3 h-3 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
