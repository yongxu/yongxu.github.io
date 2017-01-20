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
    this.taskQueue = []
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
    el.appendChild(screen)
    el.appendChild(overlay)
    let cssElem = document.createElement('style')
    document.body.appendChild(cssElem)

    let section
    let text = ''
    let currentBlockType = 'text'
    const cursor = '<span class="parsingCursor"></span>'

    function newSection(eleType, ...classNames) {
      if (text && section) {
        section.innerHTML = text
        text = ''
      }
      section = document.createElement(eleType)
      if (classNames.length) section.classList.add(...classNames)
      screen.appendChild(section)
    }

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
    p.handles.char = (next, parser) => {
      if (next.blockType === 'css') cssElem.innerHTML += next.value
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
      section.innerHTML = text + cursor
      screen.scrollTop = screen.scrollHeight
    }
    // p.handles.line = c => console.log(c)
    let terminal = null
    p.handles.chunk = (chunk, p) => {
    }

    p.handles.line = (line, p) => {
      switch (line.blockType){
        case 'css':
          p.wait(400)
          break
        case 'text':
          p.wait(300)
          break
        default:
          p.wait(100)
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
          section.innerHTML = text
          break
        case 'print':
          text += cmd.raw ? cmd.raw.substr(6) : cmd.params[0]
          section.innerHTML = text
          break
        default:
          //command with param
          if (commandListeners.has(cmd.command))
            commandListeners.get(cmd.command)(cmd.command, cmd.param, p)
      }
      screen.scrollTop = screen.scrollHeight
    }
    p.handles.textStarted = (_, p) => {
      p.delay = textSpeed
      newSection('div')
      screen.scrollTop = screen.scrollHeight
    }
    p.handles.blockStarted = (block, p) => {
      switch (block.blockType) {
        case 'span':
          p.delay = textSpeed
          newSection('span', block.params[0])
          break
        case 'js':
        case 'printjs':
          p.delay = jsSpeed
          newSection('code', 'jscode')
          break
        case 'css':
          p.delay = cssSpeed
          newSection('code', 'csscode')
          break
        case 'html':
          p.delay = htmlSpeed
          newSection('code', 'htmlcode')
          break
        case 'text':
          p.delay = textSpeed
          newSection('div')
          break
        default:
          p.delay = textSpeed
          break
      }
      screen.scrollTop = screen.scrollHeight
    }

    p.handles.textEnded = (block, p) => {
      this.clearTask()
    }

    p.handles.blockEnded = (block, p) => {
      switch (block.blockType){
        case 'js':
          var ctx = this.ctx //use var to avoid babel transform
          var context = this.ctx
      	  eval(block.value)
          break
        case 'html':
          text += '<div>' + block.value + '</div>'
          section.innerHTML = text
          screen.scrollTop = screen.scrollHeight
      }
      this.clearTask()
    }

    p.handles.terminate = (state, p) => {
      cssElem.innerHTML = `
      .screen {padding: 24px 12px;}
      .comment {color: #bc9458; font-style: italic;}
      .jscode{color: #40d8dd; }
      #terminal {color: #eee; background: #000}
      .csscode {color: #e6e1dc;}`
      this.clearTask()
      this.parser.onFinish(p)
    }

    // TODO: not working
    // p.handles.reset = (state, p) => {
    //   text = ''
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

  addTask(task) {
    this.taskQueue.push(task)
  }

  clearTask() {
    while (this.taskQueue.length) {
      const nextTask = this.taskQueue.unshift()
      nextTask(this, this.parser)
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
    this.parser.pause && this.parser.resume()
    this.parser.fastForward = true
  }

  skip = () => {
    this.parser.pause && this.parser.resume()
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
      params: [`<br><span class='skippedIntro'>\nIntroduction skipped!</span><br>\n`]
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
