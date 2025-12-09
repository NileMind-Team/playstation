import { DoorOpen } from "lucide-react";
import { getRoomStatusText } from "../utils/arabicNumbers";

export default function RoomsStatus({ availableRooms }) {
  return (
    <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700">
      <h3 className="text-2xl font-bold mb-6">حالة الغرف الآن</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {availableRooms.map((room) => {
          const statusText = getRoomStatusText(room.isAvailable);
          const isAvailable = room.isAvailable;

          return (
            <div
              key={room.id}
              className={`p-4 rounded-xl border ${
                isAvailable
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <DoorOpen
                  size={20}
                  className={isAvailable ? "text-green-400" : "text-red-400"}
                />
                <span className="text-2xl font-bold">{room.name}</span>
              </div>
              <div className="text-sm">
                <p
                  className={`font-medium ${
                    isAvailable ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {statusText}
                </p>
                <p className="text-gray-400 mt-1">{room.hourCost} ج.م/ساعة</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
