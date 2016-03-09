import React from "react"
import ReactDOM from "react-dom"
import Terminal from "./terminal"

require('./css/preload.css')

require('./prelude')()
.then(()=>{

  let terminalScreen = document.getElementById('terminal')
  let screen = document.getElementsByClassName("screen")[0]
  let terminal = ReactDOM.render((
    <Terminal/>
  ), document.getElementById("prelude"))
  terminal.injectContent(terminalScreen)
  let lastHeight = 0
  setInterval(()=>{
    let screenHeight = terminalScreen.clientHeight
    if( screenHeight !== lastHeight) {
      screen.style.height = (screenHeight-48) + 'px' //substract padding
      screen.scrollTop = screen.scrollHeight
    }
      lastHeight = screenHeight
  },30)
})
