export const lineBreak = /\r\n?|\n|\u2028|\u2029/
const flatten = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])

let i = 0
export const TOKENS = {
  TEXT: i++,
  BLOCK_STARTED: i++,
  BLOCK: i++,
  BLOCK_ENDING: i++,
  READ_NEXT: i++
}
export default class Parser {
  constructor(opts = {}) {
    this.text = opts.text || ''
    this.delay = opts.delay
    this.handles = Object.assign({}, opts.handles)
    this.commandChar = opts.commandChar || '@'
  }

  flowControl = (parser) => {
    const {
      done,
      value
    } = parser.next()

    if (done) return //finished parsing
    //
    // if (value.type !== 'char') {
    //   console.log(value)
    // }

    if (value.type === 'terminate') {
      if (this.s === TOKENS.BLOCK && 'blockEnded' in this.handles) {
        this.handles.blockEnded({
          type: 'blockEnded',
          blockType: this.blockType,
          value: null
        }, this)
        this.blockType = 'text'
      }
      if ('terminate' in this.handles) this.handles.terminate(value, this)

      return
    }

    if (value.type in this.handles) {
      this.handles[value.type](value, this)
    }

    if (this.pause) {
      this.resume = () => {
        this.pause = false
        this.flowControl(parser)
      }
      return
    }
    if (this.fastForward) setTimeout(this.flowControl, 0, parser)
    else if (this.waitTime) {
      setTimeout(this.flowControl, this.waitTime, parser)
      this.waitTime = null
    } else if (this.delay && value.type === 'char') setTimeout(this.flowControl, this.delay, parser)
    else this.flowControl(parser)
  }

  parse(text) {

    if (text) {
      this.text = text // the text that waiting to be parsed
    }

    this.i = 0 // next char to be parsed index position
    this.s = TOKENS.READ_NEXT // current parser state
    this.finished = false
    this.blockType = 'text'
    this.position = 0
    this.lineNum = 0
    this.col = 0
    this.fastForward = false

    let parser = this.parserGenerator()

    this.flowControl(parser)

  }

  addYieldEvent(e) {
    if (this.yieldEvent) {
      this.yieldEvent.push(typeof e === 'object' ? e : {type: e})
    }
  }

  * emitChunk() {
    if (this.chunk) {
      yield {
        type: 'chunk',
        blockType: this.blockType,
        value: this.chunk
      }
      this.chunk = ''
    }
  }

  * emitLine() {
    if (this.line) {
      yield {
        type: 'line',
        blockType: this.blockType,
        value: this.line
      }
      this.line = ''
    }
  }

  * parserGenerator() {
    const p = this
    const T = TOKENS
    p.chunk = ''
    p.line = ''
    p.terminate = false
    p.yieldEvent = []
    let c
    while (true) {
      let pervState = p.s
      if (p.terminate) {
        p.terminate = false
        return {
          type: 'terminate'
        }
      }
      if (p.yieldEvent.length) {
        while (p.yieldEvent.length) {
          yield p.yieldEvent.shift()
        }
      }
      switch (p.s) {
        case T.TEXT:
        case T.READ_NEXT:
        case T.BLOCK:
          c = p.text.charAt(p.i++)
          if (c === '') {
            yield * p.emitLine()
            p.finished = true
            p.fastForward = false
            if (p.s === T.TEXT) {
              yield {
                type: 'textEnded',
                blockType: p.blockType,
                value: p.chunk
              }
            }
            else if (p.s === T.BLOCK) {
              yield {
                type: 'blockEnded',
                blockType: p.blockType,
                params: p.params,
                value: p.chunk
              }
            }
            yield * p.emitChunk()
            if (p.onFinish) p.onFinish(p)
            return
          }
          if (c === '`' && p.text[p.i] === '`' && p.text[p.i+1] === '`') {
            p.s = p.s === T.BLOCK ? T.BLOCK_ENDING : T.BLOCK_STARTED
            p.i += 2
          } else if (c === p.commandChar){
            let command = ''
            while (p.text[p.i] && p.text.charAt(p.i) !== p.commandChar) {
              command += p.text.charAt(p.i++)
            }
            p.i++ //eat command char
            if (p.text[p.i].match(lineBreak)) p.i++ //eat if it is lineBreak
            const [cmdHead, ...params] = command.split(':')
            yield {
              type: 'command',
              command: cmdHead.trim(),
              raw: command,
              params: flatten(params.map(p => p.split(','))).map(p => p.trim())
            }
          } else {
            p.chunk += c
            if (p.s === T.READ_NEXT && p.s !== T.BLOCK) {
              p.s = T.TEXT
              yield {
                type: 'textStarted',
                value: null
              }
            }
            yield {
              type: 'char',
              blockType: p.blockType,
              value: c
            }
            if (c.match(lineBreak)) {
              p.lineNum++
              p.col = 0
              yield * p.emitLine()
            } else {
              p.line += c
              p.col ++
            }
          }
          break
        case T.BLOCK_STARTED:
          if (p.pervState === T.TEXT) {
            yield {
              type: 'textEnded',
              value: p.chunk
            }
            yield * p.emitChunk()
          }
          let blockType = ''
          while (p.text[p.i] && !p.text.charAt(p.i).match(lineBreak)) {
            blockType += p.text.charAt(p.i++)
          }
          if (p.text[p.i].match(lineBreak)) p.i++ //eat line break
          const [blockHead, ...params] = blockType.split(':')
          p.blockType = blockHead && blockHead.trim() || 'unknown'
          p.params = params
          yield {
            type: 'blockStarted',
            blockType: p.blockType,
            params: flatten(params.map(p => p.split(','))).map(p => p.trim()),
            value: null
          }
          p.s = T.BLOCK
          break
        case T.BLOCK_ENDING:
          if (p.text[p.i].match(lineBreak)) p.i++
          yield {
            type: 'blockEnded',
            blockType: p.blockType,
            params: p.params,
            value: p.chunk
          }
          yield * p.emitChunk()
          p.params = null
          p.blockType = 'text'
          p.s = T.READ_NEXT
          break
        default:
          throw new Error('Unknown State!')
      }
      p.pervState = pervState

      //position tracking
      p.position = p.i
    }
  }

  wait(time) {
    this.waitTime = time
  }
}
