export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const minutesToSeconds = (minutes: number): number => {
  return minutes * 60;
};

export const secondsToMinutes = (seconds: number): number => {
  return Math.ceil(seconds / 60);
};