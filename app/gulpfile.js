// http://markgoodyear.com/2014/01/getting-started-with-gulp/
// http://forum.ionicframework.com/t/my-restructure-of-the-ionic-apps/11184
// http://netengine.com.au/blog/gulp-and-angularjs-a-love-story-or-the-old-wheel-was-terrible-check-out-my-new-wheel/

// gulp-autoprefixer gulp-jshint  gulp-livereload gulp-cache del

var bower = require('bower');
var http = require('http');
var fs = require('fs')
var ecstatic = require('ecstatic');
var gulp = require('gulp');
var gutil = require('gulp-util');
var replace = require('gulp-replace-task');
var jsonEditor = require('gulp-json-editor');
var plumber = require('gulp-plumber');
var filter = require('gulp-filter');
var print = require('gulp-print');
var concat = require('gulp-concat');
var cache = require('gulp-cached');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
//var pngquant = require('imagemin-pngquant');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var karma = require('gulp-karma');
var removeCode = require('gulp-remove-code');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var ngHtml2Js = require('gulp-ng-html2js');
var minifyHtml = require('gulp-minify-html');
var angularFilesort = require('gulp-angular-filesort');
var bowerFiles = require('main-bower-files');
var args = require('yargs').argv;
var sh = require('shelljs');
var merge = require('merge-stream');
var inject = require('gulp-inject');
var tsc = require('gulp-typescript')
var tslint = require('gulp-tslint');
var browserSync = require('browser-sync').create();

var env = 'dev';

var bowerConf = {
    paths: './',
    includeDev: true
};

var paths = {
    initTemplates: ['./*.template', './app/config/*.template', './CloudCode/**/*.template', './e2e/*.template', './tools/**/*.template'],
    config: ['./app/config/*.json'],
    sass: ['./app/scss/**/*.scss'],
    css: ['./app/css/**/*.css'],
    js: ['./app/js/**/*.js', '!**/*_test.js'], // test scripts are excluded
    ts: './app/js/**/*.ts',
    tsTypings: './tools/typings/',
    tsLibDefinitions: './tools/typings/**/*.ts',
    tsAppReferences: './tools/typings/typescriptApp.d.ts',
    tsTestsExclusion: '!./tools/typings/**/*-tests.ts',
    tsOutput: './app/ts-js',
    images: ['./app/img/**'],
    lib: ['./bower_components/**/*.js'], // used in the watch
    // bowerFiles doesn't include some files, not sure why yet, so manually include them here
    libJs: ['bower_components/ionic/js/ionic.bundle.js'
            ,'bower_components/ngImgCrop/compile/minified/ng-img-crop.js'
            ,'bower_components/parse-angular-patch/parse-angular.js'
    ], // files which aren't in the bower main config
    libCss: ['bower_components/ngImgCrop/compile/minified/ng-img-crop.css', 'bower_components/angular-slider/slider.css'], // files which aren't in the bower main config
    templates: ['./app/templates/**/*.html', './app/js/**/*.html'],
    fonts: [
        // can use the first line if the ionicons bundled with your ionic build have what you need
        // './bower_components/ionic/**/*.ttf', './bower_components/ionic/**/*.woff', './bower_components/ionic/**/*.svg',
        './bower_components/ionicons/fonts/*',
        // './bower_components/fontawesome/**/*.ttf', './bower_components/fontawesome/**/*.woff', './bower_components/fontawesome/**/*.svg'

        './app/fonts/*',
    ]
};

gulp.task('default', ['watch', 'sass', 'css', 'ts-lint', 'compile-ts', 'gen-ts-refs', 'js', 'lib', 'lib-css', 'templates', 'fonts', 'images', 'http']);


/**
 * Files which require project specific configuration exist with an extra .template extension
 * This task copies these files and removes the .template extension (leaving the .xml, .js, .json etc extensions)
 * Existing files will not be over-written
 */
gulp.task('init', function (done) {

    gulp.src(paths.initTemplates, {base: './'})
        .pipe(rename(function (path) {
            // create the new file by striping the .template extension
            var newPath = path.dirname + '/' + path.basename
            // don't over-write files as we probably already have config values in them
            if(!fs.existsSync(newPath)) {
                path.extname = ''
                console.log(newPath)
            }
        }))
        .pipe(gulp.dest('.'))
        .on('end', done);
})

/*
| --- Build environment setup -----------------------------------------------
*/

// See http://geekindulgence.com/environment-variables-in-angularjs-and-ionic/ for more info on this task
// At the command line, to use the QA config run:
// gulp --env qa
gulp.task('envConfig', function (done) {
    env = args.env || 'dev'
    console.log('Environment: ' + env)

    if(env === 'dev') {
        uglify = gutil.noop
        console.log('Disabling uglifying. Do not release dev builds to the app stores')
    }

    var configFile = '../server/' + (process.env.CONFIG_FILE || 'config.json')
    var config = JSON.parse(fs.readFileSync(configFile))

    var envConfig = config[env]
    
    if(!envConfig)
        throw 'No configuration found in ' + configFile + ' for env ' + env

    if(!config.parseMount.endsWith('/')) {
        console.log('parseMount config value should end with /')
        envConfig.parseMount = envConfig.parseMount + '/'
    }

    // Write out the constants.js file with all the required values in the configuration json
    var properties = ['appName','appId','parseMount','gcpBrowserKey','playStoreUrl','itunesUrl','facebookAppId','linkedInId','linkedInSecret','socialShareMessage','adMob']

    var constants = 'angular.module("constants", [])\n'
    properties.forEach(function(prop) {
        constants += '  .constant("' + prop + '", ' + JSON.stringify(config[prop]) + ')\n'
    })
    constants += '  .constant("serverUrl", "' + envConfig.serverUrl + '")\n'
    constants += '  .constant("env", "' + env + '");\n'

    constants += 'var FACEBOOK_APP_ID = "' + config.facebookAppId + '";\n'

    fs.writeFileSync('./app/js/constants.js', constants)

    // Copy the custom Android application class with the app id and server url configured
    var replacePatterns = [
        {match: 'parseAppId', replacement: config.appId},
        {match: 'serverUrl', replacement: envConfig.serverUrl},
        {match: 'parseMount', replacement: config.parseMount}]
    var java = gulp.src('./app/config/CustomApplication.java')
        .pipe(replace({ patterns: replacePatterns }))
        .pipe(gulp.dest('./platforms/android/src/org/apache/cordova'))

    // merge() waits for all sub-tasks to complete
    return merge(java) // [java].concat(updateFacebookIds())
});

// This function updates the Facebook plugin configuration so you can have different apps for dev/qa/prod
// without having to re-install the plugin. This is advanced unsupported functionality.
// NOTE: this Facebook configuration munging could possibly break on changes to the facebook plugin or Cordova
function updateFacebookIds() {

    var jsonFormat = { 'indent_char': '\t', 'indent_size': 1 }

    var facebookAndroid = gulp.src('./plugins/android.json', {base: './'})
        .pipe(jsonEditor(function(json) {
            if(json.installed_plugins['com.phonegap.plugins.facebookconnect'] && json.config_munge.files['res/values/facebookconnect.xml']) {
                var array = json.config_munge.files['res/values/facebookconnect.xml'].parents['/*']
                array[0].xml = '<string name=\"fb_app_id\">' + config.facebookAppId + '</string>'
                array[1].xml = '<string name=\"fb_app_name\">' + config.facebookAppName + '</string>'

                var plugin = json.installed_plugins['com.phonegap.plugins.facebookconnect']
                plugin.APP_ID = config.facebookAppId
                plugin.APP_NAME = config.facebookAppName
            }
            return json
        }, jsonFormat))
        .pipe(gulp.dest('.'))

    var facebookIOS = gulp.src('./plugins/ios.json', {base: './'})
        .pipe(jsonEditor(function(json) {
            if(json.installed_plugins['com.phonegap.plugins.facebookconnect'] && json.config_munge.files['*-Info.plist']) {
                var parents = json.config_munge.files['*-Info.plist'].parents
                parents.FacebookAppID[0].xml = '<string>' + config.facebookAppId + '</string>'
                parents.FacebookDisplayName[0].xml = '<string>' + config.facebookAppName + '</string>'
                parents.CFBundleURLTypes[0].xml = '<array><dict><key>CFBundleURLSchemes</key><array><string>fb' + config.facebookAppId + '</string></array></dict></array>'

                var plugin = json.installed_plugins['com.phonegap.plugins.facebookconnect']
                plugin.APP_ID = config.facebookAppId
                plugin.APP_NAME = config.facebookAppName
            }
            return json
        }, jsonFormat))
        .pipe(gulp.dest('.'))

    return [facebookAndroid, facebookIOS]
}
/*
 | --- CSS -----------------------------------------------
 */

gulp.task('sass', function(done) {
    gulp.src(paths.sass)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sass())
        .pipe(minifyCss({keepSpecialComments: 0}))
        .pipe(sourcemaps.write('/maps'))
        .pipe(gulp.dest('./www/'))
        .on('end', done);
});

gulp.task('css', function(done) {
    gulp.src(paths.css)
        .pipe(concat('app.css'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.css' }))
        .pipe(gulp.dest('./www/'))
        .on('end', done);
});

gulp.task('lib-css', function(done) {
    gulp.src(bowerFiles(bowerConf).concat(paths.libCss))
        .pipe(filter(['**/*.css', '!ionic.css'])) // exclude the ionic.css built from the sass task
        //.pipe(print())
        .pipe(concat('lib.css'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest('./www/'))
        .on('end', done);
});


/*
 | --- JS -------------------------------------------------
 */

gulp.task('lib', function(done) {
    var stream = gulp.src(paths.libJs.concat(bowerFiles(bowerConf)))
        .pipe(filter('**/*.js'))
        //.pipe(print())
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init({loadMaps: true}))
        //.pipe(angularFilesort())
        .pipe(concat('lib.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('./www/'))
        .on('end', done);
});



// http://thegreenpizza.github.io/2013/05/25/building-minification-safe-angular.js-applications/
gulp.task('js', ['envConfig'], function(done) {
    var stream = gulp.src(paths.js)
        //.pipe(print())
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init({loadMaps: true}));
    if(env === 'prod')
        stream.pipe(removeCode({ production: true }));

    stream.pipe(babel({}))
        .pipe(ngAnnotate())
        .pipe(angularFilesort())
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('/maps'))
        .pipe(gulp.dest('./www/'))
        .on('end', done);
});

/**  TypeScript tasks - for further reading see https://weblogs.asp.net/dwahlin/creating-a-typescript-workflow-with-gulp */

/**
 * Generates the app.d.ts references file dynamically from all application *.ts files.
 */
gulp.task('gen-ts-refs', function () {
    var target = gulp.src(paths.tsAppReferences);
    var sources = gulp.src(paths.ts, {read: false});
    return target.pipe(inject(sources, {
        starttag: '//{',
        endtag: '//}',
        transform: function (filepath) {
            return '/// <reference path="../..' + filepath + '" />';
        }
    })).pipe(gulp.dest(paths.tsTypings));
});

/**
 * Lint all custom TypeScript files.
 */
gulp.task('ts-lint', function () {
    return gulp.src(paths.ts).pipe(tslint()).pipe(tslint.report('prose'));
});

/**
 * Compile TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile-ts', function () {
    var sourceTsFiles = [paths.ts,                //path to typescript files
        paths.tsLibDefinitions, //reference to library .d.ts files
        paths.tsAppReferences,     //reference to app.d.ts files
        paths.tsTestsExclusion] // exclude the test files

    var tsResult = gulp.src(sourceTsFiles)
        .pipe(sourcemaps.init())
        .pipe(tsc({
            target: 'ES6',
            declarationFiles: false,
            noExternalResolve: true
        }))

    tsResult.dts.pipe(gulp.dest(paths.tsOutput));
    return tsResult.js
        .pipe(babel({}))
        .pipe(ngAnnotate())
        .pipe(concat('app.ts.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('/maps'))
        .pipe(gulp.dest('./www/'))
});


/*
 | --- HTML templates ------------------------------------------
 */

gulp.task('templates', function(done) {
    gulp.src(paths.templates)
        .pipe(minifyHtml({ empty: true, spare: true, quotes: true }))
        .pipe(ngHtml2Js({ moduleName: 'templates'}))
        .pipe(concat('templates.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./www/'))
        .on('end', done);
});


/*
 | --- Testing ------------------------------------------
 */
gulp.task('test', function() {
    // Be sure to return the stream
    // NOTE: Using the fake './foobar' so as to run the files
    // listed in karma.conf.js INSTEAD of what was passed to
    // gulp.src !
    return gulp.src('./foobar')
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            console.log(err);
            this.emit('end'); //instead of erroring the stream, end it
        });
});

gulp.task('autotest', function() {
    return gulp.watch(['app/js/**/*.js'], ['test']);
});

/*
 | --- Fonts ------------------------------------------
 */

gulp.task('fonts', function() {
    return gulp.src(paths.fonts)
        //.pipe(print())
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest('./www/fonts/'));
});


/*
 | --- Images ------------------------------------------
 */
gulp.task('images', function() {
    return gulp.src(paths.images)
        .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
        .pipe(gulp.dest('./www/img/'))
        //.pipe(notify({ message: 'Images task complete' }))
        ;
});



gulp.task('watch', function() {
    gulp.watch(paths.config, ['envConfig']);
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.js, ['js']);
    gulp.watch(paths.lib, ['lib']);
    gulp.watch(paths.images, ['images']);
    gulp.watch(paths.templates, ['templates']);
    gulp.watch(paths.ts, ['ts-lint', 'compile-ts', 'gen-ts-refs']);
});

gulp.task('http', function() {

    var port = 8100
    http.createServer(
        ecstatic({ root: __dirname + '/www' })
    ).listen(port)
        .on('listening', function() {
            console.log('http server running at http://localhost:' + port)

            browserSync.init({
                proxy: "http://localhost:8100"
            }, { ui: { port: 8200 }})

            gulp.watch("www/*.css").on('change', function(change) {
                console.log('streaming ' + change.path)
                gulp.src(change.path)
                    .pipe(browserSync.stream())
            })
        })
});

gulp.task('install', ['git-check'], function() {
    return bower.commands.install()
        .on('log', function(data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function(done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});

var onError = function (err) {
    gutil.beep();
    console.log(err);
};
