import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import modalReducer from 'src/store/reducers/modal'
import userReducer from 'src/store/reducers/user'
import settingsReducer from 'src/store/reducers/settings'

const createTestStore = () => {
  const reducer = combineReducers({
    modal: modalReducer,
    user: userReducer,
    settings: settingsReducer
  })

  return createStore(reducer, compose(applyMiddleware(thunk)))
}

export default createTestStore
