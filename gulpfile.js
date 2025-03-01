const gulp = require("gulp");
const browerify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const fancy_log = require("fancy-log")

const base = ["src/webgl.ts", "src/utils.ts"];

// function buildLighting()
// {
//     const entries = base;
//     entries.push("src/lighting.ts");

//     return browerify({
//         basedir: ".",
//         debug: true,
//         entries: entries,
//     })
//     .plugin(tsify)
//     .bundle()
//     .on("error", fancy_log)
//     .pipe(source("bundle.js"))
//     .pipe(gulp.dest("js"));
// }

function buildCube()
{
    const entries = base;
    entries.push("src/cube.ts");

    return browerify({
        basedir: ".",
        debug: true,
        entries: entries,
    })
    .plugin(tsify)
    .bundle()
    .on("error", fancy_log)
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("js"));
}

function buildRectangles()
{
    const entries = base;
    entries.push("src/rectangles.ts");

    return browerify({
        basedir: ".",
        debug: true,
        entries: entries,
    })
    .plugin(tsify)
    .bundle()
    .on("error", fancy_log)
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("js"));
}

gulp.task("default", buildCube);

gulp.task("rectangles", buildRectangles);
gulp.task("cube", buildCube);
// gulp.task("lighting", buildLighting);