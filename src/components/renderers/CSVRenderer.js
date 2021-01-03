import '../../style/csv-renderer.scss'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import Papa from 'papaparse'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import { AiOutlineSearch } from 'react-icons/ai'
import debounce from 'lodash/debounce'
import Logger from '../../scripts/logger'

const MAX_ROW_COUNT = 1000
const PARSE_ERROR = 'PARSE_ERROR'
const MAX_ROW_ERROR = 'MAX_ROW_ERROR'

const CSVRenderer = props => {
  const [isLoading, setLoading] = useState(true)
  const [errors, setErrors] = useState(new Set())
  const [inputValue, setInputValue] = useState('')
  const [rowCount, setRowCount] = useState(0)
  const tableBodyRef = useRef(null)
  const debouncedFilter = useCallback(debounce(filterTable, 100), [])
  const [tableData, setTableData] = useState({
    headers: [],
    rows: [[]]
  })

  const onChange = event => {
    const value = event.currentTarget.value
    setInputValue(value)
    debouncedFilter(value.toLowerCase())
  }

  function filterTable(value) {
    const tr = tableBodyRef.current.querySelectorAll('tr')

    for (let i = 0; i < tr.length; i++) {
      const match = tr[i].innerText.toLowerCase().indexOf(value) > -1
      tr[i].style.display = match ? '' : 'none'
    }
  }

  useEffect(() => {
    Papa.parse(props.content, {
      skipEmptyLines: true,
      worker: true,
      comments: false,
      delimitersToGuess: [
        ',',
        '\t',
        '|',
        ';',
        Papa.RECORD_SEP,
        Papa.UNIT_SEP,
        ':'
      ],
      complete(result) {
        const rows = result.data.slice(1)

        if (rows.length > MAX_ROW_COUNT) {
          setErrors(prevState => new Set([...prevState, MAX_ROW_ERROR]))
        }

        setTableData({
          headers: result.data[0],
          rows: rows.slice(0, MAX_ROW_COUNT)
        })

        setRowCount(rows.length)
        setLoading(false)
      },
      error(err) {
        setErrors(prevState => new Set([...prevState, PARSE_ERROR]))
        Logger.warn(err)
      }
    })
  }, [])

  if (isLoading) {
    return <LoadingOverlay text="Loading CSV..." />
  }

  if (tableData.headers.length === 0) {
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
            {tableData.headers.map((value, index) => (
              <th key={index}>{value}</th>
            ))}
          </tr>
        </thead>
        <tbody ref={tableBodyRef}>
          {tableData.rows.map((row, index) => (
            <tr key={`row-${index}`}>
              <td className="line-number" data-line-number={index + 1} />
              {row.map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {errors.has(MAX_ROW_ERROR) && (
        <div className="max-row-error">
          For performance reasons, only {MAX_ROW_COUNT.toLocaleString()} rows
          were displayed. {rowCount.toLocaleString()} rows total.
        </div>
      )}
    </div>
  )
}

CSVRenderer.propTypes = {
  content: PropTypes.string.isRequired
}

export default CSVRenderer
