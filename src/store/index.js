import { createStore, combineReducers } from 'redux'
import editorReducer from './reducers/editor'

const reducer = combineReducers({
  editor: editorReducer
})

const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__({ trace: true, traceLimit: 25 })
)

export default store
