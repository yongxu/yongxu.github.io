require('./index.scss')

export default class GlitchText {
  constructor(parent) {
    this.text = document.createElement('div')
    this.text.id = 'glitchText'

    this.container = document.createElement('div')
    this.container.innerHTML = require('raw!./filter.svg')
    this.container.appendChild(this.text)
    this.txt = ''

    this.parent = parent
    parent.appendChild(this.container)
  }
  applyText(txt) {
    this.txt = txt
    this.text.innerHTML = this.txt;
    this.text.setAttribute('data-text', txt)
  }

  appendText(txt) {
    this.txt = this.txt + txt
    this.text.innerHTML = this.txt;
    this.text.setAttribute('data-text', this.txt)
  }
}
