/**
 * js/board.js
 * 3D Board and Highlights Manager
 */

const ChessBoard3D = (() => {
    let boardGroup = null;
    let tiles = []; // 2D array [fileIndex][rankIndex] = mesh
    let borderMesh = null;
    
    // Highlights group to store selection, moves, and check meshes
    let highlightsGroup = null;
    let coordinateLabelsGroup = null;

    /**
     * Map chessboard 2D indices to 3D Vector3 positions
     * @param {number} file - 0 ('a') to 7 ('h')
     * @param {number} rank - 0 ('8') to 7 ('1')
     */
    function getCellPosition(file, rank) {
        // file 0 -> x = -3.5, file 7 -> x = 3.5
        // rank 0 -> z = -3.5, rank 7 -> z = 3.5
        const x = file - 3.5;
        const z = rank - 3.5;
        return new THREE.Vector3(x, 0.12, z); // sit perfectly on top of the tiles (tile top face is at 0.12)
    }

    /**
     * Generates a 2D dynamic canvas texture with coordinates text ('A'-'H', '1'-'8')
     */
    function createCoordinateTexture(text, isLightText = true) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Transparent background
        ctx.clearRect(0, 0, 128, 128);

        // Styling
        ctx.font = 'bold 84px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (isLightText) {
            ctx.fillStyle = '#f5f5f7';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        } else {
            ctx.fillStyle = '#111116';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        }
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;

        ctx.fillText(text, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    /**
     * Creates the materials for the chessboard tiles depending on the theme
     */
    function getTileMaterials(theme) {
        let whiteMat, blackMat, borderMat;

        switch (theme) {
            case 'cyber':
                // White Tiles: Dark glass with Cyan border and subtle glowing faces
                whiteMat = new THREE.MeshPhysicalMaterial({
                    color: 0x091c24,
                    roughness: 0.1,
                    metalness: 0.2,
                    transparent: true,
                    opacity: 0.85,
                    transmission: 0.3,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.05,
                    emissive: 0x002c38,
                    emissiveIntensity: 0.25
                });
                // Black Tiles: Dark glass with Pink border
                blackMat = new THREE.MeshPhysicalMaterial({
                    color: 0x24091a,
                    roughness: 0.1,
                    metalness: 0.2,
                    transparent: true,
                    opacity: 0.85,
                    transmission: 0.3,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.05,
                    emissive: 0x3d001f,
                    emissiveIntensity: 0.25
                });
                // Cyber Outer Border Frame: carbon dark metal
                borderMat = new THREE.MeshStandardMaterial({
                    color: 0x08080c,
                    roughness: 0.4,
                    metalness: 0.8,
                    emissive: 0x001122,
                    emissiveIntensity: 0.1
                });
                break;

            case 'metallic':
                // White Tiles: Brushed gold
                whiteMat = new THREE.MeshStandardMaterial({
                    color: 0xd4af37,
                    roughness: 0.18,
                    metalness: 0.95
                });
                // Black Tiles: High-gloss polished Silver Steel
                blackMat = new THREE.MeshStandardMaterial({
                    color: 0xdfdfeb,
                    roughness: 0.08,
                    metalness: 0.9
                });
                // Metallic Outer Border Frame: Brushed Titanium
                borderMat = new THREE.MeshStandardMaterial({
                    color: 0x1d1d24,
                    roughness: 0.3,
                    metalness: 0.95
                });
                break;

            case 'classic':
            default:
                // White Tiles: Polished Carrara White Marble
                whiteMat = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.06,
                    metalness: 0.0,
                    clearcoat: 0.8,
                    clearcoatRoughness: 0.05
                });
                // Black Tiles: Polished Nero Marquina Black Marble
                blackMat = new THREE.MeshStandardMaterial({
                    color: 0x16161c,
                    roughness: 0.06,
                    metalness: 0.0,
                    clearcoat: 0.8,
                    clearcoatRoughness: 0.05
                });
                // Sleek Modern Dark Ebony Border Frame
                borderMat = new THREE.MeshStandardMaterial({
                    color: 0x0f0f13,
                    roughness: 0.25,
                    metalness: 0.1,
                    clearcoat: 0.4
                });
                break;
        }

        return { whiteMat, blackMat, borderMat };
    }

    /**
     * Initializes and returns the fully assembled 3D board scene object
     */
    function createBoard(scene, theme) {
        if (boardGroup) scene.remove(boardGroup);

        boardGroup = new THREE.Group();
        boardGroup.name = "chessboard";

        highlightsGroup = new THREE.Group();
        highlightsGroup.name = "highlights";
        boardGroup.add(highlightsGroup);

        coordinateLabelsGroup = new THREE.Group();
        coordinateLabelsGroup.name = "coordinates";
        boardGroup.add(coordinateLabelsGroup);

        const mats = getTileMaterials(theme);

        // 1. Render 8x8 squares grid (taller tiles prevent Z-fighting)
        const tileGeom = new THREE.BoxGeometry(0.97, 0.12, 0.97); // 0.97 size leaves tiny chamfer border gaps
        tiles = Array(8).fill(null).map(() => Array(8).fill(null));

        for (let file = 0; file < 8; file++) {
            for (let rank = 0; rank < 8; rank++) {
                const isWhite = (file + rank) % 2 === 0;
                const tileMesh = new THREE.Mesh(tileGeom, isWhite ? mats.whiteMat : mats.blackMat);
                
                const pos = getCellPosition(file, rank);
                tileMesh.position.set(pos.x, 0.06, pos.z); // centered at 0.06 (top is at 0.12)
                tileMesh.receiveShadow = true;
                tileMesh.name = `tile_${file}_${rank}`;
                tileMesh.userData = { file, rank, isWhite };

                boardGroup.add(tileMesh);
                tiles[file][rank] = tileMesh;
            }
        }

        // 2. Outer Border Frame (thinner and slightly lower to prevent Z-fighting with tiles)
        // Board is 8x8 cells, each size 1.0 (from -4.0 to 4.0 border outer edge)
        // Outer frame should be 8.8 x 8.8 size, with depth of 0.08
        const borderGeom = new THREE.BoxGeometry(9.0, 0.08, 9.0);
        borderMesh = new THREE.Mesh(borderGeom, mats.borderMat);
        borderMesh.position.set(0, 0.04, 0); // centered at 0.04 (top is at 0.08)
        borderMesh.receiveShadow = true;
        boardGroup.add(borderMesh);

        // Add visual embellishments for Cyber Theme
        if (theme === 'cyber') {
            // Neon glowing line accents on borders
            const outlineGeom = new THREE.BoxGeometry(9.02, 0.02, 9.02);
            const outlineMat = new THREE.MeshBasicMaterial({
                color: 0x00f0ff,
                wireframe: true,
                transparent: true,
                opacity: 0.6
            });
            const neonOutline = new THREE.Mesh(outlineGeom, outlineMat);
            neonOutline.position.set(0, 0.07, 0);
            boardGroup.add(neonOutline);
        }

        // 3. Render Alphanumeric Coordinate Decals
        const isCyber = theme === 'cyber';
        const labelFiles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const labelRanks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        // Helper to place plane decals on the borders
        const labelGeom = new THREE.PlaneGeometry(0.3, 0.3);

        // Files along bottom border (rank 1 side, z = 4.25) and top border (rank 8 side, z = -4.25)
        for (let file = 0; file < 8; file++) {
            const labelText = labelFiles[file];
            const texLight = createCoordinateTexture(labelText, true);
            const texDark = createCoordinateTexture(labelText, !isCyber);
            
            const matTop = new THREE.MeshBasicMaterial({ map: texLight, transparent: true, side: THREE.DoubleSide });
            const matBottom = new THREE.MeshBasicMaterial({ map: texDark, transparent: true, side: THREE.DoubleSide });

            // Bottom border (White's side, z = 4.22)
            const planeB = new THREE.Mesh(labelGeom, matBottom);
            planeB.position.set(file - 3.5, 0.09, 4.25); // sits on border frame (top at 0.08)
            planeB.rotation.x = -Math.PI / 2;
            planeB.rotation.z = 0; // facing White
            coordinateLabelsGroup.add(planeB);

            // Top border (Black's side, z = -4.22)
            const planeT = new THREE.Mesh(labelGeom, matTop);
            planeT.position.set(file - 3.5, 0.09, -4.25);
            planeT.rotation.x = -Math.PI / 2;
            planeT.rotation.z = Math.PI; // rotated for Black
            coordinateLabelsGroup.add(planeT);
        }

        // Ranks along left border (file A side, x = -4.25) and right border (file H side, x = 4.25)
        for (let rank = 0; rank < 8; rank++) {
            const labelText = labelRanks[rank];
            const texLight = createCoordinateTexture(labelText, true);
            const texDark = createCoordinateTexture(labelText, !isCyber);

            const matLeft = new THREE.MeshBasicMaterial({ map: texDark, transparent: true, side: THREE.DoubleSide });
            const matRight = new THREE.MeshBasicMaterial({ map: texLight, transparent: true, side: THREE.DoubleSide });

            // Left border (x = -4.25)
            const planeL = new THREE.Mesh(labelGeom, matLeft);
            planeL.position.set(-4.25, 0.09, rank - 3.5);
            planeL.rotation.x = -Math.PI / 2;
            planeL.rotation.z = -Math.PI / 2; // rotated
            coordinateLabelsGroup.add(planeL);

            // Right border (x = 4.25)
            const planeR = new THREE.Mesh(labelGeom, matRight);
            planeR.position.set(4.25, 0.09, rank - 3.5);
            planeR.rotation.x = -Math.PI / 2;
            planeR.rotation.z = Math.PI / 2; // rotated
            coordinateLabelsGroup.add(planeR);
        }

        scene.add(boardGroup);
        return boardGroup;
    }

    /**
     * Clear all cell highlights (selected squares, valid moves, check)
     */
    function clearHighlights() {
        if (!highlightsGroup) return;
        while(highlightsGroup.children.length > 0) {
            const obj = highlightsGroup.children[0];
            highlightsGroup.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        }
    }

    /**
     * Highlight the currently selected square in pulsing electric blue
     */
    function highlightSelected(file, rank, theme) {
        if (!highlightsGroup) return;
        
        const pos = getCellPosition(file, rank);
        const geom = new THREE.BoxGeometry(0.96, 0.02, 0.96);
        
        let color = 0x00f0ff; // bright cyber blue
        if (theme === 'classic') color = 0xd4af37; // classic gold

        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.45
        });

        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(pos.x, 0.13, pos.z); // sits slightly above tiles (top is at 0.12)
        mesh.name = "highlight_selected";
        
        // Save animate values
        mesh.userData = { time: 0 };
        highlightsGroup.add(mesh);
    }

    /**
     * Highlights valid moves for the selected piece (soft green rings)
     * @param {Array} movesList - array of move objects containing {file, rank, capture}
     */
    function highlightValidMoves(movesList, theme) {
        if (!highlightsGroup) return;

        movesList.forEach(mv => {
            const pos = getCellPosition(mv.file, mv.rank);
            let geom, mat;

            const color = mv.capture ? 0xff3838 : 0x2ec4b6; // red for captures, emerald green for moves

            if (mv.capture) {
                // Captures: outline border highlight
                geom = new THREE.BoxGeometry(0.96, 0.02, 0.96);
                mat = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.35,
                    wireframe: false
                });
            } else {
                // Soft green circular target indicators
                geom = new THREE.RingGeometry(0.12, 0.22, 32);
                mat = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.8,
                    side: THREE.DoubleSide
                });
            }

            const mesh = new THREE.Mesh(geom, mat);
            if (mv.capture) {
                mesh.position.set(pos.x, 0.13, pos.z); // sits slightly above tiles
            } else {
                mesh.position.set(pos.x, 0.13, pos.z);
                mesh.rotation.x = -Math.PI / 2; // lie flat on tile
            }
            mesh.name = "highlight_move";
            highlightsGroup.add(mesh);
        });
    }

    /**
     * Highlights the king's cell in flashing red when in Check
     */
    function highlightCheck(file, rank) {
        if (!highlightsGroup) return;

        // Check if check highlight already exists to avoid stacking
        const existing = highlightsGroup.children.find(c => c.name === "highlight_check");
        if (existing) return;

        const pos = getCellPosition(file, rank);
        const geom = new THREE.BoxGeometry(0.96, 0.03, 0.96);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.55
        });

        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(pos.x, 0.135, pos.z); // sits slightly above tiles
        mesh.name = "highlight_check";
        mesh.userData = { time: 0 };
        highlightsGroup.add(mesh);
    }

    /**
     * Animate glowing elements inside highlights (run in requestAnimationFrame)
     */
    function animateHighlights(delta) {
        if (!highlightsGroup) return;

        highlightsGroup.children.forEach(mesh => {
            if (mesh.name === "highlight_selected") {
                mesh.userData.time += delta * 4;
                // Pulsing height and opacity
                mesh.material.opacity = 0.35 + Math.sin(mesh.userData.time) * 0.15;
            } else if (mesh.name === "highlight_check") {
                mesh.userData.time += delta * 8;
                // Rapid flashing alert
                mesh.material.opacity = 0.3 + Math.sin(mesh.userData.time) * 0.25;
            }
        });
    }

    return {
        createBoard,
        getCellPosition,
        clearHighlights,
        highlightSelected,
        highlightValidMoves,
        highlightCheck,
        animateHighlights
    };
})();
