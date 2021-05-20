import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import modalReducer from './reducers/modal'
import userReducer from './reducers/user'
import settingsReducer from './reducers/settings'
import searchReducer from './reducers/search'

const storeEnhancers =
  (process.env.DEBUG &&
    typeof window !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose

const reducer = combineReducers({
  modal: modalReducer,
  user: userReducer,
  settings: settingsReducer,
  search: searchReducer
})

const store = createStore(reducer, storeEnhancers(applyMiddleware(thunk)))

export default store
export type State = ReturnType<typeof store.getState>
