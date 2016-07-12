/*eslint smells/no-complex-chaining:0 */
const path = require("path");
const gulp = require("gulp");
const config = require("./config");

// Copy assets
gulp.task("assets", () => {
    return gulp
        .src(path.join(config.dir.src, config.dir.client, config.dir.assets, config.glob.all))
        .pipe(gulp.dest(path.join(config.dir.dist, config.dir.assets)));
});
