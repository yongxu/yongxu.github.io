export function mod(x, y) {
  return x - y * Math.floor(x / y)
}

export function randomList(length, min = -1.0, max = 1.0, dim = 2) {
  const list = []
  for (let i = 0; i< length; i++) {
    if (dim === 1) {
      list.push(Math.random() * (max - min) + min)
      continue
    }
    const vec = []
    for (let j = 0; j< dim; j++) {
      vec.push(Math.random() * (max - min) + min)
    }
    list.push(vec)
  }
  return list
}

export function nonLinearInterpellationGenerator(list, speed) {
  const len = list.length
  const p = speed
  const dim = Array.isArray(list[0]) ? list[0].length : 1
  return (t) => {
    const i = t * p
    const f = Math.floor(i)
    const c = Math.ceil(i)
    if (f === c) return list[i]
    else {
      const v1 = list[mod(f, len)]
      const v2 = list[mod(c, len)]
      if (dim === 1) return v1 * (c - i) + v2 * (i - f)
      const vec = []
      for ( let k = 0; k < dim; k++) {
        vec.push(v1[k] * (c - i) + v2[k] * (i - f))
      }
      return vec
    }
  }
}
