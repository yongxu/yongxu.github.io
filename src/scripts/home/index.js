import Parser from "shunt"
import React from "react"
import ReactDOM from "react-dom"
import Terminal from "terminal"

export default function(interpreter){
  return interpreter.run(require('raw!./home.txt'))
}
