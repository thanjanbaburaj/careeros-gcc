/**
 * CareerOS GCC — IndexedDB Service
 * Standalone. Zero external dependencies.
 * All persistent local data flows through here.
 *
 * Stores:
 *   users       — profile and preferences
 *   jobs        — cached job feed results
 *   applications — tracker entries
 *   cv_data     — CV content and keywords
 *   companies   — watchlist entries
 *   contacts    — references and connections
 *   notes       — free-form notes per entity
 *   mood_log    — wellbeing check-ins
 *   sync_queue  — pending cloud sync operations
 */

const DB_NAME    = 'careeros_gcc'
const DB_VERSION = 1

const STORES = {
  users:        { keyPath: 'id' },
  jobs:         { keyPath: 'id' },
  applications: { keyPath: 'id' },
  cv_data:      { keyPath: 'id' },
  companies:    { keyPath: 'id' },
  contacts:     { keyPath: 'id' },
  notes:        { keyPath: 'id' },
  mood_log:     { keyPath: 'id' },
  sync_queue:   { keyPath: 'id', autoIncrement: true },
}

let _db = null

function openDB() {
  if (_db) return Promise.resolve(_db)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      Object.entries(STORES).forEach(([name, options]) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, options)
        }
      })
    }

    request.onsuccess  = (e) => { _db = e.target.result; resolve(_db) }
    request.onerror    = (e) => reject(e.target.error)
  })
}

async function tx(storeName, mode, fn) {
  const db    = await openDB()
  const store = db.transaction(storeName, mode).objectStore(storeName)
  return new Promise((resolve, reject) => {
    const req = fn(store)
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(e.target.error)
  })
}

// ── CRUD ────────────────────────────────────────────

export const db = {
  /** Get one record by key */
  get: (store, key) => tx(store, 'readonly', (s) => s.get(key)),

  /** Get all records */
  getAll: (store) => tx(store, 'readonly', (s) => s.getAll()),

  /** Put (upsert) a record */
  put: (store, record) => tx(store, 'readwrite', (s) => s.put({
    ...record,
    updatedAt: new Date().toISOString(),
  })),

  /** Delete a record */
  delete: (store, key) => tx(store, 'readwrite', (s) => s.delete(key)),

  /** Clear all records in a store */
  clear: (store) => tx(store, 'readwrite', (s) => s.clear()),

  /** Get all records matching a filter function */
  filter: async (store, filterFn) => {
    const all = await tx(store, 'readonly', (s) => s.getAll())
    return all.filter(filterFn)
  },

  /** Count records */
  count: (store) => tx(store, 'readonly', (s) => s.count()),
}

export default db
