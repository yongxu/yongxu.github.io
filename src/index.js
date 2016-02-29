import React from "react"
import ReactDOM from "react-dom"
import Terminal from "./terminal"

require('./css/preload.css')

require('./prelude')()
.then(()=>console.log('prelude done'))

ReactDOM.render((
	<Terminal/>
), document.getElementById("main"))
