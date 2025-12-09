import { DoorOpen } from "lucide-react";

export default function RoomsStatus({ availableRooms }) {
  return (
    <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700">
      <h3 className="text-2xl font-bold mb-6">حالة الغرف الان</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {availableRooms.map((room) => (
          <div
            key={room.id}
            className={`p-4 rounded-xl border ${
              room.status === "متاحة"
                ? "bg-green-500/10 border-green-500/30"
                : room.status === "مشغولة"
                ? "bg-red-500/10 border-red-500/30"
                : "bg-yellow-500/10 border-yellow-500/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <DoorOpen
                size={20}
                className={
                  room.status === "متاحة"
                    ? "text-green-400"
                    : room.status === "مشغولة"
                    ? "text-red-400"
                    : "text-yellow-400"
                }
              />
              <span className="text-2xl font-bold">{room.name}</span>
            </div>
            <div className="text-sm">
              <p
                className={`font-medium ${
                  room.status === "متاحة"
                    ? "text-green-400"
                    : room.status === "مشغولة"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {room.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
