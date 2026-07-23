const FILE_NAME_TIMESTAMP_PATTERN = /^(\d{4})_(\d{2})_(\d{2})_(\d{2})_(\d{2})_(\d{2})(?:_thread_cpu_utilisation)?\.txt$/;

const getEpoch = (
  year: string,
  month: string,
  day: string,
  hours: string,
  minutes: string,
  seconds: string,
): number => Date.UTC(
  parseInt(year, 10),
  parseInt(month, 10) - 1,
  parseInt(day, 10),
  parseInt(hours, 10),
  parseInt(minutes, 10),
  parseInt(seconds, 10),
);

export const tryGetEpochFromFileName = (fileName: string): number | undefined => {
  const match = FILE_NAME_TIMESTAMP_PATTERN.exec(fileName);
  if (match === null) {
    return undefined;
  }

  const [, year, month, day, hours, minutes, seconds] = match;
  return getEpoch(year, month, day, hours, minutes, seconds);
};

// Parse YYYY-MM-DD HH:mm:ss explicitly because Safari does not reliably parse this timestamp format
export const getEpochFromDateTime = (dateTime: string): number => getEpoch(
  dateTime.substring(0, 4),
  dateTime.substring(5, 7),
  dateTime.substring(8, 10),
  dateTime.substring(11, 13),
  dateTime.substring(14, 16),
  dateTime.substring(17),
);
