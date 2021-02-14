import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

// Allows Logger messages to show during tests
process.env.DEBUG = 'true'

configure({ adapter: new Adapter() })
