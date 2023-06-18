import {
  Transform
} from 'node:stream'
import cssPurge from '@sequencemedia/css-purge'
import PluginError from 'plugin-error'

const PLUGIN_NAME = '@sequencemedia/gulp-css-purge'

const DEFAULT_OPTIONS = {
  trim: true,
  shorten: true,
  format: true,
  report: false,
  verbose: false
}

function streamWrite (css) {
  return this.write(css)
}

function getVinylFileName (file) {
  return file.basename || (file.stem + file.extname)
}

function getVinylFilePath (file) {
  return file.path
}

function getTransformFor (options) {
  return function transform (file, encoding, done) {
    if (file.isNull()) {
      done(null, file)
      return
    }

    if (file.isStream()) {
      const fileContents = file.contents ? file.contents.toString() : ''
      const fileName = getVinylFileName(file)
      const filePath = getVinylFilePath(file)
      const fileOptions = {
        file_name: fileName,
        file_path: filePath,
        ...options
      }

      try {
        cssPurge.purgeCSS(fileContents, fileOptions, (error, css) => {
          if (error) {
            done(new PluginError(PLUGIN_NAME, error))
            return
          }

          file.contents = file.contents.pipe(streamWrite(css))

          done(null, file)
        })

        /**
         *  Ensure exit here
         */
        return
      } catch (error) {
        done(new PluginError(PLUGIN_NAME, error))
        return
      }
    }

    if (file.isBuffer()) {
      const fileContents = file.contents ? file.contents.toString() : ''
      const fileName = getVinylFileName(file)
      const filePath = getVinylFilePath(file)
      const fileOptions = {
        file_name: fileName,
        file_path: filePath,
        ...options
      }

      try {
        cssPurge.purgeCSS(fileContents, fileOptions, (error, css) => {
          if (error) {
            done(new PluginError(PLUGIN_NAME, error))
            return
          }

          file.contents = Buffer.from(css)

          done(null, file)
        })

        /**
         *  Ensure exit here
         */
        return
      } catch (error) {
        done(new PluginError(PLUGIN_NAME, error))
        return
      }
    }

    /**
     *  None of the above
     */
    done()
  }
}

export default function gulpCSSPurge (options = DEFAULT_OPTIONS) {
  const transform = getTransformFor(options)

  return new Transform({ transform, objectMode: true })
}
