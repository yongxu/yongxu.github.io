import React from "react"
import ReactDOM from "react-dom"
import DnR from "react-dnr"

require('./css/preload.css')

require('./prelude')()
.then(()=>console.log('prelude done'))

// ReactDOM.render((
// 	<div>
// 		Succeed
// 	</div>
// ), document.getElementById("main"))
