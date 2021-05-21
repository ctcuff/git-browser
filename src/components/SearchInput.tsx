import '../style/search-input.scss'
import React, { useState, useEffect } from 'react'
import { AiOutlineSearch, AiOutlineLoading } from 'react-icons/ai'

type SearchInputProps = {
  onChange: (value: string) => void
  onSearch: (value: string) => void
  value: string
  hasError: boolean
  placeholder: string
  className: string
  errorMessage: string
  isLoading?: boolean
}

const randNum = () => Math.floor(Math.random() * 1_000_000)
const randomId = () => `input-${randNum()}-${randNum()}-${randNum()}`

const SearchInput = (props: SearchInputProps): JSX.Element => {
  const [inputValue, setInputValue] = useState(props.value)
  const [hasError, setHasError] = useState(props.hasError)
  const [errorMessage, setErrorMessage] = useState(props.errorMessage)
  const [isLoading, setLoading] = useState(props.isLoading || false)
  const inputId = randomId()

  const onSearch = (): void => {
    if (!isLoading) {
      props.onSearch(inputValue)
    }
  }

  const onInputValueChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { value } = event.currentTarget
    setInputValue(value)
    props.onChange(value)
  }

  const onPressEnter = (event: KeyboardEvent): void => {
    if (
      event.repeat ||
      event.key !== 'Enter' ||
      document.activeElement?.id !== inputId ||
      isLoading
    ) {
      return
    }

    onSearch()
  }

  useEffect(() => {
    setInputValue(props.value)
    document.addEventListener('keypress', onPressEnter)

    return () => {
      document.removeEventListener('keypress', onPressEnter)
    }
  }, [onPressEnter])

  useEffect(() => {
    setHasError(props.hasError)
    setErrorMessage(props.errorMessage)
  }, [props.hasError, props.errorMessage])

  useEffect(() => {
    setLoading(props.isLoading || false)
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
          onChange={onInputValueChange}
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

export default SearchInput
