// Tiny client-side search helpers shared by the list pages and the global
// search panel. Everything here is case-insensitive and substring based, which
// is enough for the size of data DOCKET deals with.

export function normalize(value) {
  return String(value === null || value === undefined ? '' : value)
    .toLowerCase()
    .trim()
}

export function matchesQuery(query, fields) {
  const needle = normalize(query)
  if (!needle) return true
  return fields.some((field) => normalize(field).includes(needle))
}

export function filterRows(rows, query, toFields) {
  const needle = normalize(query)
  if (!needle) return rows
  return rows.filter((row) => matchesQuery(needle, toFields(row)))
}
