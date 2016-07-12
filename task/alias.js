const gulp = require("gulp");

gulp.task("lint", ["js-lint"]);

gulp.task("dev", ["html", "assets", "js-dev"]);

gulp.task("prod", ["html", "assets", "js-prod"]);

gulp.task("default", ["prod"]);
