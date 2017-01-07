import Parser from "parser"
import React from "react"
import ReactDOM from "react-dom"
import Terminal from "terminal"

const interactiveParsing = true
const textSpeed = interactiveParsing && 40
const jsSpeed = interactiveParsing && 10
const cssSpeed = interactiveParsing && 5
const htmlSpeed = interactiveParsing && 8

const imageWidth = '200px';
const imageHeight = '200px';

export default class Interpreter {
  constructor(options) {
    const commandListeners = new Map();
    let app = document.getElementById('app')

    let el = document.createElement('div')
    el.id = 'terminal'
    app.appendChild(el)

    let termDock = document.createElement('div')
    termDock.id = 'termdock'
    app.appendChild(termDock)

    let underlay = document.createElement('div')
    underlay.classList.add('underlay')
    el.appendChild(underlay)

    let screen = document.createElement('div')
    screen.classList.add('screen')
    let overlay = document.createElement('div')
    overlay.classList.add('overlay')
    screen.appendChild(overlay)
    el.appendChild(screen)
    let cssElem = document.createElement('style')
    document.body.appendChild(cssElem)

    let p = new Parser
    p.delay = textSpeed
    let text = ''
    let jsCode = ''
    let cssCode = ''
    let currentBlockType = 'text'
    let appendedCloseTag = ''
    p.handles.char = (next, parser) => {
      if(currentBlockType !== next.blockType &&
          (currentBlockType !== 'text'
        || currentBlockType === 'js'
        || currentBlockType === 'css'
        || currentBlockType === 'html'
        || currentBlockType === 'printjs')){
        text += '</code>'
      }
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
        case 'html':
          parser.delay = htmlSpeed
          if (currentBlockType !== 'html'){
            text += '<code class="htmlcode">'
          }
          appendedCloseTag = '</code>'
          break

        //pass through
        case 'mark':
        case 'text':
        default:
          parser.delay = textSpeed
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
      }
      currentBlockType = next.blockType
      screen.innerHTML = text + appendedCloseTag
      screen.scrollTop = screen.scrollHeight
    }
    // p.handles.line = c => console.log(c)
    let terminal = null
    p.handles.chunk = (chunk, p) => {
      switch (chunk.blockType){
        case 'js':
          var ctx = this.ctx //use var to avoid babel
          var context = this.ctx
      	  eval(chunk.value)
          break
        case 'html':
          text += '<div>' + chunk.value + '</div>'
          screen.innerHTML = text
          screen.scrollTop = screen.scrollHeight
      }
    }
    p.handles.command = (cmd, p) => {
      switch(cmd.value) {
        case 'initTerminal':
          terminal = ReactDOM.render((
            <Terminal/>
          ), document.getElementById("termdock"))
          this.terminal = terminal
          break
        case 'injectContent':
          terminal.injectContent(el)
          let lastHeight = 0
          setInterval(()=>{
            screen.style.height = el.clientHeight + 'px'
          }, 30)
          break
        default:
          //command with param
          const [cmdHead, param] = cmd.value.split(':')
          switch(cmdHead) {
            case 'image':
              text += `<img width=${imageWidth} height=${imageHeight} src='${'assets/' + param}'/><br>`
              screen.innerHTML = text
              break
            default:
              if (commandListeners.has(cmdHead))
                commandListeners.get(cmdHead)(cmdHead, param, p)
          }
      }
      screen.scrollTop = screen.scrollHeight
    }

    this.parser = p
    this.commandListeners = commandListeners
  }

  run(script) {
    return new Promise((resolve, reject) => {
      this.parser.onFinish = ()=>{
        resolve(this)
      }
      this.parser.parse(script)
    })
  }

  injectContext(context) {
    this.ctx = context
  }

  addCommandListener(cmd, f) {
    this.commandListeners.set(cmd, f)
  }
  removeCommandListener(cmd) {
    this.commandListeners.delete(cmd)
  }
}
