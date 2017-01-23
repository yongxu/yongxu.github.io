import React from "react"
import ReactDOM from "react-dom"
import Terminal from "terminal"
import addGithubIcon from 'addGithubIcon'

require('./intro.css')

export default function(interpreter){
//  interpreter.addCommandListener('tttest', (a,b,c) => console.log(""+a+b+c))
  const addIntro = (win) => {
    const introDiv = document.createElement('div')
    introDiv.className = 'introWindow'
    introDiv.innerHTML = `
<p>This is <em>Yongxu Ren</em>'s experiment lab.</p>
<p>Everything is injected in real-time, you can control the parsing flow using the <em><i>control buttons</i></em> on the upper right corner.</p>
<p>Unfortunately, This page is still under construction. You may see broken layout or unfinshed content.</p>
<div>
For more Information about me, please checkout:<br>
<a href='./assets/resume.pdf'>My Resume</a>
<div>
`
    win.injectContent(introDiv)
  }

  interpreter.injectContext({
    addGithubIcon,
    addIntro
  })


  return interpreter.run(require('raw!./intro.txt'))
}
