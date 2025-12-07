import { Phone, DoorOpen, Clock, User, Info, ChevronDown } from "lucide-react";
import { toArabicNumbers } from "../utils/arabicNumbers";
import { useState } from "react";

export default function AddSessionForm({
  showAddForm,
  setShowAddForm,
  newSession,
  setNewSession,
  availableRooms,
  handleAddSession,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!showAddForm) return null;

  const formatPhoneForDisplay = (phone) => {
    return phone.replace(/[0-9]/g, (digit) => {
      const englishToArabic = {
        0: "٠",
        1: "١",
        2: "٢",
        3: "٣",
        4: "٤",
        5: "٥",
        6: "٦",
        7: "٧",
        8: "٨",
        9: "٩",
      };
      return englishToArabic[digit] || digit;
    });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9٠-٩]/g, "");
    setNewSession({ ...newSession, phone: value });
  };

  const handleRoomSelect = (roomName) => {
    setNewSession({ ...newSession, roomNumber: roomName });
    setDropdownOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl shadow-blue-900/20 mb-8 animate-fadeIn">
      <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 p-5 border-b border-blue-500/30">
        <div className="flex items-center space-x-reverse space-x-3">
          <div className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
            <User size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              إضافة جلسة جديدة
            </h3>
            <p className="text-gray-300 text-sm flex items-center">
              <Info size={14} className="ml-1 text-blue-400" />
              أضف جلسة جديدة للعميل
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleAddSession} className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700 p-4 shadow-lg backdrop-blur-sm h-full">
              <div className="flex items-center space-x-reverse space-x-2 mb-4">
                <div className="p-1.5 bg-blue-500/20 rounded">
                  <User className="text-blue-400" size={18} />
                </div>
                <h4 className="font-bold text-blue-300">معلومات العميل</h4>
              </div>

              <div className="mb-4">
                <label className="flex items-center text-gray-300 mb-2 text-sm">
                  <User size={16} className="ml-2 text-blue-400" />
                  <span>اسم العميل</span>
                </label>
                <div className="relative group">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all"></div>
                  <input
                    type="text"
                    value={newSession.customerName}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        customerName: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700/60 border border-gray-600 rounded-lg py-2.5 px-3 pr-5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:bg-gray-700/80 transition-all duration-300"
                    placeholder="أدخل اسم العميل"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center text-gray-300 mb-2 text-sm">
                  <Phone size={16} className="ml-2 text-blue-400" />
                  <span>رقم الهاتف</span>
                </label>
                <div className="relative group">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all"></div>
                  <input
                    type="tel"
                    value={formatPhoneForDisplay(newSession.phone)}
                    onChange={handlePhoneChange}
                    className="w-full bg-gray-700/60 border border-gray-600 rounded-lg py-2.5 px-3 pr-5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:bg-gray-700/80 transition-all duration-300 text-left placeholder:text-right"
                    placeholder="أدخل رقم الهاتف"
                    required
                    dir="rtl"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700 p-4 shadow-lg backdrop-blur-sm h-full">
              <div className="flex items-center space-x-reverse space-x-2 mb-4">
                <div className="p-1.5 bg-purple-500/20 rounded">
                  <DoorOpen className="text-purple-400" size={18} />
                </div>
                <h4 className="font-bold text-purple-300">تفاصيل الجلسة</h4>
              </div>

              <div className="relative">
                <label className="flex items-center text-gray-300 mb-2 text-sm">
                  <DoorOpen size={16} className="ml-2 text-purple-400" />
                  <span>اختيار الغرفة</span>
                </label>

                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-full bg-gray-700/60 border ${
                    newSession.roomNumber
                      ? "border-purple-500/50"
                      : "border-gray-600"
                  } rounded-lg py-2.5 px-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-300 flex items-center justify-between group hover:bg-gray-700/80 relative`}
                >
                  <div className="flex items-center">
                    {newSession.roomNumber ? (
                      <>
                        <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                        <span className="text-white">
                          {newSession.roomNumber}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">
                        اختر غرفة من القائمة
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-300 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-lg"></div>
                </button>

                {dropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-purple-500/30 rounded-lg shadow-xl shadow-purple-900/20 overflow-hidden backdrop-blur-sm">
                    <div className="max-h-40 overflow-y-auto">
                      {availableRooms
                        .filter((room) => room.status === "متاحة")
                        .map((room) => (
                          <div
                            key={room.id}
                            onClick={() => handleRoomSelect(room.name)}
                            className="flex items-center justify-between px-3 py-2.5 hover:bg-purple-500/10 cursor-pointer transition-all duration-200 group/item"
                          >
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                              <span className="text-gray-300 group-hover/item:text-white">
                                {room.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-reverse space-x-2">
                              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                                {room.status}
                              </span>
                              <DoorOpen
                                size={14}
                                className="text-purple-400 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-700 p-2 bg-gray-900/50">
                      <p className="text-xs text-gray-400 text-center">
                        الغرف المتاحة:{" "}
                        <span className="font-bold text-green-400">
                          {toArabicNumbers(
                            availableRooms.filter(
                              (room) => room.status === "متاحة"
                            ).length
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {newSession.roomNumber && (
                <div className="mt-3 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                      <span className="text-xs text-green-400">
                        تم اختيار الغرفة:
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {newSession.roomNumber}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700 p-4 shadow-lg backdrop-blur-sm h-full">
              <div className="flex items-center space-x-reverse space-x-2 mb-4">
                <div className="p-1.5 bg-green-500/20 rounded">
                  <Clock className="text-green-400" size={18} />
                </div>
                <h4 className="font-bold text-green-300">توقيت الجلسة</h4>
              </div>

              <div className="mb-4">
                <label className="flex items-center text-gray-300 mb-2 text-sm">
                  <Clock size={16} className="ml-2 text-green-400" />
                  <span>وقت البدء</span>
                </label>
                <div className="relative group">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-r group-hover:from-green-400 group-hover:to-emerald-400 transition-all"></div>
                  <input
                    type="time"
                    id="startTimeField"
                    value={newSession.startTime || ""}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700/60 border border-gray-600 rounded-lg py-2.5 px-3 pr-5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent hover:bg-gray-700/80 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center text-gray-300 mb-2 text-sm">
                  <Clock size={16} className="ml-2 text-red-400" />
                  <span>وقت الانتهاء</span>
                </label>
                <div className="relative group">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-pink-500 rounded-r group-hover:from-red-400 group-hover:to-pink-400 transition-all"></div>
                  <input
                    type="time"
                    id="endTimeField"
                    value={newSession.endTime || ""}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700/60 border border-gray-600 rounded-lg py-2.5 px-3 pr-5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent hover:bg-gray-700/80 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-700 flex justify-between">
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="px-6 py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center space-x-reverse space-x-2 border border-gray-600 text-sm"
          >
            <span>إلغاء الإضافة</span>
          </button>
          <button
            type="submit"
            disabled={
              !newSession.roomNumber ||
              !newSession.startTime ||
              !newSession.endTime
            }
            className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-300 flex items-center space-x-reverse space-x-2 group text-sm ${
              !newSession.roomNumber ||
              !newSession.startTime ||
              !newSession.endTime
                ? "bg-gray-700 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/30"
            }`}
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>إضافة الجلسة</span>
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .max-h-40::-webkit-scrollbar {
          width: 8px;
        }

        .max-h-40::-webkit-scrollbar-track {
          background: linear-gradient(
            to bottom,
            rgba(30, 41, 59, 0.8),
            rgba(15, 23, 42, 0.9)
          );
          border-radius: 10px;
          box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
        }

        .max-h-40::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(139, 92, 246, 0.9),
            rgba(192, 132, 252, 0.8)
          );
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .max-h-40::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(167, 139, 250, 0.95),
            rgba(216, 180, 254, 0.9)
          );
          box-shadow: 0 0 8px rgba(192, 132, 252, 0.5),
            inset 0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .max-h-40::-webkit-scrollbar-thumb:active {
          background: linear-gradient(
            180deg,
            rgba(147, 51, 234, 0.95),
            rgba(192, 132, 252, 0.9)
          );
        }

        .max-h-40::-webkit-scrollbar-corner {
          background: transparent;
        }

        .max-h-40 {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.8) rgba(30, 41, 59, 0.5);
        }

        .max-h-40::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 15px;
          background: linear-gradient(
            to bottom,
            rgba(31, 41, 55, 0.95),
            transparent
          );
          pointer-events: none;
          z-index: 1;
          border-radius: 8px 8px 0 0;
        }

        .max-h-40::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 15px;
          background: linear-gradient(
            to top,
            rgba(31, 41, 55, 0.95),
            transparent
          );
          pointer-events: none;
          z-index: 1;
          border-radius: 0 0 8px 8px;
        }

        input[type="time"] {
          color-scheme: dark;
          -webkit-appearance: none;
          appearance: none;
        }

        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7);
          opacity: 0.7;
          cursor: pointer;
          margin-left: 4px;
        }

        input[type="time"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
          filter: invert(1);
        }

        #startTimeField {
          color: #10b981 !important;
        }

        #startTimeField::-webkit-datetime-edit-fields-wrapper {
          color: #10b981 !important;
        }

        #startTimeField::-webkit-datetime-edit-hour-field,
        #startTimeField::-webkit-datetime-edit-minute-field,
        #startTimeField::-webkit-datetime-edit-ampm-field {
          color: #10b981 !important;
          background: transparent;
        }

        #startTimeField::-webkit-calendar-picker-indicator {
          filter: invert(0.7) sepia(1) saturate(10) hue-rotate(100deg)
            brightness(1.3) !important;
        }

        #endTimeField {
          color: #ef4444 !important;
        }

        #endTimeField::-webkit-datetime-edit-fields-wrapper {
          color: #ef4444 !important;
        }

        #endTimeField::-webkit-datetime-edit-hour-field,
        #endTimeField::-webkit-datetime-edit-minute-field,
        #endTimeField::-webkit-datetime-edit-ampm-field {
          color: #ef4444 !important;
          background: transparent;
        }

        #endTimeField::-webkit-calendar-picker-indicator {
          filter: invert(0.7) sepia(1) saturate(10) hue-rotate(330deg)
            brightness(1.3) !important;
        }

        #startTimeField::-webkit-datetime-edit-text {
          color: rgba(16, 185, 129, 0.7) !important;
        }

        #endTimeField::-webkit-datetime-edit-text {
          color: rgba(239, 68, 68, 0.7) !important;
        }

        input[type="time"] {
          background: rgba(55, 65, 81, 0.6) !important;
        }

        input[type="time"]:hover {
          background: rgba(55, 65, 81, 0.8) !important;
        }

        input[type="time"]:invalid,
        input[type="time"]:valid,
        input[type="time"][value=""]::-webkit-datetime-edit-fields-wrapper,
        input[type="time"]:not(
            [value=""]
          )::-webkit-datetime-edit-fields-wrapper {
          color: inherit !important;
        }
      `}</style>
    </div>
  );
}
