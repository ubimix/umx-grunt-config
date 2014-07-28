var UmxGruntConfig = require('./');
module.exports = function(grunt) {
    var configurator = new UmxGruntConfig(require, grunt);
    configurator.initBump();
    configurator.initJshint();
    configurator.registerBumpTasks();
    grunt.registerTask('build', [ 'jshint', 'mochaTest' ]);
    grunt.registerTask('default', [ 'jshint' ]);
    grunt.initConfig(configurator.config);
}