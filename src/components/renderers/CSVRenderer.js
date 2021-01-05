import '../../style/csv-renderer.scss'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import Papa from 'papaparse'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import { AiOutlineSearch } from 'react-icons/ai'
import debounce from 'lodash/debounce'
import Logger from '../../scripts/logger'

const MAX_ROW_COUNT = 500
const PARSE_ERROR = 'PARSE_ERROR'
const MAX_ROW_ERROR = 'MAX_ROW_ERROR'

const CSVRenderer = props => {
  const [isLoading, setLoading] = useState(true)
  const [errors, setErrors] = useState(new Set())
  const [inputValue, setInputValue] = useState('')
  const tableBodyRef = useRef(null)
  const debouncedFilter = useCallback(debounce(filterTable, 100), [])
  const [tableHeaders, setTableHeaders] = useState([])
  const [tableRows, setTableRows] = useState([
    {
      rowArray: [],
      display: ''
    }
  ])

  const onChange = event => {
    const value = event.currentTarget.value
    setInputValue(value)
    debouncedFilter(tableRows, value.toLowerCase())
  }

  function filterTable(tableRows, value) {
    const rows = tableRows.map(data => {
      const match = data.rowArray.find(
        str => str.toLowerCase().indexOf(value) > -1
      )

      return {
        rowArray: data.rowArray,
        display: match ? '' : 'none'
      }
    })

    setTableRows(rows)
  }

  useEffect(() => {
    Papa.parse(props.content, {
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
        Papa.RECORD_SEP,
        Papa.UNIT_SEP
      ],
      complete(results) {
        setTableHeaders(results.data[0])
        setTableRows(
          results.data.slice(1).map(row => ({
            rowArray: row,
            display: ''
          }))
        )

        if (results.meta.truncated) {
          setErrors(prevState => new Set([...prevState, MAX_ROW_ERROR]))
        }

        setLoading(false)
      },
      error(err) {
        setErrors(prevState => new Set([...prevState, PARSE_ERROR]))
        Logger.warn(err)
      }
    })
  }, [])

  if (isLoading) {
    return <LoadingOverlay text="Rendering CSV..." />
  }

  if (tableHeaders.length === 0) {
    return <ErrorOverlay message="No data to display." />
  }

  return (
    <div className="csv-renderer">
      <div className="search">
        <AiOutlineSearch />
        <input
          placeholder="Search this file..."
          onChange={onChange}
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
      <table>
        <thead>
          <tr data-header>
            <td className="line-number" data-line-number="0" />
            {tableHeaders.map((value, index) => (
              <th key={index}>{value}</th>
            ))}
          </tr>
        </thead>
        <tbody ref={tableBodyRef}>
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
      {errors.has(MAX_ROW_ERROR) && (
        <div className="max-row-error">
          For performance reasons, only {MAX_ROW_COUNT} rows were displayed.
        </div>
      )}
    </div>
  )
}

CSVRenderer.propTypes = {
  content: PropTypes.string.isRequired
}

export default CSVRenderer
