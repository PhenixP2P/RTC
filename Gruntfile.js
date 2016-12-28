/**
 * Copyright 2016 PhenixP2P Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-webpack');

    grunt.registerTask('default', []);
    grunt.registerTask('build', ['default', 'clean', 'webpack', 'uglify']);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['build'],
        concat: {
            rtc: {
                src: ['src/rtc/**/*.js', 'src/main.js'],
                dest: 'dist/phenix-rtc.js'
            }
        },
        webpack: {
            'phenix-web-sdk': {
                context: __dirname + '/src',
                entry: './main',
                externals: [
                    {
                    }
                ],
                output: {
                    libraryTarget: 'umd',
                    path: __dirname + '/dist',
                    filename: 'phenix-rtc.js'
                },
                resolve: {
                    modulesDirectories: ['3p', 'node_modules']
                }
            }
        },
        uglify: {
            minify: {
                files: {
                    'dist/phenix-rtc.min.js': ['dist/phenix-rtc.js']
                }
            }
        }
    });
};