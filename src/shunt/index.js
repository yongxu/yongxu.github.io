export const lineBreak = /\r\n?|\n|\u2028|\u2029/

export default class Parser {
  constructor(opts = {}) {

    this.text = opts.text || ''
    this.delay = opts.delay
    this.handles = Object.assign({}, opts.handles)
    this.blockType = 'text'
    this.position = 0
    this.lineNum = 0
    this.col = 0

    let i = 0
    this.TOKENS = {
      TEXT: i++,
      BLOCK_STARTED: i++,
      BLOCK: i++,
      BLOCK_ENDING: i++,
      CONTROL_STARTING: i++,
    }

  }

  flowControl(parser) {
    const {
      done,
      value
    } = parser.next()
    if (done) {
      return //finished parsing
    }

    if (value.type in this.handles) {
      this.handles[value.type](value, this)
    }
    setTimeout(this.flowControl.bind(this), this.delay, parser)
  }

  parse(text) {

    if (text) {
      this.text = text
      this.i = 0
      this.s = this.TOKENS.TEXT
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
    const T = p.TOKENS
    p.chunk = ''
    p.line = ''
    while (true) {
      let c = p.text.charAt(p.i++)
      if (c === '') {
        yield * p.emitLine()
        yield * p.emitChunk()
        if (p.onFinish) p.onFinish(p)
        return
      }

      //position tracking
      p.position++
        if (c === '\n') {
          p.lineNum++
            p.col = 0
        } else {
          p.col++
        }

      let pervState = p.s
      switch (p.s) {
        case T.BLOCK:
        case T.TEXT:
          if (c === '`' && p.text.substr(p.i, 2) === '``') {
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
              yield * p.emitLine()
            } else {
              p.line += c
            }
          }
          break
        case T.BLOCK_STARTED:
          yield * p.emitChunk()
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
      }
      p.pervState = pervState
    }
  }
}
