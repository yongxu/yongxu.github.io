import React from "react"
import ReactDOM from "react-dom"
import Terminal from "terminal"

require('./index.css')
import GlitchText from "magic/glitchText"

export default function(interpreter){
  let app = document.getElementById('app')

  let home = document.createElement('div')
  home.id = 'home'
  app.appendChild(home)

  let title = new GlitchText(home)
  interpreter.injectContext({
    title
  })
  return interpreter.run(require('raw!./home.txt'))
}
