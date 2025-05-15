const { newPacker, PackingMode, PackingBin, SORT_AREA, GuillotineBssfSas,MaxRectsBl,MaxRectsBssf ,MaxRectsBaf,MaxRectsBlsf} = require('./index');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create output directories
const sheetsDir = path.join(__dirname, 'sheets');
const metadataDir = path.join(__dirname, 'metadata');

if (!fs.existsSync(sheetsDir)) fs.mkdirSync(sheetsDir, { recursive: true });
if (!fs.existsSync(metadataDir)) fs.mkdirSync(metadataDir, { recursive: true });

function getOrientation(width, height) {
    if (width > height) return "landscape";
    if (height > width) return "portrait";
    return "square";
}

function isRotationNeeded(sourceWidth, sourceHeight, targetWidth, targetHeight) {
    const sourceOrientation = getOrientation(sourceWidth, sourceHeight);
    const targetOrientation = getOrientation(targetWidth, targetHeight);
    return sourceOrientation !== targetOrientation;
}

// Define DPI for conversion
const DPI  = 72;


///
// designs = [
//     (r"/content/6491e6f460d26.png", int(11.5 * DPI), int(3.67 * DPI), 50),
//     (r"/content/Alejandra Front.png", int(5.01 * DPI), int(5.68 * DPI), 37),
//     (r"/content/Weaver - F.png", int(3.97 * DPI), int(9.20 * DPI), 50),
//     (r"/content/17154 - Front.png", int(8 * DPI), int(2.3 * DPI), 50),
// ]
 
// Input designs (file path, width in pixels, height in pixels, count)
const designs = [
    { path: path.join(__dirname, '6491e6f460d26.png'), width: Math.round(11.5 * DPI), height: Math.round(3.67 * DPI), count: 50 },
    { path: path.join(__dirname, 'Alejandra Front.png'), width: Math.round(5.01 * DPI), height: Math.round(5.68 * DPI), count: 37 },
    { path: path.join(__dirname, 'Weaver - F.png'), width: Math.round(3.97 * DPI), height: Math.round(9.20 * DPI), count: 50 },
    { path: path.join(__dirname, '17154 - Front.png'), width: Math.round(8 * DPI), height: Math.round(2.3 * DPI), count: 50 },
];

// Gang sheet size (in pixels)
const SHEET_WIDTH = (22.5 * DPI);
const SHEET_HEIGHT = (240 * DPI);
const SPACING = Math.round((0.1 * DPI));  // Adjust spacing to prevent overlaps
const ALLOW_ROTATION = true;

// Initialize packer
// Create a new packer instance with specific configuration
const packer = newPacker({
    mode: PackingMode.Offline,     // Can be Online or Offline
    binAlgo: PackingBin.BBF,      // Bin Best Fit algorithm
    // packAlgo: GuillotineBssfSas,  // Guillotine algorithm for rectangle placement
    packAlgo: MaxRectsBlsf,  // Guillotine algorithm for rectangle placement
    sortAlgo: SORT_AREA,          // Sort rectangles by area
    rotation: true                 // Allow rectangles to be rotated
});

// Add bins (gang sheets)
for (let i = 0; i < 1; i++) {  // Allow multiple sheets if needed
    packer.addBin(SHEET_WIDTH, SHEET_HEIGHT);
}

async function main() {
    // Add rectangles (designs)
    const imageInstances = [];
    for (const design of designs) {
        for (let i = 0; i < design.count; i++) {
            const rid = imageInstances.length;
            const normalised = [
                Math.min((design.width + SPACING) , (design.height + SPACING)),
                Math.max((design.width + SPACING) , (design.height + SPACING))
            ];
            packer.addRect(normalised[0], normalised[1], rid);
            imageInstances.push(design);
        }
    }
    packer.pack();

    // Process each gang sheet
    const sheetsMeta = [];

    let sheetIndex = 0;
    for (const bin of packer) {
        // Create canvas with white background
        const canvas = createCanvas(SHEET_WIDTH, SHEET_HEIGHT);
        const ctx = canvas.getContext('2d');

        // Set white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT);

        const metadata = [];
        let maxYUsed = 0;

        // Process each rectangle
        for (const rect of bin.rectangles) {
            const { x, y, width, height } = rect;
            const rid = rect.rid;
            const { path: filePath, width: w, height: h } = imageInstances[rid];

            try {
                const img = await loadImage(filePath);
                const rotated = isRotationNeeded(w, h, width, height);
                const pasteX = x + SPACING / 2;
                const pasteY = y + SPACING / 2;
                let drawWidth, drawHeight;

                // Save the current canvas state
                ctx.save();

                
                if (rotated) {
                    // Rotate and draw
                    ctx.save();
                    ctx.translate(pasteX + h / 2, pasteY + w / 2);
                    ctx.rotate(Math.PI / 2);
                    ctx.drawImage(img, -w / 2, -h / 2, w, h);
                    ctx.restore();
                    drawWidth = h;
                    drawHeight = w;
                } else {
                    ctx.drawImage(img, pasteX, pasteY, w, h);
                    drawWidth = w;
                    drawHeight = h;
                }

                ctx.strokeStyle = 'red';
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, width, height);
                // Restore the canvas state
                // ctx.restore();

                metadata.push({
                    image: path.basename(filePath),
                    x: x,
                    y: y,
                    width: drawWidth,
                    height: drawHeight,
                    rotated: rotated
                });

                const bottomEdge = y + height;
                if (bottomEdge > maxYUsed) {
                    maxYUsed = bottomEdge;
                }

            } catch (err) {
                console.error(`Error processing image ${filePath}:`, err);
                continue;
            }
        }

        // Save the canvas to a file
        const sheetPath = path.join(sheetsDir, `BEST_${sheetIndex + 1}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(sheetPath, buffer);

        // Save metadata
        const metaPath = path.join(metadataDir, `BEST_${sheetIndex + 1}.json`);
        // await fs.writeFile(metaPath, JSON.stringify(metadata, null, 4));

        sheetsMeta.push({
            sheet: sheetPath,
            metadata: metaPath,
            count: metadata.length
        });

        sheetIndex++;
        console.log(`✅ Generated ${sheetPath} gang sheets.`);

    }

    console.log(`✅ Generated ${sheetsMeta.length} gang sheets.`);
}

main();