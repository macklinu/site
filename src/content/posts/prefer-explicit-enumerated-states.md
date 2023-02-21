---
date: '2023-02-21'
title: 'Prefer explicit, enumerated states'
description: 'Using mulitple useState() hooks is simple, but you might run into some subtle bugs or confusing code as a result.'
---

Often times when reviewing React code, I see something like this.

```ts
function MyComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState()
  const [error, setError] = useState()
}
```

We have three `useState()` hooks to represent the possible status and associated data of an asynchronous operation - **loading**, **success**, and **error**. This may seem harmless, but this pattern can lead to some confusing code and bugs. Can you spot the bug in this code?

```ts
useEffect(() => {
  setIsLoading(true)
  get('/api/some-data')
    .then((data) => {
      setData(data)
    })
    .catch((error) => {
      setError(error)
    })
}, [])
```

Oops! We forgot to set `isLoading` to `false` when the request is complete – an easy mistake to make.

Additionally, we have to rely on the presence of the `data` and `error` variables to know if we are in the **success** or **error** state. We've created some implicit boolean states, and these can get more difficult to reason about as the number of states grows.

```tsx
function MyComponent() {
  // ...

  if (isLoading) {
    // 'loading' state
    return <Loading />
  }

  if (error) {
    // 'error' state
    return <Error error={error} />
  }

  if (data) {
    // 'success' state
    return (
      <ul>
        {data.map((item) => (
          <ListItem key={item.id} {...item} />
        ))}
      </ul>
    )
  }

  // What state are we in here?
  return null
}
```

Taking a step in the right direction, we can use an enumerated state to avoid this situation altogether.

```ts
type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

function MyComponent() {
  const [status, setStatus] = useState<ApiStatus>('idle')
  const [data, setData] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    setStatus('loading')
    get('/api/some-data')
      .then((data) => {
        setStatus('success')
        setData(data)
      })
      .catch((error) => {
        setStatus('error')
        setError(error)
      })
  }, [])
}
```

Or even better with a reducer, since the **success** and **error** statuses have data associated with them.

```ts
function MyComponent() {
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'loading':
          return { status: 'loading' }
        case 'success':
          return { status: 'success', data: action.payload }
        case 'error':
          return { status: 'error', error: action.payload }
        default:
          return state
      }
    },
    { status: 'idle' }
  )

  useEffect(() => {
    dispatch({ type: 'loading' })
    get('/api/some-data')
      .then((data) => {
        dispatch({
          type: 'success',
          payload: data,
        })
      })
      .catch((error) => {
        dispatch({
          type: 'error',
          payload: error,
        })
      })
  }, [])

```

Now we know we can only be in one of four possible states at any given time, and we are handling all of them more clearly. And with TypeScript, we can add a [discriminated union type](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions) and declare that we can only access `state.data` when `state.status === 'success'` and `state.error` when `state.status === 'error'`.

```ts
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | {
      status: 'success'
      data: Array<{
        id: string
        // other properties...
      }>
    }
  | { status: 'error'; error: Error }

function MyComponent() {
  // ...

  switch (state.status) {
    case 'loading':
      return <Loading />
    case 'error':
      return <Error error={state.error} />
    case 'success':
      return (
        <ul>
          {state.data.map((item) => (
            <ListItem key={item.id} {...item} />
          ))}
        </ul>
      )
    // The 'idle' case is now more explicit
    case 'idle':
    default:
      return null
  }
}
```

Please note that while this example uses client-side request handling, I generally prefer to use a library like [TanStack Query](https://tanstack.com/query/latest/) or [RTK Query](https://redux-toolkit.js.org/rtk-query/overview), which handles the request/state management for you (plus many more features).

If you find yourself in a similar situation with multiple boolean or implicit boolean states, take a step back and see if an explicit, enumerated state would be a better fit.
