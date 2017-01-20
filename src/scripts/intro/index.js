import React from "react"
import ReactDOM from "react-dom"
import Terminal from "terminal"
import addGithubIcon from 'addGithubIcon'

require('./intro.css')

export default function(interpreter){
//  interpreter.addCommandListener('tttest', (a,b,c) => console.log(""+a+b+c))

  interpreter.injectContext({
    addGithubIcon
  })
  return interpreter.run(require('raw!./intro.txt'))
}
