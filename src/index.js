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

    function UmxGruntConfig(require, grunt, options) {
        this.options = options || {};
        this.require = require;
        if (!this.require) {
            throw new Error('The "require" method is not defined.');
        }
        this.grunt = grunt;
        if (!this.grunt) {
            throw new Error('A Grunt instance is not defined.');
        }
        var pkg = this.grunt.file.readJSON('package.json');
        pkg.appname = this.options.appname || pkg.appname || pkg.name;
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
        var banner = this.getBanner(options);
        var webpack = this.require('webpack');
        var bowerLibs = this._getBowerDir(options);
        this.config.webpack = {
            main : {
                entry : this._getMainFile(options),
                output : {
                    path : this._getDistDir(options),
                    filename : pkg.appname + '.js',
                    library : pkg.appname,
                    libraryTarget : options.target || 'umd'
                },
                externals : options.externals || [ /^[a-z\-0-9]+$/ ],
                resolve : {
                    modulesDirectories : [ "web_modules", "node_modules",
                            "bower_components", "libs" ].concat(bowerLibs),
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

    UmxGruntConfig.prototype.initMochaTest = function(options) {
        options = options || {};
        this.config.mochaTest = {
            test : {
                options : {
                    reporter : 'spec'
                },
                src : options.src || //
                [ 'test/**/spec_*.js', 'test/**/*_spec.js' ]
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
    };

    UmxGruntConfig.prototype.initBrowserify = function(options) {
        options = options || {};
        this.config.browserify = {
            standalone : {
                src : [ this._getMainFile(options) ],
                dest : this._getDistDir(options) + '/<%= pkg.appname %>.js',
                options : {
                    exclude : options.exclude || [],
                    bundleOptions : {
                        standalone : '<%= pkg.appname %>'
                    }
                }
            }
        };
        this.grunt.loadNpmTasks('grunt-browserify');
    };

    UmxGruntConfig.prototype.getBanner = function(options) {
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

    UmxGruntConfig.prototype.initUglify = function(options) {
        var banner = '/* \n * ' + this.getBanner(options) + ' */\n';
        var distDir = this._getDistDir(options);
        this.config.uglify = {
            options : {
                banner : banner
            },
            browser : {
                src : distDir + '/<%= pkg.appname %>.js',
                dest : distDir + '/<%= pkg.appname %>.min.js'
            }
        };
        this.grunt.loadNpmTasks('grunt-contrib-uglify');
    };

    UmxGruntConfig.prototype.initJshint = function(options) {
        this.config.jshint = {
            files : this._getSourceFiles(options),
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

    UmxGruntConfig.prototype.initWatch = function(options) {
        options = options || {};
        this.config.watch = {
            scripts : {
                files : this._getSourceFiles(options),
                tasks : options.tasks || [ 'test' ],
                options : {
                    spawn : options.spawn !== false,
                    interrupt : true,
                },
            },
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

    UmxGruntConfig.prototype._getMainFile = function(options) {
        var pkg = this.config.pkg;
        options = options || {};
        return options.main || './' + pkg.main + '/index.js';
    };

    UmxGruntConfig.prototype._getSourceFiles = function(options) {
        options = options || {};
        if (options.files)
            return options.files;
        var pkg = this.config.pkg;
        var Path = require('path');
        var srcMask = Path.resolve(pkg.main || 'src', './**/*.js');
        return [ srcMask, 'test/**/*.js' ];
    };

    UmxGruntConfig.prototype._getBowerDir = function(optoins) {
        var bowerConf;
        try {
            bowerConf = this.grunt.file.readJSON('.bowerrc');
        } catch (err) {
            bowerConf = {};
        }
        if (!bowerConf.directory) {
            try {
                bowerConf = this.grunt.file.readJSON('bower.json');
            } catch (err) {
            }
        }
        if (!bowerConf.directory) {
            bowerConf.directory = './libs';
        }
        var result = [ bowerConf.directory ];
        return result;
    };

    UmxGruntConfig.prototype._getDistDir = function(options) {
        options = options || {};
        return options.dist || './dist';
    };

    return UmxGruntConfig;
})(this);
