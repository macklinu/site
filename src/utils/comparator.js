const typeRanks = {
  maintainer: 2,
  contributor: 1,
}

/**
 * Sorts OSS contributions by type and name.
 *
 * @param {{type: string, name: string}} a OSS project A.
 * @param {{type: string, name: string}} b OSS project B.
 * @returns {number}
 */
export const ossComparator = (a, b) => {
  const aTypeRank = typeRanks[a.type] || 0
  const bTypeRank = typeRanks[b.type] || 0
  return (
    bTypeRank - aTypeRank ||
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  )
}
