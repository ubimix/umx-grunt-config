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

    function UmxGruntConfig(require, grunt) {
        this.grunt = grunt;
        this.require = require;
        this.config = {
            pkg : this.grunt.file.readJSON('package.json')
        };
    }

    UmxGruntConfig.prototype.registerBumpTasks = function() {
        this.grunt.registerTask('inc', [ 'bump-only' ]);
        this.grunt.registerTask('incMinor', [ 'bump-only:minor' ]);
        this.grunt.registerTask('incMajor', [ 'bump-only:major' ]);
        this.grunt.registerTask('commit', [ 'build', 'bump-commit' ]);
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
                push : true,
                pushTo : 'upstream',
                gitDescribeOptions : '--tags --always --abbrev=1 --dirty=-d'
            }
        };
        this.grunt.loadNpmTasks('grunt-bump');
        if (options.tasks !== false) {
            this.registerBumpTasks();
        }
    };

    UmxGruntConfig.prototype.initWebpack = function() {
        var pkg = this.config.pkg;
        function getConf(filename, plugins) {
            var result = {
                entry : './src/index',
                output : {
                    path : './dist',
                    filename : filename,
                    library : pkg.name,
                    libraryTarget : 'umd'
                },
                externals : [ /^[a-z\-0-9]+$/ ]
            };
            if (plugins) {
                result.plugins = plugins;
            }
            return result;
        }

        var banner = this.getBanner();

        this.config.webpack = {
            main : getConf(pkg.name + '.js'),
            minified : getConf(pkg.name + '.min.js', [ this.require(
                    'webpack/lib/BannerPlugin')(banner) ])
        };
        this.grunt.loadNpmTasks('grunt-webpack');
    };

    UmxGruntConfig.prototype.initMochaTest = function() {
        this.config.mochaTest = {
            test : {
                options : {
                    reporter : 'spec'
                },
                src : [ 'tests/**/Test*.js' ]
            }
        };
        this.grunt.loadNpmTasks('grunt-mocha-test');
    };

    UmxGruntConfig.prototype.initBrowserify = function() {
        this.config.browserify = {
            standalone : {
                src : [ 'src/index.js' ],
                dest : './dist/<%= pkg.name %>.js',
                options : {
                    exclude : [ 'underscore' ],
                    bundleOptions : {
                        standalone : '<%= pkg.name %>'
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
        return '<%= pkg.name %> v<%= pkg.version %>' + licenses;
    };

    UmxGruntConfig.prototype.initUglify = function() {
        var banner = '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n';
        this.config.uglify = {
            options : {
                banner : banner
            },
            browser : {
                src : 'dist/<%= pkg.name %>.js',
                dest : 'dist/<%= pkg.name %>.min.js'
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
