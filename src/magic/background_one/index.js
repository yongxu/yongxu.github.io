require('./style.scss')

export default function addBackground(div) {
  div.classList.add('background_one')
  const c1 = document.createElement('canvas')
  c1.style.opacity = 0
  const	c2 = document.createElement('canvas')
  div.appendChild(c1)
  div.appendChild(c2)
  const ctx1 = c1.getContext( '2d' )
  const ctx2 = c2.getContext( '2d' )
  const parts = []
  let sizeBase,	cw, ch,	opt, hue, count
  let runLoop = true

  function rand( min, max ) {
  	return Math.random() * ( max - min ) + min
  }

  function hsla( h, s, l, a ) {
  	return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')'
  }

  function resize() {
    cw = c1.width = c2.width = div.clientWidth
    ch = c1.height = c2.height = div.clientHeight
  }

  function reset() {
    resize()
  	sizeBase = cw + ch
  	count = Math.floor( sizeBase * 0.3 )
  	hue = rand( 0, 360 )
  	opt = {
  		radiusMin: 1,
  		radiusMax: sizeBase * 0.04,
  		blurMin: 10,
  		blurMax: sizeBase * 0.04,
  		hueMin: hue,
  		hueMax: hue + 100,
  		saturationMin: 10,
  		saturationMax: 70,
  		lightnessMin: 20,
  		lightnessMax: 50,
  		alphaMin: 0.1,
  		alphaMax: 0.5
  	}
  	ctx1.clearRect( 0, 0, cw, ch )
  	ctx1.globalCompositeOperation = 'lighter'
  	while( count-- ) {
  		const hue = rand(opt.hueMin, opt.hueMax ),
  			saturation = rand( opt.saturationMin, opt.saturationMax ),
  			lightness = rand(  opt.lightnessMin, opt.lightnessMax ),
  			alpha = rand( opt.alphaMin, opt.alphaMax )

  		ctx1.shadowColor = hsla( hue, saturation, lightness, alpha )
  		ctx1.shadowBlur = rand( opt.blurMin, opt.blurMax )
  		ctx1.beginPath()
  		ctx1.arc( rand( 0, cw ), rand( 0, ch ), rand( opt.radiusMin, opt.radiusMax ), 0, Math.PI * 2 )
  		ctx1.closePath()
  		ctx1.fill()
  	}

  	parts.length = 0
  	for( let i = 0; i < Math.floor( ( cw + ch ) * 0.03 ); i++ ) {
  		parts.push({
  			radius: rand( 1, sizeBase * 0.03 ),
  			x: rand( 0, cw ),
  			y: rand( 0, ch ),
  			angle: rand( 0, Math.PI * 2 ),
  			vel: rand( 0.1, 0.5 ),
  			tick: rand( 0, 10000 )
  		})
  	}
  }

  function loop() {
  	if (runLoop) requestAnimationFrame( loop )
    else return

  	ctx2.clearRect( 0, 0, cw, ch )
  	ctx2.globalCompositeOperation = 'source-over'
  	ctx2.shadowBlur = 0
  	ctx2.drawImage( c1, 0, 0 )
  	ctx2.globalCompositeOperation = 'lighter'

  	var i = parts.length
  	ctx2.shadowBlur = 15
  	ctx2.shadowColor = '#fff'
  	while( i-- ) {
  		var part = parts[ i ];

  		part.x += Math.cos( part.angle ) * part.vel
  		part.y += Math.sin( part.angle ) * part.vel
  		part.angle += rand( -0.05, 0.05 )

  		ctx2.beginPath()
  		ctx2.arc( part.x, part.y, part.radius, 0, Math.PI * 2 )
  		ctx2.fillStyle = hsla( 0, 0, 100, 0.075 + Math.cos( part.tick * 0.02 ) * 0.05 )
  		ctx2.fill()

  		if( part.x - part.radius > cw ) { part.x = -part.radius }
  		if( part.x + part.radius < 0 )  { part.x = cw + part.radius }
  		if( part.y - part.radius > ch ) { part.y = -part.radius }
  		if( part.y + part.radius < 0 )  { part.y = ch + part.radius }

  		part.tick++
  	}
  }

  function stop() {
    runLoop = false
  }

  function start() {
    runLoop = true
    requestAnimationFrame(loop)
  }

  reset()
  loop()

  return {
    div,
    resize,
    reset,
    start,
    stop
  }
}
