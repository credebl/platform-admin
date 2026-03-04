
'use client'

import { AppStore, makeStore, persistor, store } from '../lib/store'

import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import { useRef } from 'react'

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const storeRef = useRef<AppStore | undefined>(undefined)
  const persistorRef = useRef<any>(undefined)

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
    persistorRef.current = persistStore(storeRef.current)
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
