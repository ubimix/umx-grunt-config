var UmxGruntConfig = require('./');
module.exports = function(grunt) {
    var configurator = new UmxGruntConfig(require, grunt);
    configurator.initBump();
    configurator.initJshint();
    configurator.registerBumpTasks();
    grunt.registerTask('default', [ 'jshint' ]);
    grunt.registerTask('commit', [ 'build', 'bump-commit' ]);
    grunt.initConfig(configurator.config);
}