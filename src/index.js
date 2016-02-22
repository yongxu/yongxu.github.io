
import React from "react";
import ReactDOM from "react-dom";
import Parser from "./scripts/interpreter"
import DnR from "react-dnr";

let p = new Parser;

p.handles.char = c => console.log(c);

p.parse("lolol lol")
//require('./githubIcon')();

ReactDOM.render((
	<div>
		Succeed
	</div>
), document.getElementById("main"));
