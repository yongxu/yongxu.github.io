import Parser from "parser"
import React from "react"
import ReactDOM from "react-dom"
import Terminal from "terminal"

import GlitchText from "magic/glitchText"

require('./index.css')

export default function(interpreter){
  document.getElementsByTagName("body")[0]
  .insertAdjacentHTML('beforeend', '<style>.control{visibility:hidden;}</style>')
  let app = document.getElementById('main')
  let home = document.createElement('div')
  home.id = 'home'
  app.appendChild(home)

  let title = new GlitchText(home)
  interpreter.injectContext({
    title
  })
  return interpreter.run(require('raw!./home.txt'))
}
