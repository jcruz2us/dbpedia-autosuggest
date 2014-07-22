var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    sass        = require('gulp-sass'),
    compass     = require('gulp-compass'),
    minifyCSS   = require('gulp-minify-css'),
    uglify      = require('gulp-uglify'),
    livereload  = require('gulp-livereload'), // Livereload plugin needed: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
    tinylr      = require('tiny-lr'),
    express     = require('express'),
    app         = express(),
    marked      = require('marked'),
    path        = require('path'),
    rename      = require('gulp-rename'),
    server      = tinylr();

gulp.task('compass', function() {
    return gulp.src('./src/stylesheets/*.scss')
        .pipe(compass({
            css: 'dist/stylesheets',
            sass: 'src/stylesheets'
        }))
        //.pipe( rename('jquery.dbpedia.autosuggest.css') )
        //.pipe(gulp.dest('dist/stylesheets'))

        .pipe( rename('jquery.dbpedia.autosuggest.min.css') )
        .pipe(minifyCSS())
        .pipe(gulp.dest('dist/stylesheets'))
        .pipe( livereload( server ));
});

gulp.task('js', function() {
  return gulp.src('src/scripts/*.js')
    
    .pipe( rename('jquery.dbpedia.autosuggest.js'))
    .pipe( gulp.dest('dist/scripts/'))

    .pipe( rename('jquery.dbpedia.autosuggest.min.js'))
    .pipe( uglify() )
    .pipe( gulp.dest('dist/scripts/'))

    .pipe( livereload( server ));
});


gulp.task('express', function() {
  //serve the /dist folder
  app.use('/dist', express.static(path.resolve('./dist')));
  //serve the demo folder as the root
  app.use(express.static(path.resolve('./demo')));
  app.listen(1337);
  gutil.log('Listening on port: 1337');
});

gulp.task('watch', function () {
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err);
    }

    gulp.watch('src/stylesheets/*.scss',['compass']);

    gulp.watch('src/scripts/*.js',['js']);

    gulp.watch('src/*.html',['copy']);
    
  });
});

// Default Task
gulp.task('default', ['js','compass','express','watch']);


