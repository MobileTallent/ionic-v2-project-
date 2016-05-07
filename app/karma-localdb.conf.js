// Karma configuration
// Generated on Sun Mar 29 2015 11:13:33 GMT+0800 (AWST)

module.exports = function(config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine'],


		// list of files / patterns to load in the browser. The ordering is important
		files: [
			'node_modules/babel-es6-polyfill/browser-polyfill.js',
			'www/lib.js', // 3rd party components
			'bower_components/angular-mocks/angular-mocks.js', // must be loaded after angular, and match the angular version
			'www/parse-1.4.0.min.js',
			'www/lodash.min.js',
			'www/templates.js', // application code
			'www/app.js', // application code
			'www/app.ts.js', // application code
			'app/js/service-localdb_test.js' // tests
		],


		// list of files to exclude
		exclude: [],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'app/js/**/*_test.js': ['babel']
		},

		// This is to retain the line numbers from the original ES6 code
		babelPreprocessor: {
			options: {
				sourceMap: 'inline',
				retainLines: true // NEW LINE
			},
			filename: function (file) {
				return file.originalPath.replace(/\.js$/, '.es5.js');
			},
			sourceFileName: function (file) {
				return file.originalPath;
			}
		},


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress'],


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['Chrome'
			//, 'Safari'
		],


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false
	});
};
