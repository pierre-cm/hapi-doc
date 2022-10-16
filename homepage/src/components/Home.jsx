import { createSignal, createEffect } from 'solid-js'
import {marked} from 'marked'

import css from './Home.module.scss'

function Home() {
  const [content, setContent] = createSignal('')
  createEffect(() => {
    fetch('https://raw.githubusercontent.com/pierre-cm/hapi-doc/main/README.md')
      .then(res => res.text())
      .then(text => setContent(marked(text)))
  })
  return (
    <div class={css.Home}>
      <div class={css.Markdown} innerHTML={content()}/>
    </div>
  )
}
  
  export default Home