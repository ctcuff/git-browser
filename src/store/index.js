import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import modalReducer from './reducers/modal'
import userReducer from './reducers/user'
import settingsReducer from './reducers/settings'

const storeEnhancers =
  (process.env.DEBUG &&
    typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose

const reducer = combineReducers({
  modal: modalReducer,
  user: userReducer,
  settings: settingsReducer
})

const store = createStore(reducer, storeEnhancers(applyMiddleware(thunk)))

export default store
