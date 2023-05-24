import moment from "moment";

/*Use this to format the time ago to your own needs*/
/*moment.updateLocale("en", {
  relativeTime: {
    d: "%d day",
  },
});*/

export const formatDate = (timestamp: number, outputFormat = "YYYY-MM-DD"): string => {
  return moment(timestamp).format(outputFormat);
};

export const toTimeAgo = (time: string | number, isUTC = false, format = "YYYY-MM-DDTHH:mm:ss.SSS") => {
  if (typeof time === "number") {
    return isUTC ? moment.utc(time).fromNow() : moment(time).fromNow();
  }
  return isUTC ? moment.utc(time, format).utc().fromNow() : moment(time, format).utc().fromNow();
};

export const getMonthsRange = (startTimestamp: number, endTimestamp: number) => {
  return Math.round(moment(endTimestamp).diff(moment(startTimestamp), "months", true));
};

interface HumanTime {
  time: number;
  unit: string;
}

export const secondsToHumanTime = (time: number, forceHoursOutput = false): HumanTime => {
  if (forceHoursOutput) {
    const hours = time / 3600;
    const value = Math.ceil(hours);
    return {
      time: value,
      unit: value === 1 ? "hour" : "hours",
    };
  }
  const days = time / (3600 * 24);
  if (days >= 1) {
    // 1.000003 for example will be returned as 2 days
    const value = Math.ceil(days);
    return {
      time: value,
      unit: value === 1 ? "day" : "days",
    };
  }
  // these seconds are less than a day, return the number of hours
  const hours = time / 3600;
  if (hours >= 1) {
    const value = Math.ceil(hours);
    return {
      time: value,
      unit: value === 1 ? "hour" : "hours",
    };
  }

  // these seconds are less than an hour
  const minutes = time / 60;
  const value = Math.ceil(minutes);
  return {
    time: value,
    unit: value >= 0 ? "minute" : "minutes",
  };
};
