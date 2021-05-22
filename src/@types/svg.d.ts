// Tells TypeScript that any SVGs are imported as a string
// (in the form of a URL because of webpack config)
declare module '*.svg' {
  const url: string
  export default url
}
