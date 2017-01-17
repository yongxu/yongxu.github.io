import Parser from "parser"
import React from "react"
import ReactDOM from "react-dom"
import Terminal from "terminal"

const interactiveParsing = true
const textSpeed = interactiveParsing && 40
const jsSpeed = interactiveParsing && 5
const cssSpeed = interactiveParsing && 15
const htmlSpeed = interactiveParsing && 8

const imageHeight = '200px'

export default class Interpreter {
  constructor(options) {
    const commandListeners = new Map()
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

    this.ctx = {
      terminate: this.terminate,
      pause: this.pause,
      resume: this.resume,
      rerun: this.rerun,
      skip: this.skip,
      fastForward: this.fastForward,
      reset: this.reset
    }
    let p = new Parser
    p.delay = textSpeed
    let text = ''
    let jsCode = ''
    let currentBlockType = 'text'
    let appendedCloseTag = ''
    p.handles.char = (next, parser) => {
      if(currentBlockType !== next.blockType){
        if (currentBlockType === 'js'
          || currentBlockType === 'css'
          || currentBlockType === 'html'
          || currentBlockType === 'printjs') {
            text += '</code>'
          }
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
          parser.delay = textSpeed
          appendedCloseTag = ""
          break
        default:
          parser.delay = textSpeed
          break
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
          var ctx = this.ctx //use var to avoid babel transform
          var context = this.ctx
      	  eval(chunk.value)
          break
        case 'html':
          text += '<div>' + chunk.value + '</div>'
          screen.innerHTML = text
          screen.scrollTop = screen.scrollHeight
      }
    }

    p.handles.line = (line, p) => {
      switch (line.blockType){
        case 'js':
        case 'printjs':
          break
        case 'css':
          p.delay = 400
          break
        case 'text':
          p.delay = 300
          break
        default:
          p.delay = 100
      }
    }

    let terminalInjected = false
    p.handles.command = (cmd, p) => {
      switch(cmd.command) {
        case 'initTerminal':
          if (terminal) break
          terminal = ReactDOM.render((
            <Terminal/>
          ), document.getElementById("termdock"))
          this.terminal = terminal
          break
        case 'injectContent':
          if (terminalInjected) break
          terminal.injectContent(el)
          let lastHeight = 0
          setInterval(()=>{
            screen.style.height = el.clientHeight + 'px'
          }, 30)
          terminalInjected = true
          break
        case 'image':
          text += `<img height=${imageHeight} src='${'assets/' + cmd.params[0]}'/><br>`
          screen.innerHTML = text
          break
        case 'print':
          text += appendedCloseTag + cmd.params[0]
          appendedCloseTag = ''
          screen.innerHTML = text
          break
        default:
          //command with param
          if (commandListeners.has(cmd.command))
            commandListeners.get(cmd.command)(cmd.command, cmd.param, p)
      }
      screen.scrollTop = screen.scrollHeight
    }

    p.handles.blockStarted = (block, p) => {
      switch(block.blockType) {
        case 'span':
          text += `<span class="${block.params[0]}">`
          appendedCloseTag = '</code>'
          break
      }
      screen.innerHTML = text
      screen.scrollTop = screen.scrollHeight
    }

    p.handles.blockEnded = (block, p) => {
      switch(block.blockType) {
        case 'span':
          text += '</span>'
          break
      }
      screen.innerHTML = text
      screen.scrollTop = screen.scrollHeight
    }

    p.handles.terminate = (state, p) => {
      this.parser.onFinish(p)
    }

    // TODO: not working
    // p.handles.reset = (state, p) => {
    //   text = ''
    //   jsCode = ''
    //   screen.innerHTML = text
    //   cssElem.innerHTML = ''
    //   currentBlockType = 'text'
    //   appendedCloseTag = ''
    //   this.parser.parse(this.script)
    // }

    this.parser = p
    this.commandListeners = commandListeners
  }

  run(script) {
    this.script = script
    return new Promise((resolve, reject) => {
      this.parser.onFinish = () => {
        resolve(this)
      }
      this.parser.parse(script)
    })
  }

  injectContext(context) {
    this.ctx = {
      ...this.ctx,
      ...context
    }
  }

  terminate = () => {
    this.parser.terminate = true
  }

  pause = () => {
    this.parser.pause = true
  }

  resume = () => {
    this.parser.pause && this.parser.resume()
  }

  rerun = () => {
    this.reset()
  }

  fastForward = () => {
    this.parser.fastForward = true
  }

  skip = () => {
    this.parser.addYieldEvent({
      type: 'command',
      command: 'initTerminal'
    })
    this.parser.addYieldEvent({
      type: 'command',
      command: 'injectContent'
    })
    this.parser.addYieldEvent({
      type: 'command',
      command: 'print',
      params: [`\n<br/>skipped!\n<br/>`]
    })
    this.parser.addYieldEvent('terminate')
  }

  reset = () => {
    this.parser.addYieldEvent('reset')
  }

  addCommandListener(cmd, f) {
    this.commandListeners.set(cmd, f)
  }
  removeCommandListener(cmd) {
    this.commandListeners.delete(cmd)
  }
}
