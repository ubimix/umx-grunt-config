module.exports = (function() {
    'use strict';

    // conf.initBump();
    // conf.initMochaTest();
    // conf.initBrowserify();
    // conf.initUglify();
    // conf.initJshint();
    // conf.initWatch();
    // conf.initWebpack();
    // conf.getBanner();

    function UmxGruntConfig(grunt, options) {
        this.options = options || {};
        this.grunt = grunt;
        if (!this.grunt) {
            throw new Error('A Grunt instance is not defined.');
        }
        var pkg = this.grunt.file.readJSON('package.json');
        pkg.appname = this.options.appname || pkg.name;
        this.config = {
            pkg : pkg
        };
    }

    UmxGruntConfig.prototype.registerBumpTasks = function() {
        this.grunt.registerTask('inc', [ 'bump-only' ]);
        this.grunt.registerTask('incMinor', [ 'bump-only:minor' ]);
        this.grunt.registerTask('incMajor', [ 'bump-only:major' ]);
    };

    UmxGruntConfig.prototype.initBump = function(options) {
        options = options || {};
        this.config.bump = {
            options : {
                files : [ 'package.json', 'bower.json' ],
                updateConfigs : [],
                commit : true,
                commitMessage : 'Release v%VERSION%',
                commitFiles : [ '.' ],
                createTag : true,
                tagName : 'v%VERSION%',
                tagMessage : 'Version %VERSION%',
                push : false,
                pushTo : 'upstream',
                gitDescribeOptions : '--tags --always --abbrev=1 --dirty=-d'
            }
        };
        this.grunt.loadNpmTasks('grunt-bump');
        if (options.tasks !== false) {
            this.registerBumpTasks();
        }
    };

    UmxGruntConfig.prototype.initWebpack = function(options) {
        options = options || {};
        var pkg = this.config.pkg;
        var banner = this.getBanner();
        var require = this.options.require;
        if (!require) {
            throw new Error('"options.require" is not defined.');
        }
        var webpack = require('webpack');
        this.config.webpack = {
            main : {
                entry : './src/index',
                output : {
                    path : './dist',
                    filename : pkg.appname + '.js',
                    library : pkg.appname,
                    libraryTarget : options.target || 'umd'
                },
                externals : options.externals || [ /^[a-z\-0-9]+$/ ],
                resolve : {
                    modulesDirectories : [ "web_modules", "node_modules",
                            "bower_components", "libs" ],
                    extensions : [ "", ".webpack-loader.js", ".web-loader.js",
                            ".loader.js", ".js" ],
                    packageMains : [ "webpackLoader", "webLoader", "loader",
                            "main" ]
                },
                plugins : [
                        new webpack.BannerPlugin(banner),
                        new webpack.ResolverPlugin(
                                new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(
                                        "bower.json", [ "main" ])) ]
            }
        };
        this.grunt.loadNpmTasks('grunt-webpack');
    };

    UmxGruntConfig.prototype.initMochaTest = function() {
        this.config.mochaTest = {
            test : {
                options : {
                    reporter : 'spec'
                },
                src : [ 'test/**/spec_*.js', 'test/**/*_spec.js' ]
            }
        };
        this.grunt.loadNpmTasks('grunt-mocha-test');
    };

    UmxGruntConfig.prototype.initKarma = function() {
        this.config.karma = {
            unit : {
                configFile : 'karma.conf.js',
                reporters : 'progress'
            },
            // continuous integration mode: run tests once in PhantomJS browser.
            continuous : {
                configFile : 'karma.conf.js',
                singleRun : true,
                reporters : 'progress',
                runnerPort : 9998
            }
        };
        this.grunt.loadNpmTasks('grunt-karma');
    },

    UmxGruntConfig.prototype.initBrowserify = function(options) {
        options = options || {};
        this.config.browserify = {
            standalone : {
                src : [ 'src/index.js' ],
                dest : './dist/<%= pkg.appname %>.js',
                options : {
                    exclude : options.exclude || [],
                    bundleOptions : {
                        standalone : '<%= pkg.appname %>'
                    }
                }
            },
        };
        this.grunt.loadNpmTasks('grunt-browserify');
    };

    UmxGruntConfig.prototype.getBanner = function() {
        // Project configuration.
        var pkg = this.config.pkg;
        var licenses = '';
        (pkg.licenses || []).forEach(function(l) {
            if (licenses.length) {
                licenses += ', ';
            }
            licenses += l ? l.type || '' : '';
        });
        if (licenses.length) {
            licenses = ' | License: ' + licenses + ' ';
        }
        return '<%= pkg.appname %> v<%= pkg.version %>' + licenses + '\n';
    };

    UmxGruntConfig.prototype.initUglify = function() {
        var banner = '/* \n * ' + this.getBanner() + ' */\n';
        this.config.uglify = {
            options : {
                banner : banner
            },
            browser : {
                src : 'dist/<%= pkg.appname %>.js',
                dest : 'dist/<%= pkg.appname %>.min.js'
            }
        };
        this.grunt.loadNpmTasks('grunt-contrib-uglify');
    };

    UmxGruntConfig.prototype.initJshint = function() {
        this.config.jshint = {
            files : [ 'gruntfile.js', 'src/**/*.js', 'test/**/*.js' ],
            // configure JSHint (documented at
            // http://www.jshint.com/docs/)
            options : {
                // more options here if you want to override JSHint
                // defaults
                globals : {
                    console : true,
                    module : true,
                    require : true
                }
            }
        };
        this.grunt.loadNpmTasks('grunt-contrib-jshint');
    };

    UmxGruntConfig.prototype.initWatch = function() {
        this.config.jshint = {
            files : [ 'gruntfile.js', 'src/**/*.js', 'test/**/*.js' ],
            // configure JSHint (documented at
            // http://www.jshint.com/docs/)
            options : {
                // more options here if you want to override JSHint
                // defaults
                globals : {
                    console : true,
                    module : true,
                    require : true
                }
            }
        };
        this.grunt.loadNpmTasks('grunt-contrib-watch');
    };

    UmxGruntConfig.prototype.registerTasks = function() {
        // this would be run by typing "grunt test" on the command line
        this.grunt.registerTask('test', [ 'jshint', 'mochaTest' ]);
        // Default task(s).
        // the default task can be run just by typing "grunt" on the command
        // line
        this.grunt.registerTask('default', [ 'jshint', 'mochaTest',
                'browserify', 'uglify' ]);
    };

    return UmxGruntConfig;
})(this);
