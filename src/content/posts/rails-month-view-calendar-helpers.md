---

  date: '2022-10-13'
  title: 'Month calendar view helpers in Ruby on Rails'
  description:
    'Rails makes it very easy to build a month calendar with date helpers like beginning_of_week and end_of_week.'


---

I'm learning how to build an interactive calendar UI with [Rails](https://rubyonrails.org/) and [Hotwire](https://hotwired.dev/). Take a look at this nicely designed calendar from [Tailwind UI](https://tailwindui.com/components/application-ui/data-display/calendars#component-c29139529079ea762f118812bbeaeb9e).

![Tailwind UI month calendar](/assets/tailwind-ui-month-calendar.png)

I wondered how I would generate a full month's dates but also include the last week of the previous month and the first week of the following month enough to fill in a 7x5 or 7x6 grid. Luckily, Rails has some handy date helpers that make this easy, and they read like I'm writing a sentence.

```ruby
date.beginning_of_month.beginning_of_week..date.end_of_month.end_of_week
```

I love how that one line will generate the exact date range I need. Take a look at the docs for [`DateAndTime::Calculations`](https://api.rubyonrails.org/classes/DateAndTime/Calculations.html) to learn more about the `beginning_of` and `end_of` helpers.
