import Parser from "../shunt"
import React from "react"
import ReactDOM from "react-dom"
import Terminal from "../terminal"

const textSpeed = 40
const jsSpeed = 10
const cssSpeed = 5
export default function(){
  return new Promise(function(resolve, reject){

    let prelude = document.getElementById('prelude')

    let el = document.createElement('div')
    el.id = 'terminal'
    prelude.appendChild(el)

    let termDock = document.createElement('div')
    termDock.id = 'termdock'
    prelude.appendChild(termDock)

    let underlay = document.createElement('div')
    underlay.classList.add('underlay')
    let overlay = document.createElement('div')
    overlay.classList.add('overlay')
    el.appendChild(underlay)
    el.appendChild(overlay)

    let screen = document.createElement('div')
    screen.classList.add('screen')
    el.appendChild(screen)
    let cssElem = document.createElement('style')
    document.body.appendChild(cssElem)

    let p = new Parser
    p.delay = textSpeed
    p.onFinish = ()=>{
      resolve({parser:p, terminal: screen})
    }
    let text = ''
    let jsCode = ''
    let cssCode = ''
    let currentBlockType = 'text'
    let appendedCloseTag = ''
    p.handles.char = (next, parser) => {

      switch (next.blockType) {
        case 'js':
        case 'printjs':
          parser.delay = jsSpeed
          jsCode += next.value
          if (currentBlockType !== 'js' && currentBlockType !== 'printjs'){
            text += '<code class="jscode">'
          }
          appendedCloseTag = '</code>'
          break
        case 'css':
          parser.delay = cssSpeed
          cssElem.innerHTML += next.value
          if (currentBlockType !== 'css'){
            text += '<code class="csscode">'
          }
          appendedCloseTag = '</code>'
          break
        case 'mark':
        default:
          parser.delay = textSpeed
          if(currentBlockType === 'js'
            || currentBlockType === 'css'
            || currentBlockType === 'printjs'){
            text += '</code>'
          }
          appendedCloseTag = ""
      }

      if (next.blockType !== 'mark') {
        switch (next.value) {
          case '\n':
            text += '<br>'
            break
          case ' ':
            text += '&nbsp;'
            break
          case '\t':
            text += '&nbsp;&nbsp;'
            break
          case '<':
            text += '&lt;'
            break
          case '>':
            text += '&gt;'
            break
          case '\\':
            text += '&#92;'
            break
          default:
            text += next.value
        }
        currentBlockType = next.blockType
      }
      screen.innerHTML = text + appendedCloseTag
      screen.scrollTop = screen.scrollHeight
    }
    // p.handles.line = c => console.log(c)
    let terminal = null
    p.handles.chunk = (chunk,p) => {
      switch (chunk.blockType){
        case 'js':
      	  eval(chunk.value)
          break
        case 'mark':
          if (chunk.value.includes('1')){
            terminal = ReactDOM.render((
              <Terminal/>
            ), document.getElementById("termdock"))
          }
          else if (chunk.value.includes('2')){
            terminal.injectContent(el)
            let lastHeight = 0
            setInterval(()=>{
              let screenHeight = el.clientHeight
              if( screenHeight !== lastHeight) {
                screen.style.height = (screenHeight-48) + 'px' //substract padding
                screen.scrollTop = screen.scrollHeight
              }
                lastHeight = screenHeight
            },30)
          }
      }
    }
    p.parse(require('raw!../scripts/prelude.txt'))
  })
}
