module.exports=function(grunt){
    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),
        uglify:{
            options:{
                banner:'/*\n   <%= pkg.name %> ,version <%= pkg.version %> ,updated on <%= grunt.template.today("yyyy-mm-dd") %>\n   <%= pkg.description %>\n\n   <%= pkg.homepage %>\n */\n\n'
            },
            build:{
                src:'module.js',
                dest:'module.min.js'
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('default',['uglify']);
};