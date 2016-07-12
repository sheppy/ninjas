/*eslint smells/no-complex-chaining:0 */
const path = require("path");
const gulp = require("gulp");
const config = require("./config");

// Copy HTML
gulp.task("html", () => {
    return gulp
        .src(path.join(config.dir.src, config.dir.client, "index.html"))
        .pipe(gulp.dest(config.dir.dist));
});
