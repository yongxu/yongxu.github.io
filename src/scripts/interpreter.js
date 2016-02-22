export const lineBreak = /\r\n?|\n|\u2028|\u2029/

export function isNewLine(code) {
  return code === 10 || code === 13 || code === 0x2028 || code == 0x2029
}

export default class Parser{
  constructor(opts = {}){

    this.text = opts.text || ''
    this.trackPosition = !!opts.trackPosition
    this.delay = opts.delay
    this.handles = Object.assign({}, opts.handles)

    if(this.trackPosition){
      this.position = 0
      this.line = 0
      this.col = 0
    }

    let i = 0
    this.TOKENS = {
      BEGIN: i++,
      WHITESPACE: i++,
      TEXT: i++,
      BLOCK_STARTED: i++,
      BLOCK_CONTROL: i++,
      BLOCK: i++,
      BLOCK_ENDING: i++,
      BLOCK_ENDED: i++,
      CONTROL_STARTING: i++,
    }

  }
  flowControl(parser){
    const {done, value} = parser.next()
    if(done){
      return //finished parsing
    }

    if(value.type in this.handles){
      this.handles[value.type](this.value)
    }

    setTimeout(this.flowControl.bind(this), this.delay, parser)
  }

  parse(text){

    if (text) {
      this.text = text
      this.i = 0
      this.s = this.TOKENS.BEGIN
    }

    let parser = this.parserGenerator()

    this.flowControl(parser,this)

  }
  *parserGenerator(){
    const p = this
    const T = p.TOKENS
    while(true){
      let c = p.text.charAt(p.i++)
      let code = c.charCodeAt()

      if (p.trackPosition) {
        p.position++
        if (c === '\n') {
          p.line++
          p.col = 0
        } else {
          p.col++
        }
      }

      switch(p.s){
        case T.BEGIN:
          if(p.chunk) yield {type:'chunk', value:p.chunk}
          p.chunk = ''
        case T.TEXT:
          if(c === '`' && p.text.substr(p.i,2) === '``'){
            p.s = BLOCK_STARTED
            p.i += 2
            break
          }
          else if (c === '@' && p.col === 1){
            p.s = CONTROL_STARTING
          }
          else{
            p.chunk += c
            yield {type:'char', value:c}
          }
      }
    }
  }
}
