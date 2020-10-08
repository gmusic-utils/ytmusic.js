/* eslint-disable import/no-extraneous-dependencies */
import { dest, series, src } from 'gulp';
import babel from 'gulp-babel';
import browserify from 'gulp-browserify';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';

const files = {
  rawJS: ['./src/**/*.js'],
};

const transpileTask = () => {
  return src(files.rawJS)
    .pipe(babel())
    .pipe(dest('./build'))
};

const browserifyTask = () => {
  return src('./build/main.js')
    .pipe(browserify({
      standalone: 'YTMusic',
    }))
    .pipe(rename('ytmusic.js'))
    .pipe(dest('./dist'))
}

const uglifyTask = () => {
  return src('./dist/ytmusic.js')
    .pipe(uglify())
    .pipe(rename('ytmusic.min.js'))
    .pipe(dest('./dist'))
}

exports.build = series(transpileTask, browserifyTask, uglifyTask);