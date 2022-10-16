/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from "@solidjs/router"

import '../styles/index.scss'
import '../styles/index.css'
import App from './components/App'

render(() => <Router><App /></Router>, document.getElementById('root'))
