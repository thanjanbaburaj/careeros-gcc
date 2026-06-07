import { useState, useEffect } from 'react'
import authStore from '../store/authStore.js'

let _initialized = false

export function useAuth() {
  const [state, setState] = useState(authStore.getState())

  useEffect(() => {
    const unsub = authStore.subscribe(setState)
    if (!_initialized) {
      _initialized = true
      authStore.init()
    }
    return unsub
  }, [])

  return state
}
