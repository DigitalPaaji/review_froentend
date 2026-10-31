"use client"
import React from 'react'
import {CompoLayout} from "./CompoLayout"
import { Provider } from 'react-redux'
import store from '@/components/store/store'
const layout = ({children}) => {
  return (<><Provider store={store}>
    <CompoLayout>{children}</CompoLayout>
    </Provider>
  </>
  )
}

export default layout