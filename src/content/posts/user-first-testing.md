---
date: '2023-05-05'
title: 'User first testing'
description: 'Write tests that verify the behavior of the software from the perspective of the user.'
---

Valuable tests are one of the most important parts of building software. So far in my career, I've experienced a lot of tools and methodologies for testing code, but recently my main goal is to write tests that **verify the behavior of the code from the perspective of the user**.

Generally speaking, I would rather write a few end to end tests that verify how the user would use the whole software system rather than write a lot of unit or integration tests that verify the implementation of smaller chunks of code.

For frontend web development, this can be achieved through end to end (<abbr>E2E</abbr>) testing frameworks like [Playwright][], but the same concept applies when writing integration tests with a library like [React Testing Library][].

Take this modified example from my current job.

```ts
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import { ChecklistComponent } from './ChecklistComponent'

test('clicking checkbox dispatches expected action', () => {
  const createMockStore = configureMockStore(middlewares)
  const store = createMockStore(initialState)

  render(
    <Provider store={store}>
      <ChecklistComponent />
    </Provider>
  )

  fireEvent.click(screen.getByLabelText(/unselect all/i))

  expect(store.getActions()).toContainEqual({
    type: 'checklist/unselectAll',
  })
})
```

This test verifies that a Redux action is dispatched when clicking the "Unselect All" checkbox. The problem is that if I change how the `checklist/unselectAll` action is handled in the Redux reducer and break the functionality for the user, this test will still pass. **The test is verifying the implementation of the code, not the behavior.**

We should verify that the UI updates in response to clicking the "Unselect All" checkbox, just as the user would expect to see.

```ts
fireEvent.click(screen.getByLabelText(/unselect all/i))

for (const checkbox of screen.getAllByRole('checkbox')) {
  expect(checkbox).not.toBeChecked()
}
```

I can migrate away from Redux and know that the user still sees the same behavior. I'm no longer bound to the implementation of the code, and I can have more faith that my tests will catch any regressions.

## What about unit tests?

Unit tests aren't bad, but I think they're often misused. When working alone or in a small team, I reach for unit tests in a couple of situations.

1. I want fast feedback while I'm working with unfamiliar APIs or programming languages.
1. I want to stress test a function with a lot of generated inputs to verify edge cases.

### Fast feedback

When I'm working with unfamiliar APIs or programming languages, I'll often write a unit test to verify that I'm using the API correctly. This allows me to explore something new and verify I understand the API or language well enough. This is even better with test runners that have a watch mode, like Jest or Vitest.

### Stress testing

I tend to reach for a [property based][] testing framework like [fast-check][] when I want to test my functions in a way where I can explore edge cases and a variety of different inputs in a general way.

Insert example here

Conclusion: recap why user first testing is good

[fast-check]: https://github.com/dubzzz/fast-check
[MSW]: https://mswjs.io/
[Playwright]: https://playwright.dev/
[property based]: https://github.com/dubzzz/fast-check/blob/main/packages/fast-check/documentation/HandsOnPropertyBased.md
[React Testing Library]: https://testing-library.com/docs/react-testing-library/intro
[TestingJavaScript.com]: https://testingjavascript.com/
