import { ossComparator } from './comparator'

describe('ossComparator()', () => {
  it('sorts maintainer -> contributor', () => {
    const data = [
      { name: 'probot', type: 'contributor' },
      { name: 'eslint-plugin-jest', type: 'maintainer' },
    ]

    expect(data.sort(ossComparator)).toEqual([
      { name: 'eslint-plugin-jest', type: 'maintainer' },
      { name: 'probot', type: 'contributor' },
    ])
  })
  it('tiebreaks all by name', () => {
    const data = [
      { name: 'eslint-plugin-promise', type: 'maintainer' },
      { name: 'probot', type: 'contributor' },
      { name: 'typescript-eslint', type: 'contributor' },
      { name: 'eslint-plugin-jest', type: 'maintainer' },
    ]

    expect(data.sort(ossComparator)).toEqual([
      { name: 'eslint-plugin-jest', type: 'maintainer' },
      { name: 'eslint-plugin-promise', type: 'maintainer' },
      { name: 'probot', type: 'contributor' },
      { name: 'typescript-eslint', type: 'contributor' },
    ])
  })
})
