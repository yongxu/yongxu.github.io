import Parser from "../shunt"

const textSpeed = 40
const jsSpeed = 10
const cssSpeed = 5
export default function(){
  return new Promise(function(resolve, reject){

    let el = document.createElement('div')
    el.id = 'prelude'
    document.body.appendChild(el)

    let screen = document.createElement('div')
    screen.classList.add('screen')
    el.appendChild(screen)
    let cssElem = document.createElement('style')
    document.body.appendChild(cssElem)

    let p = new Parser
    p.delay = textSpeed
    p.onFinish = ()=>{
      resolve(p)
    }
    let text = ''
    let jsCode = ''
    let cssCode = ''
    let currentBlockType = 'text'
    let appendedCloseTag = ''
    p.handles.char = (next, parser) => {

      switch (next.blockType) {
        case 'js':
          parser.delay = jsSpeed
          jsCode += next.value
          if (currentBlockType !== 'js'){
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
        default:
          parser.delay = textSpeed
          if(currentBlockType === 'js' || currentBlockType === 'css'){
            text += '</code>'
          }
          appendedCloseTag = ""
      }

      switch (next.value) {
        case '\n':
          text += '<br>'
          break
        case ' ':
          text += '&nbsp'
          break
        case '\t':
          text += '&nbsp&nbsp'
        default:
          text += next.value
      }
      currentBlockType = next.blockType
      screen.innerHTML = text + appendedCloseTag
      screen.scrollTop = screen.scrollHeight
    }
    // p.handles.line = c => console.log(c)
    p.handles.chunk = (chunk,p) => {
      if (chunk.blockType === 'js')
    	 eval(chunk.value)
    }
    p.parse(require('raw!../scripts/prelude.txt'))
  })
}
