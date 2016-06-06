/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', [ ]);
    grunt.registerTask('build', [ 'default', 'clean', 'concat', 'uglify' ]);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: [ 'build' ],
        concat: {
            rtc: {
                src: [ 'src/rtc/**/*.js', 'src/main.js' ],
                dest: 'dist/phenix-rtc.js'
            }
        },
        uglify: {
            minify: {
                files: {
                    'dist/phenix-rtc.min.js': [ 'dist/phenix-rtc.js' ]
                }
            }
        }
    });
};
