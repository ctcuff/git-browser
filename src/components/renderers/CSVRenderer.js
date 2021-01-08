import '../../style/csv-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import { AiOutlineSearch } from 'react-icons/ai'
import debounce from 'lodash/debounce'
import Logger from '../../scripts/logger'

// The max number of rows that can be displayed before truncation
const MAX_ROW_COUNT = 500
// Occurs when the CSV file has an error. This usually isn't severe
// enough to stop the table from rendering
const PARSE_ERROR = 'PARSE_ERROR'
// Occurs when we reach the max row count
const MAX_ROW_ERROR = 'MAX_ROW_ERROR'
// Occurs if there was an error importing papaparse library
const LIBRARY_IMPORT_ERROR = 'LIBRARY_IMPORT_ERROR'

class CSVRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      errors: new Set(),
      currentStep: 'Loading...',
      inputValue: '',
      tableHeaders: [],
      tableRows: [
        {
          rowArray: [],
          display: ''
        }
      ]
    }

    this.onChange = this.onChange.bind(this)
    this.renderTable = this.renderTable.bind(this)
    this.loadPreview = this.loadPreview.bind(this)
    this.parseCSV = this.parseCSV.bind(this)
    this.onParseComplete = this.onParseComplete.bind(this)
    this.onParseError = this.onParseError.bind(this)
    this.updateCurrentStep = this.updateCurrentStep.bind(this)
    this.filterTable = debounce(this.filterTable.bind(this), 100)
  }

  async componentDidMount() {
    try {
      await this.loadPreview()

      this.updateCurrentStep('Rendering CSV...')
      this.parseCSV(this.props.content)
    } catch (err) {
      Logger.error(err)
    }
  }

  async loadPreview() {
    this.setState({
      isLoading: true,
      errors: new Set(),
      currentStep: 'Loading libraries...'
    })

    try {
      this.Parser = (await import('papaparse')).default
    } catch (err) {
      Logger.error(err)

      this.setState({
        isLoading: false,
        errors: new Set([...this.state.errors, LIBRARY_IMPORT_ERROR])
      })
    }
  }

  updateCurrentStep(currentStep) {
    this.setState({ currentStep })
  }

  parseCSV(content) {
    const Parser = this.Parser

    Parser.parse(content, {
      skipEmptyLines: true,
      worker: true,
      comments: false,
      preview: MAX_ROW_COUNT + 1,
      delimitersToGuess: [
        ',',
        '\t',
        '|',
        ';',
        ':',
        Parser.RECORD_SEP,
        Parser.UNIT_SEP
      ],
      complete: this.onParseComplete,
      error: this.onParseError
    })
  }

  onParseComplete(results) {
    const errors = new Set([...this.state.errors])
    const tableHeaders = results.data[0]
    const tableRows = results.data.slice(1).map(row => ({
      rowArray: row,
      display: ''
    }))

    if (results.meta.truncated) {
      errors.add(MAX_ROW_ERROR)
    }

    this.setState({
      errors,
      tableHeaders,
      tableRows,
      isLoading: false
    })
  }

  onParseError(err) {
    // Just because a parsing error was generated, that doesn't
    // mean we can't still display the table
    Logger.warn(err)
    this.setState({
      errors: new Set([...this.state.errors, PARSE_ERROR])
    })
  }

  onChange(event) {
    const inputValue = event.currentTarget.value
    this.setState({ inputValue })
    this.filterTable(inputValue.toLowerCase())
  }

  filterTable(value) {
    const tableRows = this.state.tableRows

    const rows = tableRows.map(data => {
      const match = data.rowArray.find(
        str => str.toLowerCase().indexOf(value) > -1
      )

      return {
        rowArray: data.rowArray,
        display: match ? '' : 'none'
      }
    })

    this.setState({ tableRows: rows })
  }

  renderTable() {
    const { tableHeaders, tableRows } = this.state

    return (
      <table>
        <thead>
          <tr data-header>
            <td className="line-number" data-line-number="0" />
            {tableHeaders.map((value, index) => (
              <th key={index}>{value}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((data, index) => (
            <tr key={`row-${index}`} style={{ display: data.display }}>
              <td className="line-number" data-line-number={index + 1} />
              {data.rowArray.map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  render() {
    const { inputValue, errors, isLoading, currentStep } = this.state

    if (isLoading) {
      return <LoadingOverlay text={currentStep} />
    }

    if (errors.has(LIBRARY_IMPORT_ERROR)) {
      return (
        <ErrorOverlay
          message="Error loading CSV renderer."
          retryMessage="Retry"
          onRetryClick={this.loadPreview}
        />
      )
    }

    return (
      <div className="csv-renderer">
        <div className="search">
          <AiOutlineSearch />
          <input
            placeholder="Search this file..."
            onChange={this.onChange}
            value={inputValue}
            autoCapitalize="false"
            autoComplete="false"
          />
        </div>
        {errors.has(PARSE_ERROR) && (
          <div className="csv-render-error">
            This file has errors that may cause it to display incorrectly.
          </div>
        )}
        {this.renderTable()}
        {errors.has(MAX_ROW_ERROR) && (
          <div className="max-row-error">
            For performance reasons, only {MAX_ROW_COUNT} rows were displayed.
          </div>
        )}
      </div>
    )
  }
}

CSVRenderer.propTypes = {
  content: PropTypes.string.isRequired
}

export default CSVRenderer
