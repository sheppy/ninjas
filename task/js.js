/*eslint smells/no-complex-chaining:0 */
const path = require("path");
const gulp = require("gulp");
const eslint = require("gulp-eslint");
const webpack = require("webpack-stream");

const webpackDevConfig = require("../webpack.config");
const webpackProdConfig = require("../webpack.production.config");
const config = require("./config");


gulp.task("js-dev", () => {
    return gulp
        .src(path.join(config.dir.src, config.dir.client, config.file.indexJs))
        .pipe(webpack(webpackDevConfig))
        .pipe(gulp.dest(path.join(config.dir.dist, config.dir.js)));
});

gulp.task("js-prod", () => {
    return gulp
        .src(path.join(config.dir.src, config.dir.client, config.file.indexJs))
        .pipe(webpack(webpackProdConfig))
        .pipe(gulp.dest(path.join(config.dir.dist, config.dir.js)));
});

gulp.task("js-lint", () => {
    return gulp
        .src([
            path.join(config.dir.src, config.dir.client, config.glob.js),
            path.join(config.dir.tasks, config.glob.js)
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
