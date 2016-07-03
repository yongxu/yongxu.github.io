import React from "react"
import ReactDOM from "react-dom"
import Terminal from "./terminal"
import Interpreter from './interpreter'

require('scripts/prelude')(new Interpreter)
.then(require('scripts/home'))
