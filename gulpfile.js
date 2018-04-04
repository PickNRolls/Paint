var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function() {
  gulp.src('./app/sass/**/*.sass')
    .pipe(sass())
    .pipe(gulp.dest('./app/css/'));
});

gulp.task('sass:watch', function() {
  gulp.watch('./app/sass/**/*.sass', ['sass']);
});