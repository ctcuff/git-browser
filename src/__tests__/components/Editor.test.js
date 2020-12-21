import React from 'react'
import Editor from 'src/components/Editor'
import { mount } from 'enzyme'
import { editor } from 'monaco-editor'
import { getLanguageFromFileName } from 'src/scripts/util'

describe('Editor', () => {
  test('updates only if necessary', () => {
    const setTheme = jest.spyOn(editor, 'setTheme')
    const updateEditor = jest.spyOn(Editor.prototype, 'updateEditor')
    const component = mount(
      <Editor fileName="test.js" content="mockContent" colorScheme="light" />
    )

    component.setProps({ colorScheme: 'dark' })
    component.setProps({ colorScheme: 'light' })
    component.setProps({ colorScheme: 'dark' })
    component.setProps({ content: 'newContent' })
    component.setProps({ content: 'newContent' })
    component.setProps({ content: 'veryNewContent' })

    // Need to make sure the component doesn't update
    // if it's editor is null for whatever reason
    component.instance().editor = null
    component.setProps({ content: 'moreContent' })

    expect(setTheme).toHaveBeenCalledWith('vs-dark')
    expect(updateEditor).toHaveBeenCalledTimes(2)
  })

  test('mounts', () => {
    const createModel = jest.spyOn(editor, 'createModel')
    const create = jest.spyOn(editor, 'create')
    const fileName = 'test.js'

    mount(<Editor fileName={fileName} content="mockContent" />)

    expect(createModel).toHaveBeenCalledWith(
      'mockContent',
      getLanguageFromFileName(fileName)
    )

    expect(create).toHaveBeenCalled()
  })

  test('cleans up  editor on unmount', () => {
    const getModel = jest.spyOn(editor, 'getModel')
    const dispose = jest.spyOn(editor, 'dispose')
    const component = mount(<Editor fileName="test.js" content="mockContent" />)

    component.unmount()

    expect(getModel).toHaveBeenCalled()
    expect(dispose).toHaveBeenCalled()
  })
})
