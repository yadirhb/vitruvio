module.exports = function (grunt) {
    var name = "vitruvio";
    var buildPath = "build/";
    var distPath = "../dist/";

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: [buildPath]
        },
        concat: {
            options: {
                banner: '/**\n' +
                ' * @module <%= pkg.name%>\n' +
                ' * @version <%= pkg.version %>\n' +
                ' * @description <%= pkg.description %>\n' +
                ' * @author <%= pkg.authors[0] %>\n' +
                ' * @released <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' */\n'
            },
            main: {
                src: [],
                dest: buildPath + name + "-npm/index.js"
            }
        },
        min: {
            main: {
                src: '<%= concat.main.dest%>',
                dest: buildPath + '<%= pkg.name%>-<%= pkg.version %>.min.js'
            }
        },
        copy: {
            main: {
                src: buildPath + name + "-npm/index.js",
                dest: buildPath + '<%= pkg.name%>-<%= pkg.version %>.concat.js'
            },
            package: {
                src: "package.json",
                dest: buildPath + name + "-npm/package.json"
            },
            readme: {
                src: "../README.md",
                dest: buildPath + name + "-npm/README.md"
            },
            license: {
                src: "../LICENSE",
                dest: buildPath + name + "-npm/LICENSE"
            },
            distConcat: {
                src: buildPath + name + "-npm/index.js",
                dest: distPath + '<%= pkg.version %>/<%= pkg.name%>.concat.js'
            },
            latestConcat: {
                src: buildPath + name + "-npm/index.js",
                dest: distPath + '<%= pkg.name%>-latest.concat.js'
            },
            distMin: {
                src: buildPath + '<%= pkg.name%>-<%= pkg.version %>.min.js',
                dest: distPath + '<%= pkg.version %>/<%= pkg.name%>.min.js'
            },
            latestMin: {
                src: buildPath + '<%= pkg.name%>-<%= pkg.version %>.min.js',
                dest: distPath + '<%= pkg.name%>-latest.min.js'
            },
            module: {
                expand: true,
                cwd: buildPath + name + "-npm/",
                src: '**',
                dest: 'node_modules/' + name
            }
        }
    });

    grunt.registerTask("prepareModules", "Finds and prepares packages for concatenation.", function () {
        var srcPaths = ["src"];
        // get the current concat object from initConfig
        var concat = grunt.config.get('concat') || {};

        concat.main.src.push("res/header.js");
        concat.main.src.push("res/support.js");
        concat.main.src.push("res/extensions.js");
        concat.main.src.push("res/functions.js");
        concat.main.src.push("res/namespaces.js");

        concat.main.src.push("libs/Core.js");

        var sourceSet = [];
        grunt.file.recurse("src/", function callback(abspath) {
            sourceSet.push(abspath);
        });

        concat.main.src = concat.main.src.concat(sourceSet.sort());

        concat.main.src.push("res/final-exposures.js");
        concat.main.src.push("res/footer.js");

        /*for (var dist in concat) {
         if (concat.hasOwnProperty(dist) && dist != "main") concat[dist].src = concat.main.src;
         }*/

        //add module subtasks to the concat task in initConfig
        grunt.config.set('concat', concat);
    });

    // Load the plugin that provides the "concat" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    // Load the plugin that provides the "min" task.
    grunt.loadNpmTasks('grunt-yui-compressor');
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify')
    // Load the plugin that provides the "copy" task.
    grunt.loadNpmTasks('grunt-contrib-copy');
    // Load the plugin that provides the "clean" task.
    grunt.loadNpmTasks('grunt-contrib-clean');
    // Default task(s).
    grunt.registerTask('default', ['prepareModules', 'clean', 'concat', 'min', 'copy']);
};