import '../style/search-input.scss'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { AiOutlineSearch, AiOutlineLoading } from 'react-icons/ai'

const rand = () => Math.floor(Math.random() * 1_000_000)
const randId = () => `input-${rand()}-${rand()}-${rand()}`

const SearchInput = props => {
  const [inputValue, setInputValue] = useState(props.value)
  const [hasError, setHasError] = useState(props.hasError)
  const [errorMessage, setErrorMessage] = useState(props.errorMessage)
  const [isLoading, setLoading] = useState(props.isLoading)
  const inputId = randId()

  const onSearch = () => {
    if (!isLoading) {
      props.onSearch(inputValue)
    }
  }

  const onChange = event => {
    const { value } = event.currentTarget
    setInputValue(value)
    props.onChange(value)
  }

  const onEnterPress = event => {
    if (
      event.repeat ||
      event.key !== 'Enter' ||
      document.activeElement.id !== inputId ||
      isLoading
    ) {
      return
    }

    onSearch()
  }

  useEffect(() => {
    setInputValue(props.value)
    document.addEventListener('keypress', onEnterPress)
    return () => {
      document.removeEventListener('keypress', onEnterPress)
    }
  }, [onEnterPress])

  useEffect(() => {
    setHasError(props.hasError)
    setErrorMessage(props.errorMessage)
  }, [props.hasError, props.errorMessage])

  useEffect(() => {
    setLoading(props.isLoading)
  }, [props.isLoading])

  useEffect(() => {
    setInputValue(props.value)
  }, [props.value])

  return (
    <div className={`search-input ${props.className}`}>
      <div className={`input-wrapper ${hasError ? 'input--error' : ''}`}>
        <input
          type="text"
          id={inputId}
          onChange={onChange}
          placeholder={props.placeholder}
          value={props.value}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          autoCapitalize="none"
        />
        <button
          className="search-button"
          disabled={isLoading}
          onClick={onSearch}
          type="button"
        >
          {props.isLoading ? (
            <AiOutlineLoading className="loading-icon" />
          ) : (
            <AiOutlineSearch className="search-icon" />
          )}
        </button>
      </div>
      {hasError && (
        <label htmlFor={inputId} className="error-label">
          Error: {errorMessage}
        </label>
      )}
    </div>
  )
}

SearchInput.propTypes = {
  onChange: PropTypes.func,
  hasError: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  onSearch: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired
}

SearchInput.defaultProps = {
  onChange: () => {},
  placeholder: '',
  hasError: false,
  errorMessage: '',
  isLoading: false,
  className: ''
}

export default SearchInput
