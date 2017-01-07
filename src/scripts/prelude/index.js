import React from "react"
import ReactDOM from "react-dom"
import Terminal from "terminal"

require('./preload.css')

export default function(interpreter){
//  interpreter.addCommandListener('tttest', (a,b,c) => console.log(""+a+b+c))
  return interpreter.run(require('raw!./prelude.txt'))
}
