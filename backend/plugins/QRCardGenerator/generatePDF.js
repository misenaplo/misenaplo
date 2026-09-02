const PDFDocument = require('pdfkit');
const generateCard = require('./generateCard');

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 20;
const SPACING = 10;

const LAYOUTS = {
    1:  { cols: 1, rows: 1 },
    2:  { cols: 1, rows: 2 },
    4:  { cols: 2, rows: 2 },
    6:  { cols: 2, rows: 3 },
    8:  { cols: 2, rows: 4 },
    9:  { cols: 3, rows: 3 },
    12: { cols: 3, rows: 4 },
    14: { cols: 2, rows: 7 },
    16: { cols: 4, rows: 4 },
};

module.exports = async function (candidates, perPage) {
    const layout = LAYOUTS[perPage];
    if (!layout) throw new Error('Érvénytelen elrendezés');

    const { cols, rows } = layout;
    const availableWidth = A4_WIDTH - 2 * MARGIN;
    const availableHeight = A4_HEIGHT - 2 * MARGIN;

    const cardSize = Math.min(
        (availableWidth - (cols - 1) * SPACING) / cols,
        (availableHeight - (rows - 1) * SPACING) / rows
    );

    const totalGridWidth = cols * cardSize + (cols - 1) * SPACING;
    const totalGridHeight = rows * cardSize + (rows - 1) * SPACING;
    const offsetX = (A4_WIDTH - totalGridWidth) / 2;
    const offsetY = (A4_HEIGHT - totalGridHeight) / 2;

    return new Promise(async (resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false });
        const buffers = [];

        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        for (let i = 0; i < candidates.length; i++) {
            if (i % perPage === 0) {
                doc.addPage();
            }

            const slotIndex = i % perPage;
            const col = slotIndex % cols;
            const row = Math.floor(slotIndex / cols);

            const x = offsetX + col * (cardSize + SPACING);
            const y = offsetY + row * (cardSize + SPACING);

            const dataUrl = await generateCard(candidates[i].name, candidates[i].id);
            const base64 = dataUrl.split('base64,')[1];
            const buffer = Buffer.from(base64, 'base64');

            doc.image(buffer, x, y, { width: cardSize, height: cardSize });
        }

        doc.end();
    });
};
