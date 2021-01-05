import React from 'react'
import Editor from 'src/components/Editor'
import { mount } from 'enzyme'
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js'
import { setCSSVar } from 'src/scripts/util'

// Slight hack to "wait" for the editor to load our mock monaco file
const waitForEditorImport = () => new Promise(resolve => setTimeout(resolve, 1))

describe('Editor', () => {
  test('mounts and inits editor', async () => {
    const createModel = jest.spyOn(editor, 'createModel')
    const create = jest.spyOn(editor, 'create')
    const component = mount(
      <Editor fileName="test.js" content="mockContent" colorScheme="mock" />
    )

    await waitForEditorImport()

    expect(createModel).toHaveBeenCalledWith('mockContent', 'javascript')
    expect(create).toHaveBeenCalled()
    expect(component.instance().monaco).toEqual(editor)
  })

  test('adds scrollbar height to editor', async () => {
    setCSSVar('--scrollbar-height', 100)
    const changeAccessor = {
      addZone: jest.fn()
    }

    const component = mount(
      <Editor fileName="test.js" content="mockContent" colorScheme="mock" />
    )

    await waitForEditorImport()

    component.instance().viewZoneCallback(changeAccessor)

    expect(changeAccessor.addZone).toHaveBeenCalledWith(
      expect.objectContaining({
        afterLineNumber: 0,
        heightInPx: 100,
        domNode: document.createElement('div')
      })
    )
  })

  test('updates color scheme only if necessary', async () => {
    const setTheme = jest.spyOn(editor, 'setTheme')
    const component = mount(
      <Editor fileName="test.js" content="mockContent" colorScheme="light" />
    )

    await waitForEditorImport()

    component.setProps({ colorScheme: 'dark' })
    component.setProps({ colorScheme: 'light' })
    component.setProps({ colorScheme: 'light' })
    component.setProps({ colorScheme: 'light' })
    component.setProps({ colorScheme: 'dark' })
    component.setProps({ colorScheme: 'dark' })
    component.setProps({ colorScheme: 'dark' })

    expect(setTheme).toHaveBeenCalledTimes(3)
  })

  test('cleans up editor on unmount', async () => {
    const getModel = jest.spyOn(editor, 'getModel')
    const dispose = jest.spyOn(editor, 'dispose')
    const component = mount(
      <Editor fileName="test.js" content="mockContent" colorScheme="mock" />
    )

    await waitForEditorImport()

    component.unmount()

    expect(getModel).toHaveBeenCalled()
    expect(dispose).toHaveBeenCalled()
  })
})
