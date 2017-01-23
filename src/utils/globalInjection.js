import Interpreter from '../interpreter'
import Rx from 'rxjs'
import store from '../store'

const interpreter = new Interpreter

// globals
window.interpreter = interpreter
window.Rx = Rx
window.store = store

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

window.camelize = camelize
