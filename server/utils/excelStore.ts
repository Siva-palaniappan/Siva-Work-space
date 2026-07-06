import ExcelJS from 'exceljs'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// `nuxt preview` / the built node-server chdir into `.output` before running,
// so anchor to where the process was actually launched from (npm sets this),
// not process.cwd() — otherwise every rebuild (which wipes `.output`) would
// destroy all persisted data.
const PROJECT_ROOT = process.env.INIT_CWD || process.cwd()
const DATA_DIR = resolve(PROJECT_ROOT, '.data/spendnest')

function filePath(fileName: string) {
  return resolve(DATA_DIR, fileName)
}

export async function readRows(fileName: string, sheetName: string, headers: string[]): Promise<Record<string, any>[]> {
  const path = filePath(fileName)
  if (!existsSync(path)) return []

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(path)
  const sheet = workbook.getWorksheet(sheetName)
  if (!sheet) return []

  const rows: Record<string, any>[] = []
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // header
    const obj: Record<string, any> = {}
    headers.forEach((header, i) => {
      obj[header] = row.getCell(i + 1).value ?? ''
    })
    rows.push(obj)
  })

  return rows
}

// Always rebuilds the sheet from scratch instead of mutating a loaded one,
// so no previously written rows can ever survive into the new file twice.
export async function writeRows(fileName: string, sheetName: string, headers: string[], rows: Record<string, any>[]) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)
  sheet.addRow(headers)
  rows.forEach(row => {
    sheet.addRow(headers.map(header => row[header] ?? ''))
  })

  await workbook.xlsx.writeFile(filePath(fileName))
}

// Serializes read-modify-write sequences per file so concurrent requests
// against the same workbook can't clobber each other's changes.
const fileLocks = new Map<string, Promise<any>>()

export async function withFileLock<T>(fileName: string, fn: () => Promise<T>): Promise<T> {
  const previous = fileLocks.get(fileName) ?? Promise.resolve()
  const run = previous.then(fn, fn)
  fileLocks.set(fileName, run.catch(() => {}))
  return run
}
