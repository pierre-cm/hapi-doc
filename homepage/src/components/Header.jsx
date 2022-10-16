import { A } from '@solidjs/router'

import css from './Header.module.scss'
import logo from '../assets/hapi-doc.svg'

function Header() {
  return (
    <div>
      <nav class='navbar' role='navigation' aria-label='main navigation'>
        <div class='navbar-brand'>
            <A class='navbar-item' href='/'>
              <img src={logo}class={css.Logo} />
              <h1 class='title'><span class={css.primary}>hapi</span>doc</h1>
            </A>

            <a role='button' class='navbar-burger' aria-label='menu' aria-expanded='false' data-target='navbarBasicExample'>
            <span aria-hidden='true'></span>
            <span aria-hidden='true'></span>
            <span aria-hidden='true'></span>
            </a>
        </div>

        <div id='navbarBasicExample' class='navbar-menu'>
            <div class='navbar-start'>
            <A class='navbar-item' href='/' >Home</A>
            {/* <A class='navbar-item' href='/doc' >Documentation</A> */}
            <A class='navbar-item' href='/example' >Example</A>
            </div>
        </div>
        </nav>
    </div>
  )
}

export default Header
