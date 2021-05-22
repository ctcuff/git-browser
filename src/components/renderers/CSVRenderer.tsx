import '../../style/renderers/csv-renderer.scss'
import React from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import debounce from 'lodash/debounce'
import { ParseError, ParseResult, GuessableDelimiters } from 'papaparse'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import Logger from '../../scripts/logger'

type TableRow = {
  rowArray: string[]
  display: string
}

type CSVRendererProps = {
  /**
   * Not base64 encoded
   */
  content: string
}

type CSVRendererState = {
  isLoading: boolean
  errors: Set<string>
  currentStep: string
  inputValue: string
  tableHeaders: string[]
  tableRows: TableRow[]
}

// The max number of rows that can be displayed before truncation
const MAX_ROW_COUNT = 500
// Occurs when the CSV file has an error. This usually isn't severe
// enough to stop the table from rendering
const PARSE_ERROR = 'PARSE_ERROR'
// Occurs when we reach the max row count
const MAX_ROW_ERROR = 'MAX_ROW_ERROR'
// Occurs if there was an error importing papaparse library
const LIBRARY_IMPORT_ERROR = 'LIBRARY_IMPORT_ERROR'

class CSVRenderer extends React.Component<CSVRendererProps, CSVRendererState> {
  private Parser!: typeof import('papaparse')

  constructor(props: CSVRendererProps) {
    super(props)

    this.state = {
      isLoading: true,
      errors: new Set(),
      currentStep: 'Loading...',
      inputValue: '',
      tableHeaders: [],
      tableRows: []
    }

    this.onChange = this.onChange.bind(this)
    this.renderTable = this.renderTable.bind(this)
    this.init = this.init.bind(this)
    this.parseCSV = this.parseCSV.bind(this)
    this.onParseComplete = this.onParseComplete.bind(this)
    this.onParseError = this.onParseError.bind(this)
    this.updateCurrentStep = this.updateCurrentStep.bind(this)
    this.filterTable = debounce(this.filterTable.bind(this), 100)
  }

  componentDidMount(): void {
    try {
      this.init()
    } catch (err) {
      Logger.error(err)
    }
  }

  onParseComplete(results: ParseResult<string[]>): void {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const errors = new Set(Array.from(this.state.errors))
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

  onParseError(err: ParseError): void {
    // Just because a parsing error was generated, that doesn't
    // mean we can't still display the table
    Logger.warn(err)
    this.setState(prevState => {
      const errors = new Set(Array.from(prevState.errors))
      errors.add(PARSE_ERROR)

      return { errors }
    })
  }

  onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const inputValue = event.currentTarget.value
    this.setState({ inputValue })
    this.filterTable(inputValue.toLowerCase())
  }

  parseCSV(content: string): void {
    const { Parser } = this

    Parser.parse(content, {
      skipEmptyLines: true,
      worker: true,
      comments: '#',
      preview: MAX_ROW_COUNT + 1,
      delimitersToGuess: [
        ',',
        '\t',
        '|',
        ';',
        ':' as GuessableDelimiters,
        Parser.RECORD_SEP,
        Parser.UNIT_SEP
      ],
      complete: this.onParseComplete,
      error: this.onParseError
    })
  }

  updateCurrentStep(currentStep: string): void {
    this.setState({ currentStep })
  }

  async init(): Promise<void> {
    this.setState({
      isLoading: true,
      errors: new Set(),
      currentStep: 'Loading libraries...'
    })

    try {
      this.Parser = (await import('papaparse')).default

      this.updateCurrentStep('Rendering CSV...')
      this.parseCSV(this.props.content)
    } catch (err) {
      Logger.error(err)

      this.setState(prevState => {
        const errors = new Set(Array.from(prevState.errors))
        errors.add(LIBRARY_IMPORT_ERROR)

        return {
          errors,
          isLoading: false
        }
      })
    }
  }

  filterTable(value: string): void {
    const { tableRows } = this.state

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

  renderTable(): JSX.Element {
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
          {tableRows.map((data, rowIndex) => (
            <tr key={`row-${rowIndex}`} style={{ display: data.display }}>
              <td className="line-number" data-line-number={rowIndex + 1} />
              {data.rowArray.map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  render(): JSX.Element {
    const { inputValue, errors, isLoading, currentStep } = this.state

    if (isLoading) {
      return <LoadingOverlay text={currentStep} />
    }

    if (errors.has(LIBRARY_IMPORT_ERROR)) {
      return (
        <ErrorOverlay
          message="Error loading CSV renderer."
          retryMessage="Retry"
          onRetryClick={this.init}
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
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            autoCapitalize="none"
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

export default CSVRenderer
