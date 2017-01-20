import React from "react"
import ReactDOM from "react-dom"
import Terminal from "./terminal"
import Interpreter from './interpreter'

const interpreter = new Interpreter
window.interpreter = interpreter
require('scripts/intro')(interpreter)
.then(require('scripts/home'))
