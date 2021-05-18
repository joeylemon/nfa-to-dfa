const gulp = require('gulp')
const webserver = require('gulp-webserver')

gulp.task('js', (done) => {
    gulp.src('components/**/*.js')
    done()
})

gulp.task('html', (done) => {
    gulp.src('components/**/*.html')
    done()
})

gulp.task('css', (done) => {
    gulp.src('components/**/*.css')
    done()
})

gulp.task('watch', (done) => {
    gulp.watch('components/**/*.js', gulp.series('js'))
    gulp.watch('components/**/*.css', gulp.series('css'))
    gulp.watch(['components/**/*.html',
        'index.html'], gulp.series('html'))
    done()
})

gulp.task('webserver', (done) => {
    gulp.src('.')
        .pipe(webserver({
            livereload: true,
            open: true
        }))
    done()
})

gulp.task('default', gulp.series('watch', 'html', 'js', 'css', 'webserver'))
