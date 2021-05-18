var gulp = require('gulp'),
  gutil = require('gulp-util'),
  webserver = require('gulp-webserver');

gulp.task('js', function() {
  gulp.src('components/**/*.js')
});

gulp.task('html', function() {
  gulp.src('components/**/*.html')
});

gulp.task('css', function() {
  gulp.src('components/**/*.css')
});

gulp.task('watch', function() {
  gulp.watch('components/**/*.js', ['js']);
  gulp.watch('components/**/*.css', ['css']);
  gulp.watch(['components/**/*.html',
    'index.html'], ['html']);
});

gulp.task('webserver', function() {
  gulp.src('.')
    .pipe(webserver({
      livereload: true,
      open: true
    }));
});

gulp.task('default', ['watch', 'html', 'js', 'css', 'webserver']);
