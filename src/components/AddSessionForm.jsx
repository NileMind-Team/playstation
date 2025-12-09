import {
  Phone,
  DoorOpen,
  Clock,
  User,
  Info,
  ChevronDown,
  BookOpen,
  Tag,
  Calendar,
} from "lucide-react";
import { toArabicNumbers } from "../utils/arabicNumbers";
import { useState, useEffect } from "react";

export default function AddSessionForm({
  showAddForm,
  setShowAddForm,
  newSession,
  setNewSession,
  availableRooms,
  clients,
  clientsLoading,
  handleAddSession,
}) {
  const [roomsDropdownOpen, setRoomsDropdownOpen] = useState(false);
  const [clientsDropdownOpen, setClientsDropdownOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  useEffect(() => {
    if (newSession.selectedClientType === "existing" && newSession.clientId) {
      const selectedClient = clients.find(
        (client) => client.id === newSession.clientId
      );
      if (selectedClient) {
        setNewSession({
          ...newSession,
          customerName: selectedClient.name,
          phone: selectedClient.phoneNumber,
          clientNotes: selectedClient.notes || "",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newSession.clientId, newSession.selectedClientType, clients]);

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
    setRoomsDropdownOpen(false);
  };

  const handleClientSelect = (client) => {
    setNewSession({
      ...newSession,
      clientId: client.id,
      customerName: client.name,
      phone: client.phoneNumber,
      clientNotes: client.notes || "",
      selectedClientType: "existing",
    });
    setClientsDropdownOpen(false);
    setClientSearch("");
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.phoneNumber.includes(clientSearch)
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const startTimeArabic = convertTimeToArabic(newSession.startTime);
    const endTimeArabic = newSession.endTime
      ? convertTimeToArabic(newSession.endTime)
      : "";

    const formatDateToArabicFormat = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${toArabicNumbers(day)}-${toArabicNumbers(
        month
      )}-${toArabicNumbers(year)}`;
    };

    const startDateArabic = formatDateToArabicFormat(newSession.startDate);
    const endDateArabic = newSession.endDate
      ? formatDateToArabicFormat(newSession.endDate)
      : "";

    console.log("بيانات الجلسة قبل الإرسال:", {
      startDate: newSession.startDate,
      startDateArabic,
      startTime: newSession.startTime,
      startTimeArabic,
      endDate: newSession.endDate,
      endDateArabic,
      endTime: newSession.endTime,
      endTimeArabic,
    });

    const sessionData = {
      ...newSession,
      startTime: startTimeArabic,
      endTime: endTimeArabic,
      startDate: startDateArabic,
      endDate: endDateArabic,
    };

    handleAddSession(sessionData);
  };

  const convertTimeToArabic = (time) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":").map(Number);
    let period = "صباحاً";

    let displayHours = hours;

    if (hours >= 12) {
      period = "مساءً";
      if (hours > 12) {
        displayHours = hours - 12;
      }
    } else if (hours === 0) {
      displayHours = 12;
    }

    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();

    const arabicHours = toArabicNumbers(displayHours);
    const arabicMinutes = toArabicNumbers(formattedMinutes);

    return `${arabicHours}:${arabicMinutes} ${period}`;
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${toArabicNumbers(day)}/${toArabicNumbers(month)}/${toArabicNumbers(
      year
    )}`;
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

      <form onSubmit={handleSubmit} className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700 p-4 shadow-lg backdrop-blur-sm h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-reverse space-x-2">
                  <div className="p-1.5 bg-blue-500/20 rounded">
                    <User className="text-blue-400" size={18} />
                  </div>
                  <h4 className="font-bold text-blue-300">معلومات العميل</h4>
                </div>

                <div className="flex items-center space-x-reverse space-x-2">
                  <label className="flex items-center text-sm text-gray-300">
                    <input
                      type="radio"
                      name="clientType"
                      checked={newSession.selectedClientType === "new"}
                      onChange={() => {
                        setNewSession({
                          ...newSession,
                          selectedClientType: "new",
                          clientId: null,
                          customerName: "",
                          phone: "",
                          clientNotes: "",
                        });
                      }}
                      className="ml-2"
                    />
                    عميل جديد
                  </label>

                  <label className="flex items-center text-sm text-gray-300">
                    <input
                      type="radio"
                      name="clientType"
                      checked={newSession.selectedClientType === "existing"}
                      onChange={() => {
                        setNewSession({
                          ...newSession,
                          selectedClientType: "existing",
                        });
                      }}
                      className="ml-2"
                    />
                    عميل سابق
                  </label>
                </div>
              </div>

              {newSession.selectedClientType === "existing" ? (
                <div className="mb-4">
                  <label className="flex items-center text-gray-300 mb-2 text-sm">
                    <BookOpen size={16} className="ml-2 text-blue-400" />
                    <span>اختيار العميل</span>
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setClientsDropdownOpen(!clientsDropdownOpen)
                      }
                      className={`w-full bg-gray-700/60 border ${
                        newSession.clientId
                          ? "border-blue-500/50"
                          : "border-gray-600"
                      } rounded-lg py-2.5 px-3 pr-5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300 flex items-center justify-between group hover:bg-gray-700/80 relative`}
                    >
                      <div className="flex items-center">
                        {newSession.clientId ? (
                          <>
                            <div className="w-2 h-2 bg-blue-400 rounded-full ml-2"></div>
                            <span className="text-white">
                              {newSession.customerName}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400">
                            اختر عميل من القائمة
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-300 ${
                          clientsDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-r-lg"></div>
                    </button>

                    {clientsDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-blue-500/30 rounded-lg shadow-xl shadow-blue-900/20 overflow-hidden backdrop-blur-sm">
                        <div className="p-2 border-b border-gray-700">
                          <input
                            type="text"
                            placeholder="ابحث عن عميل..."
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            className="w-full bg-gray-700/60 border border-gray-600 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="max-h-40 overflow-y-auto add-session-form-scroll">
                          {clientsLoading ? (
                            <div className="p-4 text-center">
                              <p className="text-gray-400 text-sm">
                                جاري تحميل العملاء...
                              </p>
                            </div>
                          ) : filteredClients.length > 0 ? (
                            filteredClients.map((client) => (
                              <div
                                key={client.id}
                                onClick={() => handleClientSelect(client)}
                                className="flex items-center justify-between px-3 py-2.5 hover:bg-blue-500/10 cursor-pointer transition-all duration-200 group/item"
                              >
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-blue-400 rounded-full ml-2"></div>
                                  <div>
                                    <p className="text-gray-300 group-hover/item:text-white font-medium">
                                      {client.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {formatPhoneForDisplay(
                                        client.phoneNumber
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <BookOpen
                                  size={14}
                                  className="text-blue-400 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                />
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center">
                              <p className="text-gray-400 text-sm">
                                لا توجد نتائج
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}

              <div className="mb-4">
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
                    className={`w-full bg-gray-700/60 border border-gray-600 rounded-lg py-2.5 px-3 pr-5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:bg-gray-700/80 transition-all duration-300 text-left placeholder:text-right ${
                      newSession.selectedClientType === "existing"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="أدخل رقم الهاتف"
                    required
                    dir="rtl"
                    inputMode="numeric"
                    disabled={newSession.selectedClientType === "existing"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700 p-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-center space-x-reverse space-x-2 mb-4">
                <div className="p-1.5 bg-purple-500/20 rounded">
                  <DoorOpen className="text-purple-400" size={18} />
                </div>
                <h4 className="font-bold text-purple-300">تفاصيل الجلسة</h4>
              </div>

              <div className="relative mb-4">
                <label className="flex items-center text-gray-300 mb-2 text-sm">
                  <DoorOpen size={16} className="ml-2 text-purple-400" />
                  <span>اختيار الغرفة</span>
                </label>

                <button
                  type="button"
                  onClick={() => setRoomsDropdownOpen(!roomsDropdownOpen)}
                  className={`w-full bg-gray-700/60 border ${
                    newSession.roomNumber
                      ? "border-purple-500/50"
                      : "border-gray-600"
                  } rounded-lg py-2.5 px-3 pr-5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-300 flex items-center justify-between group hover:bg-gray-700/80 relative`}
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
                      roomsDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-lg"></div>
                </button>

                {roomsDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-purple-500/30 rounded-lg shadow-xl shadow-purple-900/20 overflow-hidden backdrop-blur-sm">
                    <div className="max-h-48 overflow-y-auto add-session-form-scroll">
                      {availableRooms.map((room) => (
                        <div
                          key={room.id}
                          onClick={() => handleRoomSelect(room.name)}
                          className="flex items-center justify-between px-3 py-2.5 hover:bg-purple-500/10 cursor-pointer transition-all duration-200 group/item"
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                            <div>
                              <span className="text-gray-300 group-hover/item:text-white">
                                {room.name}
                              </span>
                              <div className="text-xs text-gray-400">
                                <span>
                                  الساعة: {toArabicNumbers(room.hourCost || 0)}{" "}
                                  جنيه
                                </span>
                              </div>
                            </div>
                          </div>
                          <DoorOpen
                            size={14}
                            className="text-purple-400 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-700 p-2 bg-gray-900/50">
                      <p className="text-xs text-gray-400 text-center">
                        عدد الغرف:{" "}
                        <span className="font-bold text-green-400">
                          {toArabicNumbers(availableRooms.length)}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {newSession.roomNumber && (
                <div className="mt-3 p-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
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

              <div className="mt-4">
                <label className="flex items-center text-gray-300 mb-2 text-sm">
                  <Tag size={16} className="ml-2 text-yellow-400" />
                  <span>الخصم (اختياري)</span>
                </label>
                <div className="relative group">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-r group-hover:from-yellow-400 group-hover:to-orange-400 transition-all"></div>
                  <input
                    type="number"
                    value={newSession.discount || ""}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        discount: e.target.value
                          ? parseFloat(e.target.value)
                          : 0,
                      })
                    }
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-700/60 border border-gray-600 rounded-lg py-2.5 px-3 pr-5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-transparent hover:bg-gray-700/80 transition-all duration-300"
                    placeholder="أدخل قيمة الخصم"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    ج.م
                  </div>
                </div>
              </div>
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
                  <Calendar size={16} className="ml-2 text-emerald-400" />
                  <span>تاريخ البدء *</span>
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    value={newSession.startDate}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        startDate: e.target.value,
                      })
                    }
                    min={getTodayDate()}
                    className="w-full bg-gray-700/60 border border-gray-600 rounded-lg py-2.5 px-3 pr-5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent hover:bg-gray-700/80 transition-all duration-300 custom-date-input"
                    required
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 text-xs font-bold">
                    {formatDateForDisplay(newSession.startDate)}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center text-gray-300 mb-2 text-sm">
                  <Clock size={16} className="ml-2 text-green-400" />
                  <span>وقت البدء *</span>
                </label>
                <div className="relative group">
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
                    className="w-full bg-gray-700/60 border border-gray-600 rounded-lg py-2.5 px-3 pr-5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent hover:bg-gray-700/80 transition-all duration-300 custom-time-input"
                    required
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 text-xs font-bold">
                    {newSession.startTime
                      ? convertTimeToArabic(newSession.startTime)
                      : ""}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center text-gray-300 text-sm">
                    <Calendar size={16} className="ml-2 text-blue-400" />
                    <span>تاريخ الانتهاء</span>
                  </label>
                  <span className="text-xs text-gray-400 bg-gray-700/60 px-2 py-1 rounded">
                    اختياري
                  </span>
                </div>
                <div className="relative group">
                  <input
                    type="date"
                    value={newSession.endDate || ""}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        endDate: e.target.value,
                      })
                    }
                    min={newSession.startDate || getTodayDate()}
                    className="w-full bg-gray-700/60 border border-gray-600 rounded-lg py-2.5 px-3 pr-5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:bg-gray-700/80 transition-all duration-300 custom-date-input"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 text-xs font-bold">
                    {newSession.endDate
                      ? formatDateForDisplay(newSession.endDate)
                      : ""}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center text-gray-300 text-sm">
                    <Clock size={16} className="ml-2 text-blue-400" />
                    <span>وقت الانتهاء</span>
                  </label>
                  <span className="text-xs text-gray-400 bg-gray-700/60 px-2 py-1 rounded">
                    اختياري
                  </span>
                </div>
                <div className="relative group">
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
                    className="w-full bg-gray-700/60 border border-gray-600 rounded-lg py-2.5 px-3 pr-5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:bg-gray-700/80 transition-all duration-300 custom-time-input"
                    placeholder="اختياري"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 text-xs font-bold">
                    {newSession.endTime
                      ? convertTimeToArabic(newSession.endTime)
                      : ""}
                  </div>
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
              !newSession.customerName ||
              !newSession.phone ||
              !newSession.startDate
            }
            className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-300 flex items-center space-x-reverse space-x-2 group text-sm ${
              !newSession.roomNumber ||
              !newSession.startTime ||
              !newSession.customerName ||
              !newSession.phone ||
              !newSession.startDate
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

      <style jsx global>{`
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

        .add-session-form-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .add-session-form-scroll::-webkit-scrollbar-track {
          background: linear-gradient(
            to bottom,
            rgba(30, 41, 59, 0.8),
            rgba(15, 23, 42, 0.9)
          );
          border-radius: 10px;
          box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
        }

        .add-session-form-scroll::-webkit-scrollbar-thumb {
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

        .add-session-form-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(167, 139, 250, 0.95),
            rgba(216, 180, 254, 0.9)
          );
          box-shadow: 0 0 8px rgba(192, 132, 252, 0.5),
            inset 0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .add-session-form-scroll::-webkit-scrollbar-thumb:active {
          background: linear-gradient(
            180deg,
            rgba(147, 51, 234, 0.95),
            rgba(192, 132, 252, 0.9)
          );
        }

        .add-session-form-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }

        .add-session-form-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.8) rgba(30, 41, 59, 0.5);
        }

        .custom-date-input::-webkit-datetime-edit {
          color: transparent !important;
        }

        .custom-date-input::-webkit-datetime-edit-fields-wrapper {
          color: transparent !important;
        }

        .custom-date-input::-webkit-datetime-edit-year-field,
        .custom-date-input::-webkit-datetime-edit-month-field,
        .custom-date-input::-webkit-datetime-edit-day-field {
          color: transparent !important;
        }

        .custom-date-input::-webkit-inner-spin-button,
        .custom-date-input::-webkit-calendar-picker-indicator {
          opacity: 0.7;
          cursor: pointer;
          filter: invert(0.7);
        }

        .custom-date-input::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
          filter: invert(1);
        }

        .custom-time-input::-webkit-datetime-edit {
          color: transparent !important;
        }

        .custom-time-input::-webkit-datetime-edit-fields-wrapper {
          color: transparent !important;
        }

        .custom-time-input::-webkit-datetime-edit-hour-field,
        .custom-time-input::-webkit-datetime-edit-minute-field,
        .custom-time-input::-webkit-datetime-edit-ampm-field {
          color: transparent !important;
        }

        .custom-time-input::-webkit-calendar-picker-indicator {
          opacity: 0.7;
          cursor: pointer;
          filter: invert(0.7);
        }

        .custom-time-input::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
          filter: invert(1);
        }

        #startTimeField,
        #endTimeField {
          color-scheme: dark;
        }

        .custom-date-input,
        .custom-time-input {
          color-scheme: dark;
          -webkit-appearance: none;
          appearance: none;
          background: rgba(55, 65, 81, 0.6) !important;
        }

        .custom-date-input:hover,
        .custom-time-input:hover {
          background: rgba(55, 65, 81, 0.8) !important;
        }

        #startTimeField::-webkit-calendar-picker-indicator {
          filter: invert(0.7) sepia(1) saturate(10) hue-rotate(100deg)
            brightness(1.3) !important;
        }

        #endTimeField::-webkit-calendar-picker-indicator {
          filter: invert(0.7) sepia(1) saturate(10) hue-rotate(200deg)
            brightness(1.3) !important;
        }
      `}</style>
    </div>
  );
}
