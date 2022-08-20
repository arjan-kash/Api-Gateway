const gulp = require('gulp');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');
const typescript = require('gulp-typescript');
const replace = require('gulp-replace');
const del = require("del");

function clean() {
  console.log('Delete ./dist directory');
  return del(['dist'])
}

function copyConfig() {
  let ENVIRONMENT = process.env.ENVIRONMENT;
  if (!ENVIRONMENT) {
    ENVIRONMENT = 'local';
  }
  console.log('Copy ./config/config-' + ENVIRONMENT + '.json file to ./dist/config.json');

  let APP_ENVIRONMENT = process.env.APP_ENVIRONMENT;
  if (!APP_ENVIRONMENT) {
    APP_ENVIRONMENT = 'local';
  }
  console.log('Replace {environment} with ' + APP_ENVIRONMENT + ' config.json');

  return gulp.src('./config/config-' + ENVIRONMENT + '.json')
      .pipe(rename('config.json'))
      .pipe(replace('{environment}', APP_ENVIRONMENT))
      .pipe(gulp.dest('dist/'));
}

// function copyTemplates() {
//   console.log('Copy ./config/templates.json file to ./dist/templates.json');
//   return gulp.src('./config/templates.json')
//       .pipe(gulp.dest('dist/'));
// }

function copySource() {
  console.log('Compile ./src directory and Copy to ./dist');
  return gulp.src('./src/**/*.ts')
      .pipe(typescript({
        target: 'ES5'
      }))
      .pipe(uglify({}))
      .pipe(gulp.dest('dist/'));
}

function copyViews() {
  console.log('Compile ./src directory and Copy to ./dist');
  return gulp.src('./src/**/*.pug')
      .pipe(gulp.dest('dist/'));
}

function copyPublic() {
  console.log('Copy ./src/public to ./dist/public');
  return gulp.src('./src/public/**/*', {allowEmpty: true})
      .pipe(gulp.dest('dist/public/'));
}

const build = gulp.series(clean, copyConfig, copySource, copyViews, copyPublic);

exports.clean = clean;
exports.build = build;

exports.default = build;

