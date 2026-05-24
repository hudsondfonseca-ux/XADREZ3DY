/**
 * js/pieces.js
 * Procedural 3D Chess Piece Model Generator using Three.js Geometries
 */

const ChessPieces = (() => {
    // Cache geometries to optimize rendering and memory
    const geometryCache = {};

    /**
     * Common base points shared by lathe geometries (Pawn, Rook, Bishop, Queen, King)
     */
    function getBasePoints() {
        const points = [];
        // Bottom pad
        points.push(new THREE.Vector2(0.0, 0.0));
        points.push(new THREE.Vector2(0.35, 0.0));
        points.push(new THREE.Vector2(0.35, 0.05));
        // Base flare
        points.push(new THREE.Vector2(0.32, 0.08));
        points.push(new THREE.Vector2(0.28, 0.1));
        points.push(new THREE.Vector2(0.28, 0.12));
        points.push(new THREE.Vector2(0.31, 0.14));
        points.push(new THREE.Vector2(0.31, 0.16));
        points.push(new THREE.Vector2(0.24, 0.18));
        return points;
    }

    /**
     * Creates Pawn Geometry
     */
    function createPawnGeometry() {
        if (geometryCache['pawn']) return geometryCache['pawn'];

        const points = getBasePoints();
        // Neck/Stem
        points.push(new THREE.Vector2(0.18, 0.22));
        points.push(new THREE.Vector2(0.15, 0.35));
        // Collar
        points.push(new THREE.Vector2(0.19, 0.40));
        points.push(new THREE.Vector2(0.19, 0.42));
        points.push(new THREE.Vector2(0.14, 0.44));
        
        // Head (Sphere part of Lathe)
        // Draw a circle arc from collar to top center
        const segments = 12;
        const radius = 0.16;
        const centerX = 0;
        const centerY = 0.58;
        for (let i = 0; i <= segments; i++) {
            const angle = -Math.PI / 3 + (i / segments) * (Math.PI * 4/3);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            if (x >= 0) { // Keep on right side for lathe Y-axis rotation
                points.push(new THREE.Vector2(x, y));
            }
        }
        points.push(new THREE.Vector2(0.0, 0.74));

        const geometry = new THREE.LatheGeometry(points, 32);
        geometryCache['pawn'] = geometry;
        return geometry;
    }

    /**
     * Creates Rook Geometry
     */
    function createRookGeometry() {
        if (geometryCache['rook']) return geometryCache['rook'];

        const points = getBasePoints();
        // Stem
        points.push(new THREE.Vector2(0.20, 0.22));
        points.push(new THREE.Vector2(0.18, 0.45));
        // Flared Top
        points.push(new THREE.Vector2(0.25, 0.55));
        points.push(new THREE.Vector2(0.25, 0.65));
        points.push(new THREE.Vector2(0.22, 0.65));
        points.push(new THREE.Vector2(0.22, 0.60));
        points.push(new THREE.Vector2(0.0, 0.60));

        const geometry = new THREE.LatheGeometry(points, 32);
        geometryCache['rook'] = geometry;
        return geometry;
    }

    /**
     * Creates Bishop Geometry
     */
    function createBishopGeometry() {
        if (geometryCache['bishop']) return geometryCache['bishop'];

        const points = getBasePoints();
        // Stem
        points.push(new THREE.Vector2(0.18, 0.22));
        points.push(new THREE.Vector2(0.14, 0.45));
        // Collar
        points.push(new THREE.Vector2(0.20, 0.50));
        points.push(new THREE.Vector2(0.15, 0.53));
        
        // Mitre head (Oval-like profile)
        const segments = 12;
        const startY = 0.53;
        const height = 0.35;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const y = startY + t * height;
            // Width profile based on sine wave
            const x = 0.02 + Math.sin(t * Math.PI) * 0.17;
            points.push(new THREE.Vector2(x, y));
        }
        points.push(new THREE.Vector2(0.0, startY + height));

        const geometry = new THREE.LatheGeometry(points, 32);
        geometryCache['bishop'] = geometry;
        return geometry;
    }

    /**
     * Creates Queen Geometry
     */
    function createQueenGeometry() {
        if (geometryCache['queen']) return geometryCache['queen'];

        const points = getBasePoints();
        // Stem
        points.push(new THREE.Vector2(0.20, 0.22));
        points.push(new THREE.Vector2(0.14, 0.50));
        // Collar
        points.push(new THREE.Vector2(0.22, 0.55));
        points.push(new THREE.Vector2(0.16, 0.58));
        // Upper Stem
        points.push(new THREE.Vector2(0.15, 0.65));
        // Flared Crown (Chalice shape)
        points.push(new THREE.Vector2(0.28, 0.85));
        points.push(new THREE.Vector2(0.28, 0.88));
        points.push(new THREE.Vector2(0.18, 0.88));
        points.push(new THREE.Vector2(0.0, 0.85));

        const geometry = new THREE.LatheGeometry(points, 32);
        geometryCache['queen'] = geometry;
        return geometry;
    }

    /**
     * Creates King Geometry
     */
    function createKingGeometry() {
        if (geometryCache['king']) return geometryCache['king'];

        const points = getBasePoints();
        // Stem
        points.push(new THREE.Vector2(0.22, 0.22));
        points.push(new THREE.Vector2(0.15, 0.55));
        // Collar
        points.push(new THREE.Vector2(0.24, 0.60));
        points.push(new THREE.Vector2(0.17, 0.63));
        // Crown Dome
        points.push(new THREE.Vector2(0.18, 0.75));
        points.push(new THREE.Vector2(0.24, 0.90));
        points.push(new THREE.Vector2(0.15, 0.94));
        points.push(new THREE.Vector2(0.0, 0.94));

        const geometry = new THREE.LatheGeometry(points, 32);
        geometryCache['king'] = geometry;
        return geometry;
    }

    /**
     * Creates Knight Extrude Shape & Base
     */
    function createKnightGeometry() {
        if (geometryCache['knight']) return geometryCache['knight'];

        // 1. Lathed Base (similar to base points, but stops flat at the collar)
        const basePoints = getBasePoints();
        basePoints.push(new THREE.Vector2(0.22, 0.22));
        basePoints.push(new THREE.Vector2(0.20, 0.24));
        basePoints.push(new THREE.Vector2(0.0, 0.24));
        const baseGeom = new THREE.LatheGeometry(basePoints, 32);

        // 2. Extruded Horse Head Shape
        const shape = new THREE.Shape();
        // Starting at bottom-left corner of the horse body
        shape.moveTo(-0.18, 0.0);
        // Back curve of neck
        shape.quadraticCurveTo(-0.26, 0.25, -0.22, 0.45);
        // Back of ears
        shape.quadraticCurveTo(-0.14, 0.60, -0.06, 0.62);
        // Ear point 1
        shape.lineTo(-0.03, 0.70);
        shape.lineTo(0.01, 0.60);
        // Head crown
        shape.quadraticCurveTo(0.05, 0.58, 0.08, 0.56);
        // Snout top
        shape.quadraticCurveTo(0.20, 0.50, 0.26, 0.36);
        // Nose tip
        shape.quadraticCurveTo(0.28, 0.30, 0.22, 0.28);
        // Mouth
        shape.quadraticCurveTo(0.12, 0.28, 0.15, 0.22);
        // Jaw
        shape.quadraticCurveTo(0.20, 0.16, 0.12, 0.12);
        // Front neck chest
        shape.quadraticCurveTo(0.02, 0.06, -0.18, 0.0);

        const extrudeSettings = {
            depth: 0.16,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 1,
            bevelSize: 0.015,
            bevelThickness: 0.02
        };

        const headGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        // Center the head geometry horizontally (X and Z) and offset Y to sit on collar
        headGeom.center();
        headGeom.translate(0, 0.44, 0); // sits on base

        // Combine base and extruded head into a single BufferGeometry
        // We do this by merging or we can return a group. Using a group is easier and safer
        // because we don't need external BufferGeometryUtils.
        geometryCache['knight'] = { baseGeom, headGeom };
        return geometryCache['knight'];
    }

    /**
     * Generate the corresponding visual material based on color (White/Black) and active theme
     */
    function createMaterial(colorKey, theme, textureLoader = null) {
        const isWhite = colorKey === 'w';

        switch (theme) {
            case 'cyber':
                // Glowing, semi-transparent neon cyber glass
                return new THREE.MeshPhysicalMaterial({
                    color: isWhite ? 0x00f0ff : 0xff007f,
                    emissive: isWhite ? 0x002c38 : 0x3d001f,
                    roughness: 0.1,
                    metalness: 0.1,
                    transparent: true,
                    opacity: 0.82,
                    transmission: 0.6,
                    ior: 1.5,
                    thickness: 0.5,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.05,
                    shadowSide: THREE.DoubleSide
                });

            case 'metallic':
                // Polished brushed gold (White) vs high-gloss silver/chrome steel (Black)
                return new THREE.MeshStandardMaterial({
                    color: isWhite ? 0xd4af37 : 0xe0e0e0,
                    roughness: 0.12,
                    metalness: 0.95,
                    bumpScale: 0.05,
                    shadowSide: THREE.DoubleSide
                });

            case 'classic':
            default:
                // Highly polished White Marble (White) vs Polished black obsidian (Black)
                if (isWhite) {
                    // White Marble
                    return new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        roughness: 0.05,
                        metalness: 0.0,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.02,
                        shadowSide: THREE.DoubleSide
                    });
                } else {
                    // Polished Black Obsidian
                    return new THREE.MeshStandardMaterial({
                        color: 0x111115,
                        roughness: 0.05,
                        metalness: 0.1,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.02,
                        shadowSide: THREE.DoubleSide
                    });
                }
        }
    }

    /**
     * Create a composite, detailed THREE.Group representing a single chess piece
     * @param {string} type - 'p' (pawn), 'r' (rook), 'n' (knight), 'b' (bishop), 'q' (queen), 'k' (king)
     * @param {string} colorKey - 'w' (white), 'b' (black)
     * @param {string} theme - 'classic', 'metallic', 'cyber'
     */
    function createPieceMesh(type, colorKey, theme) {
        const group = new THREE.Group();
        group.name = `${colorKey}${type}`;
        
        const material = createMaterial(colorKey, theme);

        if (type === 'n') {
            // Knight is handled separately because it combines lathe base + extruded head
            const geoms = createKnightGeometry();
            const baseMesh = new THREE.Mesh(geoms.baseGeom, material);
            const headMesh = new THREE.Mesh(geoms.headGeom, material);
            baseMesh.castShadow = true;
            baseMesh.receiveShadow = true;
            headMesh.castShadow = true;
            headMesh.receiveShadow = true;
            group.add(baseMesh);
            group.add(headMesh);
            
            // Orient horse facing forward (towards opposite side)
            // White knights face Black side (default, Z-axis or rotated depending on board position)
            // We can orient them inside the board setup
        } else {
            // Lathed pieces (Pawn, Rook, Bishop, Queen, King)
            let geom;
            switch (type) {
                case 'p': geom = createPawnGeometry(); break;
                case 'r': geom = createRookGeometry(); break;
                case 'b': geom = createBishopGeometry(); break;
                case 'q': geom = createQueenGeometry(); break;
                case 'k': geom = createKingGeometry(); break;
            }

            const mesh = new THREE.Mesh(geom, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);

            // Add programmatically generated extra details to pieces
            if (type === 'r') {
                // Battlements for the Rook top (4 rectangular boxes)
                const battementGeom = new THREE.BoxGeometry(0.06, 0.06, 0.06);
                const r = 0.22; // collar radius
                const y = 0.65;  // rook height
                const angles = [0, Math.PI/2, Math.PI, Math.PI * 3/2];
                angles.forEach(angle => {
                    const batt = new THREE.Mesh(battementGeom, material);
                    batt.position.set(Math.cos(angle) * r, y + 0.03, Math.sin(angle) * r);
                    batt.rotation.y = -angle;
                    batt.castShadow = true;
                    batt.receiveShadow = true;
                    group.add(batt);
                });
            } else if (type === 'b') {
                // Spherical bead at Bishop mitre top
                const beadGeom = new THREE.SphereGeometry(0.04, 16, 16);
                const bead = new THREE.Mesh(beadGeom, material);
                bead.position.set(0, 0.90, 0);
                bead.castShadow = true;
                group.add(bead);
            } else if (type === 'q') {
                // Elegant ring of small golden/silver spheres around the crown
                const beadGeom = new THREE.SphereGeometry(0.024, 8, 8);
                const count = 10;
                const radius = 0.26;
                const y = 0.88;
                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 2;
                    const bead = new THREE.Mesh(beadGeom, material);
                    bead.position.set(Math.cos(angle) * radius, y + 0.01, Math.sin(angle) * radius);
                    bead.castShadow = true;
                    group.add(bead);
                }
                // Central large sphere
                const centerSphereGeom = new THREE.SphereGeometry(0.05, 16, 16);
                const centerSphere = new THREE.Mesh(centerSphereGeom, material);
                centerSphere.position.set(0, 0.90, 0);
                centerSphere.castShadow = true;
                group.add(centerSphere);
            } else if (type === 'k') {
                // A solid Cross on top of the King's crown
                const crossGroup = new THREE.Group();
                const vertGeom = new THREE.BoxGeometry(0.05, 0.16, 0.04);
                const horizGeom = new THREE.BoxGeometry(0.12, 0.05, 0.04);
                
                const vert = new THREE.Mesh(vertGeom, material);
                const horiz = new THREE.Mesh(horizGeom, material);
                vert.castShadow = true;
                horiz.castShadow = true;
                
                horiz.position.y = 0.04;
                crossGroup.add(vert);
                crossGroup.add(horiz);
                
                crossGroup.position.set(0, 1.05, 0);
                group.add(crossGroup);
            }
        }

        // Standard scaling for chess pieces relative to cells (cell width is typically 1.0 units)
        // Ensure pieces are properly proportioned
        let scale = 1.0;
        switch (type) {
            case 'p': scale = 0.85; break;
            case 'n': scale = 0.90; break;
            case 'r': scale = 0.92; break;
            case 'b': scale = 0.95; break;
            case 'q': scale = 0.98; break;
            case 'k': scale = 1.02; break;
        }
        group.scale.set(scale, scale, scale);

        return group;
    }

    return {
        createPieceMesh
    };
})();
