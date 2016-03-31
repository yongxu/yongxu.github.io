import React from "react"
import ReactDOM from "react-dom"
import Terminal from "./terminal"

require('./css/preload.css')

require('./prelude')()
.then(require('./home'))
