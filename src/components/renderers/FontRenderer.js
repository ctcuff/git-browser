import '../../style/renderers/font-renderer.scss'
import React, { useEffect, useState } from 'react'
import { ImFont } from 'react-icons/im'
import PropTypes from 'prop-types'
import ErrorOverlay from '../ErrorOverlay'

const glpyhs = `
ABCČĆDĐEFGHIJKLMNOPQRSŠTUVWXYZŽabcčćdđefghijklmnopqrsštuvwx
yzžĂÂÊÔƠƯăâêôơư1234567890‘?’“!”(%)[#]{@}/&\\<-+÷×=>®©$€£¥¢:;,.*
`
  .replace(/[\r\n]/g, '')
  .split('')

const extendedPreview = (
  <div className="preview-container">
    <h2 className="font-default">Glyphs</h2>
    <div className="font-renderer-glyphs">
      {glpyhs.map((glyph, index) => (
        <div key={index} className="glyph">
          {glyph}
        </div>
      ))}
    </div>
    <div className="extended-text">
      <h2>Pirates of Space.</h2>
      <p>
        {`Apparently motionless to her passengers and crew, the Interplanetary
        liner Hyperion bored serenely onward through space at normal
        acceleration. In the railed-off sanctum in one corner of the control
        room a bell tinkled, a smothered whirr was heard, and Captain Bradley
        frowned as he studied the brief message upon the tape of the recorder--a
        message flashed to his desk from the operator's panel. He beckoned, and
        the second officer, whose watch it now was, read aloud: "Reports of
        scout patrols still negative." "Still negative." The officer scowled in
        thought. "They've already searched beyond the widest possible location
        of the wreckage, too. Two unexplained disappearances inside a
        month--first the Dione, then the Rhea--and not a plate nor a lifeboat
        recovered. Looks bad, sir. One might be an accident; two might possibly
        be a coincidence...." His voice died away. What might that coincidence
        mean?`}
      </p>
      <p>
        {`"But at three it would get to be a habit," the captain finished the
        thought. "And whatever happened, happened quick. Neither of them had
        time to say a word--their location recorders simply went dead. But of
        course they didn't have our detector screens nor our armament. According
        to the observatories we're in clear ether, but I wouldn't trust them
        from Tellus to Luna. You have given the new orders, of course?" "Yes,
        sir. Detectors full out, all three courses of defensive screen on the
        trips, projectors manned, suits on the hooks. Every object detected in
        the outer space to be investigated immediately--if vessels, they are to
        be warned to stay beyond extreme range. Anything entering the fourth
        zone is to be rayed." "Right--we are going through!"`}
      </p>
      <p>
        {`"But no known type of vessel could have made away with them without
        detection," the second officer argued. "I wonder if there isn't
        something in those wild rumors we've been hearing lately?" Now,
        systematically and precisely, the great Cone of Battle was coming into
        being; a formation developed during the Jovian Wars while the forces of
        the Three Planets were fighting in space. "Bah! Of course not!" snorted
        the captain. "Pirates in ships faster than light--fifth order
        rays--nullification of gravity--mass without inertia--ridiculous! Proved
        impossible, over and over again. No, sir, if pirates are operating in
        space--and it looks very much like it--they won't get far against a good
        big battery full of kilowatt-hours behind three courses of heavy screen,
        and a good solid set of multiplex rays. Properly used, they're good
        enough for anybody. Pirates, Neptunians, angels, or devils--in ships or
        on sunbeams--if they tackle the Hyperion we'll burn them out of the
        ether!"`}
      </p>
      <p>
        {`Leaving the captain's desk, the watch officer resumed his tour of duty.
        The six great lookout plates into which the alert observers peered were
        blank, their far-flung ultra-sensitive detector screens encountering no
        obstacle--the ether was empty for thousands upon thousands of
        kilometers. The signal lamps upon the pilot's panel were dark, its
        warning bells were silent. A brilliant point of white in the center of
        the pilot's closely ruled micrometer grating, exactly upon the
        cross-hairs of his directors, showed that the immense vessel was
        precisely upon the calculated course, as laid down by the automatic
        integrating course-plotters. Everything was quiet and in order.`}
      </p>
      <p className="extended-text--author font-default">
        Text borrowed from Triplanetary by Edward Elmer Smith.
      </p>
    </div>
  </div>
)

const getFontFormat = fontName => {
  switch (fontName) {
    case 'otf':
      return 'opentype'
    case 'ttf':
      return 'truetype'
    case 'woff':
    case 'woff2':
    default:
      return fontName
  }
}

const FontRenderer = props => {
  if (props.extension === '.eot') {
    return (
      <ErrorOverlay
        message="This font is currently unsupported."
        showIcon={false}
      />
    )
  }
  // Need to replace new line characters to
  // get the font-family to load properly
  const content = props.content.replace(/[\r\n]/g, '')
  const fontType = props.extension.slice(1)
  const format = getFontFormat(fontType)
  const mimeType = `font/${fontType}`
  const [isPreviewShowing, setShowPreview] = useState(false)
  const [preview, setPreview] = useState(null)

  const togglePreview = () => setShowPreview(!isPreviewShowing)

  useEffect(() => {
    const style = document.createElement('style')

    style.innerHTML = `
      @font-face {
        font-family: "FontRenderer-Preview";
        src: url("data:${mimeType};base64,${content}") format("${format}");
      }`

    document.head.insertAdjacentElement('beforeend', style)

    // Render the glyphs once here so we don't have to keep
    // rendering them when the toggle button is clicked
    setPreview(extendedPreview)

    // Remove this style when the component is unmounted
    return () => {
      style.remove()
    }
  }, [])

  return (
    <div className="font-renderer">
      {isPreviewShowing ? (
        preview
      ) : (
        <h1 className="text-preview">
          Apparently motionless to her passengers and crew
        </h1>
      )}
      <button
        className="toggle-preview-button"
        onClick={togglePreview}
        title="Toggle font extended preview"
      >
        <ImFont />
      </button>
    </div>
  )
}

FontRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  extension: PropTypes.oneOf(['.eot', '.otf', '.ttf', '.woff', '.woff2'])
}

export default FontRenderer
