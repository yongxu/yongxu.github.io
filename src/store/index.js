import 'rxjs'
import { Subject } from 'rxjs/Subject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

let state = {
  interpreterState: 'NULL',
  interpreterMode: 'NULL',
  interpreterFastForward: false
}

const reducer = (state, action) => {
  switch(action.type) {
    case 'INTERPRETER_MODE':
      return {
        ...state,
        interpreterMode: action.mode
      }
    case 'INTERPRETER_STATE':
      return {
        ...state,
        interpreterState: action.state
      }
    case 'INTERPRETER_FASTFORWARD':
      return {
        ...state,
        interpreterFastForward: action.fastForward
      }
    default:
      return state
  }
}

const action$ = new Subject().scan(reducer, state)
const store$ = new BehaviorSubject(state)
action$.subscribe(s => {
  state = s
  store$.next(s)
})

const dispatch = (action) => action$.next(action)

const store = {
  action$,
  store$,
  dispatch,
  subscribe: (...args) => store$.subscribe(...args),
  getState: () => state
}

export {store, store$, action$, dispatch}

export default store
