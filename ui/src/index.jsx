/* @refresh reload */
import { render } from 'solid-js/web'

import '../styles/index.scss'
import './index.css'
import petstore from './assets/petstore.openapi.json'
import App from './App'

document.title = window.HAPIDOC_CONFIG?.title || 'hapidoc'
window.HAPIDOC_OPENAPI = window.HAPIDOC_OPENAPI || petstore

render(() => <App />, document.getElementById('root'))
