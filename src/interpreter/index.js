import Parser from "parser"
import React from "react"
import ReactDOM from "react-dom"
import Terminal from "terminal"
import store, { dispatch } from '../store'


const interpreterState = (s) => {
  if (s !== store.getState().interpreterState)
    dispatch({type: 'INTERPRETER_STATE', state: s})
}
const interpreterMode = (s) => {
  if (s !== store.getState().interpreterMode)
    dispatch({type: 'INTERPRETER_MODE', mode: s})
}

const interactiveParsing = true
const textSpeed = interactiveParsing && 40
const jsSpeed = interactiveParsing && 5
const cssSpeed = interactiveParsing && 15
const htmlSpeed = interactiveParsing && 8

const imageHeight = '200px'

export default class Interpreter {
  constructor(options) {
    const commandListeners = new Map()
    this.windows = new Map()
    this.taskQueue = []
    let app = document.getElementById('app')

    let el = document.createElement('div')
    el.id = 'terminal'
    app.appendChild(el)

    let termDock = document.createElement('div')
    termDock.id = 'termdock'
    app.appendChild(termDock)

    let screen = document.createElement('div')
    screen.classList.add('screen')
    el.appendChild(screen)
    let cssElem = document.createElement('style')
    this.cssElem = cssElem
    document.body.appendChild(cssElem)

    this.windowsDiv = document.createElement('div')
    this.windowsDiv.id = 'windows'
    app.appendChild(this.windowsDiv)


    let section
    let htmlSection
    let htmlString
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
      skip: this.skip,
      fastForward: this.fastForward,
    }
    let p = new Parser
    p.delay = textSpeed
    p.handles.char = (next, parser) => {
      if (next.blockType === 'css') cssElem.innerHTML += next.value
      if (next.blockType === 'html') {
        htmlString += next.value
        htmlSection.innerHTML = htmlString
      }
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
          cssElem.innerHTML = `
          .comment {color: #bc9458; font-style: italic;}
          .jscode{color: #40d8dd; }
          .htmlcode{color: #b37775;}
          #terminal {color: #fff; background: #1b2225}
          .screen {padding: 6px 6px 24px 6px; top: 0px;}
          .csscode {color: #e6e1dc;}`
          let lastHeight = 0
          setInterval(()=>{
            screen.style.height = el.clientHeight + 'px'
          }, 30)
          terminalInjected = true
          break
        case 'createWindow':
          this.createWindow(cmd.params[0], ...cmd.params.slice(1))
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
          htmlSection = document.createElement('div')
          htmlString = ''
          if (block.params.length) {
            document.querySelector(block.params[0]).appendChild(htmlSection)
          } else {
            screen.appendChild(htmlSection)
          }
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
          // text += '<div>' + block.value + '</div>'
          // section.innerHTML = text
          screen.scrollTop = screen.scrollHeight
      }
      this.clearTask()
    }

    p.handles.terminate = (state, p) => {
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
        interpreterState('FINISHED')
      }
      interpreterState('PARSING')
      interpreterMode('NORMAL')
      this.parser.parse(script)
    })
  }

  createWindow(id, style) {
    let windowDiv = document.createElement('div')
    this.windowsDiv.appendChild(windowDiv)
    windowDiv.id = id
    const closeWindow = () => {
      this.windows.delete(id)
      ReactDOM.unmountComponentAtNode(windowDiv)
      windowDiv.remove()
    }

    return new Promise((resolve) => {
      ReactDOM.render((
        <Terminal
          title={id}
          onClose={closeWindow}
          onMounted={(terminal) => {
            this.windows.set(id, {terminal, closeWindow})
            resolve(terminal)
          }}
          style={style}/>
      ), windowDiv)
    })
  }

  getWindow(id) {
    return this.windows.get(id).win
  }

  closeWindow(id) {
    return this.windows.get(id).closeWindow()
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
    interpreterMode('TERMINATED')
  }

  pause = () => {
    interpreterState('PAUSED')
    this.parser.pause = true
    if (this.parser.fastForward) {
      this.parser.fastForward = false
      dispatch({type: 'INTERPRETER_FASTFORWARD', fastForward: false})
      interpreterMode('NORMAL')
    }
  }

  resume = () => {
    if (this.parser.pause) {
      this.parser.resume()
      interpreterState('PARSING')
      interpreterMode('NORMAL')
    }
  }

  fastForward = (fastForward) => {
    if (typeof fastForward === 'undefined')
      fastForward = ! this.parser.fastForward
    this.parser.pause && this.parser.resume()
    this.parser.fastForward = fastForward
    dispatch({type: 'INTERPRETER_FASTFORWARD', fastForward})
    interpreterMode('FASTFOWARD')
    interpreterState('PAUSING')
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

  addCommandListener(cmd, f) {
    this.commandListeners.set(cmd, f)
  }
  removeCommandListener(cmd) {
    this.commandListeners.delete(cmd)
  }
}
