const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export const formatFullDate = (epochMilliseconds: number) =>
  fullDateFormatter.format(epochMilliseconds);
