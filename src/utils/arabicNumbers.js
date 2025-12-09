export const getSessionStatusText = (status) => {
  const statusMap = {
    Pending: "قيد الانتظار",
    Active: "نشطة",
    Finished: "منتهية",
    Cancelled: "ملغية",
    Payed: "مدفوعة",
  };
  return statusMap[status] || status;
};

export const getRoomStatusText = (isAvailable) => {
  return isAvailable ? "متاحة" : "مشغولة";
};

export const shouldDisplaySession = (session) => {
  return session.status !== "Payed";
};

export const toArabicNumbers = (num) => {
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num.toString().replace(/\d/g, (digit) => arabicNumbers[digit]);
};

export const toEnglishNumbers = (str) => {
  const arabicToEnglish = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };
  return str.replace(/[٠-٩]/g, (digit) => arabicToEnglish[digit]);
};

export const arabicTimeToMinutes = (timeStr) => {
  let time = timeStr;
  let hours = 0;
  let minutes = 0;

  time = toEnglishNumbers(time);

  if (time.includes("صباحاً")) {
    time = time.replace("صباحاً", "").trim();
    [hours, minutes] = time.split(":").map(Number);
  } else if (time.includes("ظهراً")) {
    time = time.replace("ظهراً", "").trim();
    [hours, minutes] = time.split(":").map(Number);
    if (hours !== 12) hours += 12;
  } else if (time.includes("مساءً")) {
    time = time.replace("مساءً", "").trim();
    [hours, minutes] = time.split(":").map(Number);
    if (hours !== 12) hours += 12;
  }

  return hours * 60 + minutes;
};

export const getCurrentDate = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  return `${toArabicNumbers(day)}-${toArabicNumbers(month)}-${toArabicNumbers(
    year
  )}`;
};

export const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day = tomorrow.getDate();
  const month = tomorrow.getMonth() + 1;
  const year = tomorrow.getFullYear();
  return `${toArabicNumbers(day)}-${toArabicNumbers(month)}-${toArabicNumbers(
    year
  )}`;
};

export const formatInputDateToArabic = (dateString) => {
  if (!dateString) return getCurrentDate();

  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${toArabicNumbers(day)}-${toArabicNumbers(month)}-${toArabicNumbers(
    year
  )}`;
};

export const arabicTimeSlots = [
  "٩:٠٠ صباحاً",
  "١٠:٠٠ صباحاً",
  "١١:٠٠ صباحاً",
  "١٢:٠٠ ظهراً",
  "١:٠٠ مساءً",
  "٢:٠٠ مساءً",
  "٣:٠٠ مساءً",
  "٤:٠٠ مساءً",
  "٥:٠٠ مساءً",
  "٦:٠٠ مساءً",
  "٧:٠٠ مساءً",
  "٨:٠٠ مساءً",
  "٩:٠٠ مساءً",
  "١٠:٠٠ مساءً",
  "١١:٠٠ مساءً",
];

export const convertToEgyptTime = (utcDateString) => {
  if (!utcDateString) return new Date();

  const utcDate = new Date(utcDateString);

  const egyptOffset = 2 * 60 * 60 * 1000;

  return new Date(utcDate.getTime() + egyptOffset);
};

export const formatApiTimeToArabic = (apiTimeString) => {
  if (!apiTimeString) return "٠٠:٠٠";

  const egyptDate = convertToEgyptTime(apiTimeString);

  let hours = egyptDate.getHours();
  let minutes = egyptDate.getMinutes();

  let period = "صباحاً";
  if (hours >= 12) {
    period = "مساءً";
  }

  hours = hours % 12 || 12;

  const arabicHours = toArabicNumbers(hours);
  const arabicMinutes = toArabicNumbers(minutes.toString().padStart(2, "0"));

  return `${arabicHours}:${arabicMinutes} ${period}`;
};

export const formatApiDate = (apiDateString) => {
  if (!apiDateString) return getCurrentDate();

  const egyptDate = convertToEgyptTime(apiDateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const normalizeDate = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const normalizedEgyptDate = normalizeDate(egyptDate);
  const normalizedToday = normalizeDate(today);
  const normalizedTomorrow = normalizeDate(tomorrow);

  if (normalizedEgyptDate.getTime() === normalizedToday.getTime()) {
    return getCurrentDate();
  } else if (normalizedEgyptDate.getTime() === normalizedTomorrow.getTime()) {
    return getTomorrowDate();
  } else {
    const day = toArabicNumbers(egyptDate.getDate());
    const month = toArabicNumbers(egyptDate.getMonth() + 1);
    const year = toArabicNumbers(egyptDate.getFullYear());
    return `${day}/${month}/${year}`;
  }
};

export const formatDuration = (durationStr) => {
  if (!durationStr) return "٠ ساعة";

  const match = durationStr.match(/([\d.]+)\s*ساعة/);
  if (!match) return durationStr;

  const number = parseFloat(match[1]);
  if (isNaN(number)) return durationStr;

  if (number % 1 !== 0) {
    const decimalPart = number.toString().split(".")[1] || "";
    const roundedDecimal = decimalPart.slice(0, 3);
    const formattedNumber = `${Math.floor(number)}.${roundedDecimal}`;
    return `${toArabicNumbers(formattedNumber)} ساعة`;
  }

  return `${toArabicNumbers(number)} ساعة`;
};

export const getUiSessionStatus = (timerValue, originalStatus) => {
  if (!timerValue) return originalStatus;

  if (timerValue.type === "countup" || timerValue.type === "countdown") {
    return "Active";
  } else if (timerValue.type === "finished") {
    return "Finished";
  } else if (timerValue.type === "upcoming") {
    return "Pending";
  }

  return originalStatus;
};

export const getUiSessionStatusText = (timerValue, originalStatusText) => {
  if (!timerValue) return originalStatusText;

  if (timerValue.type === "countup" || timerValue.type === "countdown") {
    return "نشطة";
  } else if (timerValue.type === "finished") {
    return "منتهية";
  } else if (timerValue.type === "upcoming") {
    return "قيد الانتظار";
  }

  return originalStatusText;
};

export const getUiRoomStatus = (
  timerValue,
  roomNumber,
  sessions,
  originalIsAvailable
) => {
  if (!timerValue || !sessions) return originalIsAvailable;

  const roomSession = sessions.find(
    (session) => session.roomNumber === roomNumber
  );
  if (!roomSession) return originalIsAvailable;

  if (timerValue.type === "countup" || timerValue.type === "countdown") {
    return false;
  } else if (timerValue.type === "finished") {
    return true;
  }

  return originalIsAvailable;
};

export const getUiRoomStatusText = (
  timerValue,
  roomNumber,
  sessions,
  originalStatusText
) => {
  if (!timerValue || !sessions) return originalStatusText;

  const roomSession = sessions.find(
    (session) => session.roomNumber === roomNumber
  );
  if (!roomSession) return originalStatusText;

  if (timerValue.type === "countup" || timerValue.type === "countdown") {
    return "مشغولة";
  } else if (timerValue.type === "finished") {
    return "متاحة";
  }

  return originalStatusText;
};
