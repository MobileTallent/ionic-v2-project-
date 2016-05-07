// Karma configuration for running an integration tests in /e2e/service-parse_test.js for the Parse service
// This test does not use the angular mocks and create a normal ParseService object

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
			'www/parse.js',
			'www/lib.js', // 3rd party components
			'www/lodash.min.js',
			'app/js/service-parse.js', // application code
			'e2e/e2eConfig.js', // test config
			'e2e/service-parse_test.js', // tests
		],


		// list of files to exclude
		exclude: [],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'e2e/*.js': ['babel'],
			'app/js/service-parse.js': ['babel']
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
