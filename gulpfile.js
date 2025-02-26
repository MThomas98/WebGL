const gulp = require("gulp");
const ts = require("gulp-typescript")
const source = require("vinyl-source-stream");
const browerify = require("browserify");
const clean = require("gulp-clean")

function cleanOutput(cb)
{
    gulp.src("src/out")
        .pipe(clean());

    gulp.src("js")
        .pipe(clean());
}

function buildRectangles(cb)
{
    // cleanOutput();

    const tsconfig = ts.createProject("tsconfig.json");
    tsconfig.src()
        .pipe(tsconfig())
        .pipe(gulp.dest("src/out"));

    browerify(
    {
        basedir: ".",
        debug: true,
        entries: ["src/out/rectangles.js"]
    })
        .bundle()
        .pipe(source("bundle.js"))
        .pipe(gulp.dest("js"));

    cb();
}

function buildCube(cb)
{
    // cleanOutput();

    const tsconfig = ts.createProject("tsconfig.json");
    tsconfig.src()
        .pipe(tsconfig())
        .pipe(gulp.dest("src/out"));

    browerify(
    {
        basedir: ".",
        debug: true,
        entries: ["src/out/cube.js"]
    })
        .bundle()
        .pipe(source("bundle.js"))
        .pipe(gulp.dest("js"));

    cb();
}

exports.default = buildCube;

exports.rectangles = buildRectangles;
exports.cube = buildCube;

// exports.clean = cleanOutput;
