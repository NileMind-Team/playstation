import { toArabicNumbers } from "../utils/arabicNumbers";

export default function Footer() {
  return (
    <footer className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
      <p>
        نظام إدارة جلسات البلايستيشن • PlayStation Sessions Management System ©{" "}
        {toArabicNumbers(new Date().getFullYear())}
      </p>
      <p className="mt-2">
        تم تصميم هذا النظام خصيصًا لإدارة حجوزات غرف البلايستيشن
      </p>
    </footer>
  );
}
