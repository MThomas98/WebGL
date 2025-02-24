const gulp = require("gulp");
const ts = require("gulp-typescript")
const source = require("vinyl-source-stream");
const browerify = require("browserify");

function build(cb)
{
    const tsconfig = ts.createProject("tsconfig.json");
    tsconfig.src()
        .pipe(tsconfig())
        .pipe(gulp.dest("js"));

    browerify(
    {
        basedir: ".",
        debug: true,
        entries: ["js/webgl.js"]
    })
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("js"));

    cb();
}

exports.default = build;