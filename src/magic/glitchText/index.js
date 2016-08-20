require('./index.scss')
import {
  randomList,
  nonLinearInterpellationGenerator
} from 'utils/random'

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

    this.rOffset = document.getElementById('r-offset')
    this.gOffset = document.getElementById('g-offset')
    this.bOffset = document.getElementById('b-offset')

    this.motionStarted = false
}

  dr = (x, y) => {
    this.rOffset.setAttributeNS(null, "dx", x);
    this.rOffset.setAttributeNS(null, "dy", y);
  }

  dg = (x, y) => {
    this.gOffset.setAttributeNS(null, "dx", x);
    this.gOffset.setAttributeNS(null, "dy", y);
  }

  db = (x, y) => {
    this.bOffset.setAttributeNS(null, "dx", x);
    this.bOffset.setAttributeNS(null, "dy", y);
  }

  startMotion = (rFx, rFy, gFx, gFy, bFx, bFy) => {
    let start = 0
    const step = (timestamp) => {
      if (!start) start = timestamp
      const t_sec = (timestamp - start) / 1000.0
      const r_dx = rFx ? rFx(t_sec) : 0
      const r_dy = rFy ? rFy(t_sec) : 0
      const g_dx = gFx ? gFx(t_sec) : 0
      const g_dy = gFy ? gFy(t_sec) : 0
      const b_dx = bFx ? bFx(t_sec) : 0
      const b_dy = bFy ? bFy(t_sec) : 0
      this.dr(r_dx, r_dy)
      this.dg(g_dx, g_dy)
      this.db(b_dx, b_dy)

      if (this.motionStarted) window.requestAnimationFrame(step)
    }
    this.motionStarted = true
    this.start = 0
    window.requestAnimationFrame(step)
  }

  startRandomMotion = () => {
    const randomListLength = 10
    const speed = 5
    const rxf = nonLinearInterpellationGenerator(randomList(randomListLength, -0.0, 7.0, 1), speed)
    const ryf = nonLinearInterpellationGenerator(randomList(randomListLength, -3.0, 3.0, 1), speed)
    const gxf = nonLinearInterpellationGenerator(randomList(randomListLength, -3.0, 3.0, 1), speed)
    const gyf = nonLinearInterpellationGenerator(randomList(randomListLength, -3.0, 3.0, 1), speed)
    const bxf = nonLinearInterpellationGenerator(randomList(randomListLength, -7.0, 0.0, 1), speed)
    const byf = nonLinearInterpellationGenerator(randomList(randomListLength, -3.0, 3.0, 1), speed)

    this.startMotion(rxf, ryf, gxf, gyf, bxf, byf)
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
