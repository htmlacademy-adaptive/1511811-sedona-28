import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';
import rename from 'gulp-rename';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//HTML
const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'));
}

//Scripts
const script = () => {
  return gulp.src('source/js/*.js')
  .pipe(terser())
  .pipe(gulp.dest('build/js'))
}

//Images
const images = () => {
return gulp.src('source/img/*.{jpg,png}')
.pipe(squoosh())
.pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('source/img/*.{jpg,png}')
  .pipe(gulp.dest('build/img'))
  }

//Webp
const createWebp = () => {
return gulp.src('source/img/*.{jpg,png}')
.pipe(squoosh({
  webp: {}
}))
.pipe(gulp.dest('build/img'))
}


//SVG
const svg = () => {
return gulp.src(['source/img/*.svg', '!source/img/icons/*.svg'])
.pipe(svgo())
.pipe(gulp.dest('build/img'))
}

const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
  .pipe(svgo())
  .pipe(svgstore())
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img'))
}

//Copy
const copy = () => {
return gulp.src([
  'source/fonts/*.{woff2,woff}',
  'source/*.ico',
], {
  base: 'source'
})
.pipe(gulp.dest('build'))
done();
}

//Clean
const clean = () => {
  return del('build')
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(script));
  gulp.watch('source/*.html', gulp.series(html, reload));
}


//Build

export const build = gulp.series(
  clean,
  copy,
  images,
  gulp.parallel(
    html,
    svg,
    createWebp,
    script,
    sprite,
    styles
  ),
);


//Default
export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    html,
    svg,
    createWebp,
    script,
    sprite,
    styles
  ),
  gulp.series(
    server,
    watcher
  )
);
