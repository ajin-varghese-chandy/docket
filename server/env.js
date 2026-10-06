import fs from 'node:fs'

export function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const text = fs.readFileSync(filePath, 'utf8')
  const lines = text.split(/\r?\n/)

  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)

    if (!match) {
      continue
    }

    const name = match[1]
    let value = match[2]

    const first = value.slice(0, 1)
    const last = value.slice(-1)
    if ((first === '"' || first === "'") && value.length > 1 && last === first) {
      value = value.slice(1, -1)
    }

    if (value && !(name in process.env)) {
      process.env[name] = value
    }
  }
}
