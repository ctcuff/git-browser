const setTheme = theme => {
  const body = document.body

  localStorage.setItem('theme', theme)

  body.classList.toggle(body.className)
  body.classList.add(theme)

  return {
    type: 'SET_THEME',
    payload: {
      theme
    }
  }
}

export { setTheme }
