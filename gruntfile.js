var markdown = require('node-markdown').Markdown;
var fs = require('fs');

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-ddescribe-iit');
    grunt.loadNpmTasks('grunt-bower-task');

    // Project configuration.
    grunt.util.linefeed = '\n';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bower: {
            install: {
                //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
            }
        },
        html2js: {
            options: {
                // custom options, see below
                base: 'src/templates',
                module: 'storyboard-templates'
            },
            main: {
                src: ['src/templates/*.html'],
                dest: 'dist/templates/templates.js'
            },
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/ngStoryboard.js', 'src/storyboard-ctrl.js', 'src/slider-ctrl.js',
                     'src/grid-ctrl.js', 'dist/templates/*.js', 'src/date-extensions.js'],
                dest: 'dist/<%= pkg.name %>.js'
            },
        },
        copy: {  //Copy CSS
            main: {
                src: 'src/css/*',
                dest: 'dist/css/',
                flatten: true,
                expand:true
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/*.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['bower', 'html2js', 'concat', 'copy', 'uglify']);

}