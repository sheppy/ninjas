import Phaser from "phaser";
import VisibilityPolygon from "visibility-polygon";
import Shape from "clipper-js";


export default class LineOfSightPlugin extends Phaser.Plugin {
    constructor(game, parent) {
        super(game, parent);

        this.settings = {
            shadowColor: 'rgb(50, 50, 50)'
        };
    }

    init(settings = {}) {
        Object.assign(this.settings, settings);

        // The visibility polygon
        this.visibilityBMD = this.game.add.bitmapData(this.game.width, this.game.height);
        this.visibilityBMD.context.fillStyle = "rgb(255, 255, 255)";
        this.visibilityBMD.context.strokeStyle = "rgb(255, 255, 255)";


        // TODO: Use this to mask the line of sight
        let radSize = 500;
        this.radialBMD = this.game.add.bitmapData(radSize, radSize);

        let radGrad = this.radialBMD.context.createRadialGradient(radSize / 2, radSize / 2, 10, radSize / 2, radSize / 2, radSize / 2);
        radGrad.addColorStop(0, "transparent");
        radGrad.addColorStop(0.05, "rgba(255, 255, 255, 0.0025)");
        radGrad.addColorStop(0.1, "rgba(255, 255, 255, 0.01)");
        radGrad.addColorStop(0.25, "rgba(255, 255, 255, 0.0625)");
        radGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.25)");
        radGrad.addColorStop(0.75, "rgba(255, 255, 255, 0.5625)");
        radGrad.addColorStop(1, "rgba(255, 255, 255, 1)");

        this.radialBMD.context.fillStyle = radGrad;
        this.radialBMD.context.fillRect(0, 0, radSize, radSize);


        // The shadow
        this.shadowBMD = this.game.add.bitmapData(this.game.width, this.game.height);
        this.shadowBMD.context.fillStyle = this.settings.shadowColor;
        this.shadowBMD.context.fillRect(0, 0, this.game.width, this.game.height);


        // The final image
        this.shadowImage = this.game.add.image(0, 0, this.shadowBMD);
        this.shadowImage.blendMode = Phaser.blendModes.MULTIPLY;
        this.shadowImage.fixedToCamera = true;

        this.mergeBMD = this.game.add.bitmapData(this.game.width, this.game.height);

        // Turn map in to polygons
        this.polygons = this.createVisiblePolygonFromTileMapLayer(this.settings.tileMapLayer);
    }

    createVisiblePolygonFromTileMapLayer(tileMapLayer) {
        let polygons = [];

        if (!tileMapLayer) {
            // Add world bounds?
            polygons.push([[-1, -1], [this.game.world.width + 1, -1], [this.game.world.width + 1, this.game.world.height + 1], [-1, this.game.world.height + 1]]);
            return polygons;
        }

        for (let r = 0, rm = tileMapLayer.layer.data.length; r < rm; r++) {
            let row = tileMapLayer.layer.data[r];

            for (let c = 0, cm = row.length; c < cm; c++) {
                let tile = row[c];

                if (!tile.canCollide) {
                    let x = tile.x * tile.width;
                    let y = tile.y * tile.height;

                    polygons.push(new Phaser.Polygon(
                        x, y,
                        x + tile.width, y,
                        x + tile.width, y + tile.height,
                        x, y + tile.height
                    ));
                }
            }
        }

        // Join polygons
        let shape = new Shape(polygons.map(poly => poly.points), true, true);
        // polygons = shape.removeOverlap().mapToLower().map(points => new Phaser.Polygon(points));
        polygons = shape.removeOverlap().mapToLower().map(points => points.map(point => [point.x, point.y]));

        // Add world bounds?
        // polygons.push([[-1, -1], [this.world.width + 1, -1], [this.world.width + 1, this.world.height + 1], [-1, this.world.height + 1]]);

        // polygons.push(new Phaser.Polygon(
        //     -1, -1,
        //     this.world.width + 1, -1,
        //     this.world.width + 1, this.world.height + 1,
        //     -1, this.world.height + 1
        // ));


        return polygons;
    }

    updateLineOfSite(x, y) {
        // Determine the new visibility polygon
        var visibility = this.createLightPolygon(x, y);

        // Clear the visibility bitmap
        this.visibilityBMD.clear();

        if (!visibility) {
            return;
        }

        // Draw the visibility polygon
        this.visibilityBMD.context.beginPath();
        this.visibilityBMD.context.moveTo(visibility[0][0] - this.game.camera.x, visibility[0][1] - this.game.camera.y);

        for (let i = 1; i <= visibility.length; i++) {
            let point = visibility[i % visibility.length];
            this.visibilityBMD.context.lineTo(point[0] - this.game.camera.x, point[1] - this.game.camera.y);
        }

        this.visibilityBMD.context.closePath();
        this.visibilityBMD.context.fill();


        // Clear the merge bitmap
        this.mergeBMD.clear();

        let radX = x - this.game.camera.x - (this.radialBMD.width / 2);
        let radY = y - this.game.camera.y - (this.radialBMD.height / 2);

        // Start with the circle
        this.mergeBMD.copy(
            this.radialBMD, // Source
            0, 0,           // Source pos
            null, null,     // Source size
            radX, radY      // Dest pos
        );

        // Copy visibility masked by the circle
        this.mergeBMD.copy(
            this.visibilityBMD, // Source
            radX, radY,         // Source pos
            this.radialBMD.width, this.radialBMD.height,    // Source size
            radX, radY,         // Dest pos
            this.radialBMD.width, this.radialBMD.height,    // Dest size
            null, null, null,   // Rotate
            null, null,         // Scale
            null,               // Alpha
            "source-out"
        );

        // Make the world dark
        this.shadowBMD.context.fillRect(0, 0, this.game.width, this.game.height);

        // Copy the merged light visibility across
        this.shadowBMD.copyRect(this.mergeBMD, {
            x: 0, y: 0,
            width: this.game.width,
            height: this.game.height
        }, 0, 0, 1, "source-over");
    }

    createLightPolygon(x, y) {
        let segments = VisibilityPolygon.convertToSegments(this.polygons);
        segments = VisibilityPolygon.breakIntersections(segments);

        let position = [x, y];

        if (VisibilityPolygon.inPolygon(position, this.polygons[this.polygons.length - 1])) {
            // return VisibilityPolygon.computeViewport(position, segments, [this.game.camera.x, this.game.camera.y], [this.game.camera.x + this.game.width, this.game.camera.y + this.game.height]);
            return VisibilityPolygon.compute(position, segments);
        }

        return null;
    }

}

