import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export const formattedDate = (date: Date) => {
  const parsedDate = dayjs(date).tz('Asia/Kolkata');

  return parsedDate.format('DD MMM YYYY');
};

// TIME FUNCTION
export const formatTime = (timeString: string) => {
  const date = dayjs(timeString).tz('Asia/Kolkata');

  return date.format('hh:mm A');
};

export const getAuctionStartTimeWithStartDate = (startDate: string, startTime: string) => {
  const parsedStartDate = dayjs(startDate);
  const parsedStartTime = dayjs(startTime);

  return parsedStartDate.hour(parsedStartTime.hour()).minute(parsedStartTime.minute()).second(parsedStartTime.second());
};
