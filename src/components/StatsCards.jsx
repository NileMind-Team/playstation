import { Gamepad2, Calendar } from "lucide-react";
import {
  toArabicNumbers,
  getCurrentDate,
  getTomorrowDate,
} from "../utils/arabicNumbers";

export default function StatsCards({ stats }) {
  const { activeSessionsCount, todaySessions, tomorrowSessions } = stats;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-1">
      <div className="group relative">
        <div className="absolute -inset-3 bg-gradient-to-r from-emerald-600 to-green-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-35 transition duration-500"></div>
        <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-5 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:shadow-[0_8px_16px_-3px_rgba(34,197,94,0.15)] transition-all duration-300 hover:scale-[1.02] hover:border-green-500/30">
          <div className="flex items-start justify-between">
            <div className="relative">
              <div className="absolute -inset-3 bg-green-500/10 rounded-full blur-xl"></div>
              <Gamepad2 className="relative text-emerald-400" size={26} />
            </div>
            <div className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full">
              نشطة الآن
            </div>
          </div>

          <div className="mt-6">
            <p className="text-gray-400 text-sm mb-1">الجلسات النشطة</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-green-200 bg-clip-text text-transparent">
                {toArabicNumbers(activeSessionsCount)}
              </p>
              <span className="text-xs text-emerald-400">في الوقت الحالي</span>
            </div>
          </div>
        </div>
      </div>

      <div className="group relative">
        <div className="absolute -inset-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-35 transition duration-500"></div>
        <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-5 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:shadow-[0_8px_16px_-3px_rgba(59,130,246,0.15)] transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30">
          <div className="flex items-start justify-between">
            <div className="relative">
              <div className="absolute -inset-3 bg-blue-500/10 rounded-full blur-xl"></div>
              <Calendar className="relative text-blue-400" size={26} />
            </div>
            <div className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full">
              اليوم
            </div>
          </div>

          <div className="mt-6">
            <p className="text-gray-400 text-sm mb-1">جلسات اليوم</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">
                {toArabicNumbers(todaySessions)}
              </p>
              <span className="text-xs text-blue-400">{getCurrentDate()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="group relative">
        <div className="absolute -inset-3 bg-gradient-to-r from-amber-600 to-yellow-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-35 transition duration-500"></div>
        <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-5 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:shadow-[0_8px_16px_-3px_rgba(245,158,11,0.15)] transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/30">
          <div className="flex items-start justify-between">
            <div className="relative">
              <div className="absolute -inset-3 bg-amber-500/10 rounded-full blur-xl"></div>
              <Calendar className="relative text-amber-400" size={26} />
            </div>
            <div className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded-full">
              قادمة
            </div>
          </div>

          <div className="mt-6">
            <p className="text-gray-400 text-sm mb-1">جلسات الغد</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                {toArabicNumbers(tomorrowSessions)}
              </p>
              <span className="text-xs text-amber-400">
                {getTomorrowDate()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
