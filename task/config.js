const config = {
    glob: {
        all: "**/*",
        html: "**/*.html",
        js: "**/*.js"
    },
    dir: {
        src: "src",
        dist: "lib",
        js: "js",
        client: "client",
        assets: "assets",
        test: "test",
        tasks: "task",
        coverage: "coverage"
    },
    file: {
        indexJs: "index.js",
        vendorJs: "vendor.js",
        gulpfile: "gulpfile.js"
    }
};


module.exports = config;
