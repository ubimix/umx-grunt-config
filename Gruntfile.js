var UmxGruntConfig = require('./');
module.exports = function(grunt) {
    var configurator = new UmxGruntConfig(require, grunt);
    configurator.initBump();
    configurator.initJshint();
    configurator.registerBumpTasks();
    grunt.registerTask('build', [ 'jshint' ]);
    grunt.registerTask('default', [ 'build' ]);
    grunt.registerTask('commit', [ 'build', 'bump-commit' ]);
    grunt.initConfig(configurator.config);
}