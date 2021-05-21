// https://github.com/jsvine/notebookjs
// notebookjs doesn't have types defined so only the functions
// used from notebookjs are defined here
declare module 'notebook' {
  export interface Notebook {
    render: () => HTMLElement
  }

  export function ansi(input: string): string

  export function highlighter(
    text: string,
    pre: HTMLPreElement,
    code: HTMLElement,
    lang: string
  ): string

  export function markdown(text: string): string

  export function parse(ipynb: Record<string, unknown>): Notebook
}
