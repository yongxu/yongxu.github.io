import Parser from "../shunt"

export default function(){
  return new Promise(function(resolve, reject){

    let el = document.createElement('div')
    el.id = 'prelude'
    document.body.appendChild(el)

    let screen = document.createElement('div')
    el.appendChild(screen)
    let cssElem = document.createElement('style')
    document.body.appendChild(cssElem)

    let p = new Parser
    p.delay = 50
    p.onFinish = ()=>{
      resolve(p)
    }
    let text = ''
    let jsCode = ''
    let cssCode = ''
    let currentBlockType = 'text'
    let appendedCloseTag = ''
    p.handles.char = next => {

      switch (next.blockType) {
        case 'js':
          jsCode += next.value
          if (currentBlockType !== 'js'){
            text += '<code class="jscode">'
          }
          appendedCloseTag = '</code>'
          break
        case 'css':
          cssElem.innerHTML += next.value
          if (currentBlockType !== 'css'){
            text += '<code class="csscode">'
          }
          appendedCloseTag = '</code>'
          break
        default:
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
    }
    // p.handles.line = c => console.log(c)
    p.handles.chunk = (chunk,p) => {
      if (chunk.blockType === 'js')
    	 eval(chunk.value)
    }
    p.parse(require('raw!../scripts/prelude.txt'))
  })
}
