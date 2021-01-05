import { createStore, combineReducers } from 'redux'
import modalReducer from './reducers/modal'

const reducer = combineReducers({
  modal: modalReducer
})

const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__({ trace: true, traceLimit: 25 })
)

export default store
