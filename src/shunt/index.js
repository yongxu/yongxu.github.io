export const lineBreak = /\r\n?|\n|\u2028|\u2029/


let i = 0
export const TOKENS = {
  TEXT: i++,
  BLOCK_STARTED: i++,
  BLOCK: i++,
  BLOCK_ENDING: i++,
  CONTROL_STARTING: i++,
}
export default class Parser {
  constructor(opts = {}) {

    this.text = opts.text || ''
    this.delay = opts.delay
    this.handles = Object.assign({}, opts.handles)
    this.blockType = 'text'
    this.position = 0
    this.lineNum = 0
    this.col = 0
  }

  flowControl = (parser) => {
    const {
      done,
      value
    } = parser.next()

    if (done) return //finished parsing

    if (value.type in this.handles) {
      this.handles[value.type](value, this)
    }

    if(this.delay) setTimeout(this.flowControl, this.delay, parser)
    else this.flowControl(parser)

  }

  parse(text) {

    if (text) {
      this.text = text // the text that waiting to be parsed
      this.i = 0 // next char to be parsed index position
      this.s = TOKENS.TEXT // current parser state
      this.finished = false
    }

    let parser = this.parserGenerator()

    this.flowControl(parser)

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
    if (this.chunk) {
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
    while (true) {
      let c = p.text.charAt(p.i++)
      if (c === '') {
        yield * p.emitLine()
        yield * p.emitChunk()
        p.finished = true
        if (p.onFinish) p.onFinish(p)
        return
      }

      let pervState = p.s
      switch (p.s) {
        case T.BLOCK:
        case T.TEXT:
          if (c === '`' && p.text[p.i] === '`' && p.text[p.i+1] === '`') {
            p.s = p.s === T.BLOCK ? T.BLOCK_ENDING : T.BLOCK_STARTED
            p.i += 2
          }
          // else if (c === '@' && p.col === 1){
          //   p.s = T.CONTROL_STARTING
          // }
          else {
            p.chunk += c
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
          if (p.pervState === T.TEXT) yield * p.emitChunk()
          let blockType = ''
          --p.i //move backward 1
          while (p.text[p.i] && !p.text.charAt(p.i).match(lineBreak)) {
            blockType += p.text.charAt(p.i++)
          }
          p.i++ //eat line break
          p.blockType = blockType || 'unknown'
          yield {
            type: 'blockStarted',
            blockType: p.blockType,
            value: null
          }
          p.s = T.BLOCK
          break
        case T.BLOCK_ENDING:
          yield * p.emitChunk()
          yield {
            type: 'blockEnded',
            blockType: p.blockType,
            value: null
          }
          p.blockType = 'text'
          p.s = T.TEXT
          break
        default:
          throw new Error('Unknown State!')
      }
      p.pervState = pervState

      //position tracking
      p.position = p.i
    }
  }
}
