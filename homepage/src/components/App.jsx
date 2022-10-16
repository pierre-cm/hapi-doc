import { createSignal, createEffect } from 'solid-js'
import { Routes, Route } from '@solidjs/router'

import './App.scss'
import Header from './Header'
import Home from './Home'
import Documentation from './Documentation'
import Example from './Example'

function App() {
  return (
    <div>
      <Header/>
      <Routes>
        <Route path='/' component={Home}/>
        <Route path='/doc' component={Documentation}/>
        <Route path='/example' component={Example}/>
      </Routes>
    </div>
  )
}

export default App
