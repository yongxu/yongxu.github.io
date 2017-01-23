import React from "react"
import ReactDOM from "react-dom"
import Terminal from "./terminal"

import './utils/globalInjection' // store, interpreter, etc..

require('scripts/intro')(interpreter)
.then(require('scripts/home'))
