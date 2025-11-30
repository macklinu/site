---
date: '2023-07-10'
title: 'Month calendar view helpers with Luxon'
description: 'This is how to use Luxon to build a month calendar with date helpers like startOf and endOf.'
---

[Last year, I explored building a month view calendar with Rails]. I thought Rails date helpers made building this UI much simpler than using JavaScript. And while I still think that's true, I realized it's not too much harder to build this same UI with JavaScript using the [Luxon] library.

In order to get a month view calendar date range, we first need a Luxon [`DateTime`] object.

```ts
const dateTime = DateTime.now()
```

To get the start of the calendar (start of the week for the first day of the month), we can use the `startOf` method.

```ts
const start = dateTime.startOf('month').startOf('week')
```

Similarly, we can get the end of the calendar (end of the week for the last day of the month) with the `endOf` method.

```ts
const end = dateTime.endOf('month').endOf('week')
```

Now we can create an [`Interval`] from the start and end dates in order to generate each day in the calendar date range.

```ts
const range = Interval.fromDateTimes(start, end).splitBy({ days: 1 })
```

Finally, we can map over the range and format each date as a string (or whatever other things you want to do with each `DateTime` object).

```ts
const formattedDays = range.map((day) => day.start.toFormat('yyyy-MM-dd'))
```

[`DateTime`]: https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html
[`Interval`]: https://moment.github.io/luxon/docs/class/src/interval.js~Interval.html
[Luxon]: https://moment.github.io/luxon/
[Last year, I explored building a month view calendar with Rails]: /posts/rails-month-view-calendar-helpers
