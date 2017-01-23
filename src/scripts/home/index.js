import Parser from "parser"
import React from "react"
import ReactDOM from "react-dom"
import Terminal from "terminal"

import GlitchText from "magic/glitchText"
import addBackground from "magic/background_one"

require('./index.css')

export default function(interpreter){
  document.getElementsByTagName("body")[0]
  .insertAdjacentHTML('beforeend', '<style>.control{visibility:hidden;}</style>')
  let app = document.getElementById('main')
  let home = document.createElement('div')
  home.id = 'home'
  const bg = document.createElement('div')
  bg.className = 'underlay'
  home.appendChild(bg)
  app.appendChild(home)


  let title = new GlitchText(home)
  interpreter.injectContext({
    title,
    addBackground
  })
  return interpreter.run(require('raw!./home.txt'))
}
