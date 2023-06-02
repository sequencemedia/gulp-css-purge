import cssPurge from 'css-purge'
import PluginError from 'plugin-error'
import through from 'through2'

const PLUGIN_NAME = 'gulp-css-purge'

const DEFAULT_OPTIONS = {
  trim: true,
  shorten: true,
  format_font_family: true
}

function writeToStream (css) {
  return through().write(css)
}

export default (options = DEFAULT_OPTIONS) => {
  delete options.reduceConfig

  return through.obj((file, encoding, done) => {
    if (file.isNull()) {
      return done(null, file)
    }

    if (file.isStream()) {
      const fileContents = file.contents ? file.contents.toString() : ''

      try {
        cssPurge.purgeCSS(fileContents, options, (error, css) => {
          if (error) {
            return done(new PluginError(PLUGIN_NAME, error))
          }

          file.contents = file.contents.pipe(writeToStream(css))

          return done(null, file)
        })
      } catch (error) {
        return done(new PluginError(PLUGIN_NAME, error))
      }
    }

    if (file.isBuffer()) {
      const fileContents = file.contents ? file.contents.toString() : ''

      try {
        cssPurge.purgeCSS(fileContents, options, (error, css) => {
          if (error) {
            return done(new PluginError(PLUGIN_NAME, error))
          }

          file.contents = Buffer.from(css)

          return done(null, file)
        })
      } catch (error) {
        return done(new PluginError(PLUGIN_NAME, error))
      }
    }
  })
}
