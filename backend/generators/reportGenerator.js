const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  Header, Footer, PageNumber, UnderlineType, ImageRun
} = require('docx');
const fs   = require('fs');
const path = require('path');

// Logo path — place letterhead-logo.png in backend/ folder
const LOGO_PATH = path.join(__dirname, '..', 'letterhead-logo.png');

const TAHOMA = 'Tahoma';
const SZ    = 21;   // 10.5pt
const SZ_SM = 19;   // 9.5pt
const SZ_XS = 17;   // 8.5pt

// ── GAP colours ──────────────────────────────────────────────────────────────
const GAP_HIGH_BG   = 'FFCCCC';  // light red
const GAP_MED_BG    = 'FFE8CC';  // light orange
const GAP_LOW_BG    = 'FFFACC';  // light yellow
const GAP_HIGH_TEXT = 'CC0000';
const GAP_MED_TEXT  = 'CC5500';
const GAP_LOW_TEXT  = '886600';
const SUBHDR_BG     = 'E2EFDA';  // light green for share sub-headers
const SYNOHDR_BG    = 'D5E8F0';  // blue for Sy.No. headers

// ── Helpers ───────────────────────────────────────────────────────────────────
function txt(text, opts = {}) {
  return new TextRun({
    text: String(text || ''),
    font: TAHOMA,
    size: opts.size || SZ,
    bold: opts.bold || false,
    italics: opts.italic || false,
    color: opts.color || '000000',
    underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
  });
}

function para(runs, opts = {}) {
  const children = Array.isArray(runs) ? runs : [runs];
  return new Paragraph({
    alignment: opts.align || AlignmentType.BOTH,
    spacing: { after: opts.after ?? 100, before: opts.before ?? 0, line: 276, lineRule: 'auto' },
    children,
  });
}

function emptyRow() {
  return new Paragraph({ spacing: { after: 60 }, children: [txt('')] });
}

const border = (c = '888888') => ({ style: BorderStyle.SINGLE, size: 1, color: c });
const cellBorders = (c = 'AAAAAA') => ({ top: border(c), bottom: border(c), left: border(c), right: border(c) });
const noBorderAll = { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } };

function cell(content, width, opts = {}) {
  const children = typeof content === 'string'
    ? [new Paragraph({ alignment: opts.align || AlignmentType.LEFT, spacing: { after: 0 }, children: [txt(content, { bold: opts.bold, italic: opts.italic, color: opts.color, size: SZ_SM })] })]
    : (Array.isArray(content) ? content : [content]);
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: opts.noBorder ? noBorderAll : cellBorders(opts.borderColor || 'AAAAAA'),
    shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: VerticalAlign.TOP,
    columnSpan: opts.span,
    children,
  });
}

function headerCell(text, width, bg = 'D5E8F0') {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: cellBorders('888888'),
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [txt(text, { bold: true, size: SZ_SM })] })],
  });
}

function sectionHeading(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1F497D', space: 2 } },
    children: [txt(text, { bold: true, size: SZ, color: '1F497D' })],
  });
}

function labelValueNoTable(label, value) {
  return para([
    txt(label + ':  ', { bold: true, size: SZ_SM }),
    txt(value || 'N/A', { size: SZ_SM }),
  ], { align: AlignmentType.BOTH, after: 80 });
}

// ── WIDTHS  (9360 DXA total on A4) ───────────────────────────────────────────
const W_SL   = 480;
const W_DATE = 1100;
const W_PART = 6480;
const W_TYPE = 1300;
const W_TOTAL = W_SL + W_DATE + W_PART + W_TYPE; // 9360

// ── Document table rows ───────────────────────────────────────────────────────

// Normal document row — particulars JUSTIFIED, date/type CENTERED
function docRow(doc, slCounter) {
  return new TableRow({
    children: [
      cell(doc.slNo != null ? String(doc.slNo) : (slCounter ? String(slCounter) : ''), W_SL,
        { align: AlignmentType.CENTER }),
      cell(doc.date || '', W_DATE,
        { align: AlignmentType.CENTER }),
      // Particulars — justified, full word-wrap
      new TableCell({
        width: { size: W_PART, type: WidthType.DXA },
        borders: cellBorders(),
        margins: { top: 60, bottom: 60, left: 120, right: 100 },
        verticalAlign: VerticalAlign.TOP,
        children: [new Paragraph({
          alignment: AlignmentType.BOTH,
          spacing: { after: 0, line: 276, lineRule: 'auto' },
          children: [txt(doc.particulars || '', { size: SZ_SM })],
        })],
      }),
      cell(doc.documentType || 'Photostat', W_TYPE,
        { align: AlignmentType.CENTER }),
    ],
  });
}

// Survey Number header row (full width, blue background)
function syNoHeaderRow(syNo) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: W_TOTAL, type: WidthType.DXA },
        columnSpan: 4,
        borders: cellBorders('1F497D'),
        shading: { fill: SYNOHDR_BG, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 0 },
          children: [txt('Sy.No.' + syNo, { bold: true, size: SZ_SM, color: '1F497D' })],
        })],
      }),
    ],
  });
}

// Share sub-header row (e.g., "Lakshmaiah's Share") — green background
function subHeaderRow(text) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: W_TOTAL, type: WidthType.DXA },
        columnSpan: 4,
        borders: cellBorders('2D7D32'),
        shading: { fill: SUBHDR_BG, type: ShadingType.CLEAR },
        margins: { top: 50, bottom: 50, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 0 },
          children: [txt(text, { bold: true, italic: true, size: SZ_SM, color: '2D7D32' })],
        })],
      }),
    ],
  });
}

// GAP row — red/orange/yellow depending on severity
function gapRow(gap) {
  const bg   = gap.severity === 'HIGH' ? GAP_HIGH_BG : gap.severity === 'MEDIUM' ? GAP_MED_BG : GAP_LOW_BG;
  const col  = gap.severity === 'HIGH' ? GAP_HIGH_TEXT : gap.severity === 'MEDIUM' ? GAP_MED_TEXT : GAP_LOW_TEXT;
  const bord = gap.severity === 'HIGH' ? 'CC0000' : gap.severity === 'MEDIUM' ? 'CC5500' : '886600';
  const icon = gap.severity === 'HIGH' ? '⚠ ' : '• ';

  return new TableRow({
    children: [
      new TableCell({
        width: { size: W_TOTAL, type: WidthType.DXA },
        columnSpan: 4,
        borders: cellBorders(bord),
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 0 },
          children: [
            txt(icon + 'TITLE GAP: ', { bold: true, size: SZ_SM, color: col }),
            txt(gap.gapDescription || gap.description || '', { bold: false, italic: true, size: SZ_SM, color: col }),
          ],
        })],
      }),
    ],
  });
}

// Checklist row
function checkRow(label, value) {
  const disp  = value === true ? 'YES' : value === false ? 'NO' : value === null ? 'N/A' : String(value).toUpperCase();
  const color = disp === 'YES' ? '006400' : disp === 'NO' ? 'CC0000' : '555555';
  return new TableRow({
    children: [
      cell(label, 7000, { size: SZ_SM }),
      cell(disp, 2360, { align: AlignmentType.CENTER, bold: true, color }),
    ],
  });
}

// ── MAIN GENERATOR ────────────────────────────────────────────────────────────
// ── Vibrant elegant letterhead — logo LEFT corner, firm details RIGHT ──────────
function buildLetterhead(firmName) {
  const hasLogo = fs.existsSync(LOGO_PATH);

  // ── Logo cell (left) ──
  const logoCell = new TableCell({
    width: { size: 2600, type: WidthType.DXA },
    borders: { top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE}, left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE} },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 0, bottom: 0, left: 0, right: 200 },
    children: hasLogo ? [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0 },
        children: [new ImageRun({
          type: 'png',
          data: fs.readFileSync(LOGO_PATH),
          transformation: { width: 148, height: 70 },
          altText: { title: 'Aneesh Associates', description: 'Logo', name: 'Logo' }
        })]
      })
    ] : [
      new Paragraph({ spacing:{before:0,after:0}, children:[txt('ANEESH ASSOCIATES', {bold:true, size:22, color:'0D6B5E'})] })
    ]
  });

  // ── Firm details cell (right) ──
  const detailCell = new TableCell({
    width: { size: 6760, type: WidthType.DXA },
    borders: {
      top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE},
      left:{style:BorderStyle.SINGLE, size:18, color:'1A7F74', space:4}   // vibrant teal divider
    },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 0, bottom: 0, left: 160, right: 0 },
    children: [
      // Main firm name
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 20 },
        children: [txt('M/s. ANEESH ASSOCIATES PRIVATE LIMITED', { bold: true, size: 22, color: '0D1B4B' })]
      }),
      // Tagline
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 20 },
        children: [
          txt('Legal Advocates & Property Consultants  ', { size: SZ_XS, italic: true, color: '1A7F74' }),
          txt('|  SBI Empanelled  |  26+ Banking Partners', { size: SZ_XS, color: '888888' })
        ]
      }),
      // Address + contact — two lines
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0 },
        children: [
          txt('Unit No. 2001A, Y@Whitefield, Doddanekundi Industrial Area, Hoodi, Bangalore — 560 048', { size: SZ_XS, color: '444444' })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0 },
        children: [
          txt('Tel: 8618266924 / 8095669480   |   ', { size: SZ_XS, color: '555555' }),
          txt('bangalore@aneeshassociates.in   |   www.aneeshassociates.in', { size: SZ_XS, color: '0D6B5E' })
        ]
      }),
    ]
  });

  // ── Two-column letterhead table ──
  const headerTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2600, 6760],
    rows: [new TableRow({ children: [logoCell, detailCell] })],
    borders: { top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE}, left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE}, insideH:{style:BorderStyle.NONE}, insideV:{style:BorderStyle.NONE} }
  });

  // ── Bottom accent bar (teal + navy double line) ──
  const accentBar = new Paragraph({
    spacing: { before: 60, after: 0 },
    border: {
      bottom: { style: BorderStyle.THICK_THIN_MEDIUM_GAP, size: 6, color: '0D1B4B', space: 1 }
    },
    children: []
  });

  return [headerTable, accentBar];
}

// ── Title Tracing — flowing legal prose narrative, Sy.No.-wise ───────────────
function buildTitleTracingParas(titleFlow, propertyDetails) {
  const paras = [];
  const syNos = (propertyDetails?.scheduleProperty?.surveyNumbers || []).map(s => s.syNo);
  const sp    = propertyDetails?.scheduleProperty?.surveyNumbers?.[0] || {};
  const loc   = (sp.village || '') + ' Village, ' + (sp.hobli || '') + ', ' + (sp.taluk || '') + ', ' + (sp.district || '') + ' District';

  // Opening line
  paras.push(para([
    txt('From the above documents furnished for scrutiny, the title of the properties bearing ', { size: SZ_SM }),
    txt(syNos.map(s => 'Sy.No.' + s).join(', '), { bold: true, size: SZ_SM }),
    txt(' of ' + loc + ' traces as under:', { size: SZ_SM }),
  ], { align: AlignmentType.BOTH, after: 120 }));

  // ── COMMON DOCUMENTS — narrative paragraph ──
  const common = titleFlow.filter(tf => !tf.syNo || tf.syNo === 'common');
  if (common.length > 0) {
    // Build a single flowing narrative from common events
    let commonNarrative = common.map(tf => tf.event).join(' ');
    paras.push(para([
      txt('Common Title Documents:  ', { bold: true, underline: true, size: SZ_SM, color: '0D1B4B' }),
      txt(commonNarrative, { size: SZ_SM }),
    ], { align: AlignmentType.BOTH, after: 120 }));
  }

  // ── Per-Sy.No. NARRATIVE paragraphs ──
  const bySyNo = {};
  titleFlow.filter(tf => tf.syNo && tf.syNo !== 'common').forEach(tf => {
    if (!bySyNo[tf.syNo]) bySyNo[tf.syNo] = [];
    bySyNo[tf.syNo].push(tf);
  });

  Object.entries(bySyNo).forEach(([syNo, events]) => {
    // Sy.No. heading
    paras.push(para([
      txt('Sy.No.' + syNo + ':', { bold: true, underline: true, size: SZ_SM, color: '0D1B4B' }),
    ], { align: AlignmentType.LEFT, after: 60 }));

    // Weave all events into one continuous legal prose paragraph
    const narrative = events.map(tf => tf.event).join(' Thereafter, ');
    paras.push(para([
      txt(narrative, { size: SZ_SM }),
    ], { align: AlignmentType.BOTH, after: 100 }));
  });

  // ── Fallback — if no syNo tagging ──
  if (common.length === 0 && Object.keys(bySyNo).length === 0 && titleFlow.length > 0) {
    const allNarrative = titleFlow.map(tf => tf.event).join(' Thereafter, ');
    paras.push(para([txt(allNarrative, { size: SZ_SM })], { align: AlignmentType.BOTH, after: 100 }));
  }

  return paras;
}

async function generateLegalReport(data, outputPath, firmName = 'M/s. Aneesh Associates Private Limited', advocateName = 'Advocate') {
  const d   = data;
  const ph  = d.propertyDetails || {};
  const hdr = d.reportHeader || {};
  const sp  = ph.scheduleProperty || {};
  const cl  = d.checklistAnswers || {};
  const gaps = d.titleGaps || [];

  // ── Build document table rows ──────────────────────────────────────────────
  const docsRows = [];
  const docs = d.documentsFurnished || [];
  let slCounter = 0;
  let lastSyNo = null;

  // Table header
  docsRows.push(new TableRow({
    tableHeader: true,
    children: [
      headerCell('Sl.\nNo.', W_SL),
      headerCell('Date', W_DATE),
      headerCell('Particulars', W_PART),
      headerCell('Whether Original / Certified / Notarized / True Copy / Photostat', W_TYPE),
    ],
  }));

  for (const doc of docs) {
    // ── Survey Number group header ──
    if (doc.syNo && doc.syNo !== lastSyNo && !doc.isGap && !doc.isSubHeader) {
      docsRows.push(syNoHeaderRow(doc.syNo));
      lastSyNo = doc.syNo;
    }

    if (doc.isGap) {
      docsRows.push(gapRow(doc));
      continue;
    }
    if (doc.isSubHeader) {
      docsRows.push(subHeaderRow(doc.subHeaderText || ''));
      continue;
    }

    slCounter++;
    docsRows.push(docRow(doc, slCounter));
  }

  const docTable = new Table({
    width: { size: W_TOTAL, type: WidthType.DXA },
    columnWidths: [W_SL, W_DATE, W_PART, W_TYPE],
    rows: docsRows,
  });

  // ── Checklist table ────────────────────────────────────────────────────────
  const checkTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [7000, 2360],
    rows: [
      new TableRow({ tableHeader: true, children: [headerCell('Question', 7000, 'C5D9F1'), headerCell('Answer', 2360, 'C5D9F1')] }),
      checkRow('Whether Developer has acquired development rights vide JDA and GPA?', cl.developerAcquiredRightsViaJDA),
      checkRow('If yes, have the Landowners empowered the Developer to execute agreements/deeds for sale of units?', cl.landownersEmpoweredDeveloperToSell),
      new TableRow({ children: [cell('Empowering clause (Clause No.) in JDA/GPA:', 7000, { bold: true }), cell(cl.empoweringClause || 'N/A', 2360)] }),
      new TableRow({ children: [cell('Whether consideration is Revenue Sharing or Area Sharing?', 7000, { bold: true }), cell(cl.considerationType || 'N/A', 2360, { align: AlignmentType.CENTER })] }),
      checkRow('Has a Supplementary Agreement been executed for allocation of units?', cl.supplementaryAgreementExecuted),
      checkRow('Have ALL Landowners executed the Supplementary Agreement in their own capacities?', cl.allLandownersSignedSupplementary),
      checkRow('Has the land been converted for the use (Residential/Commercial) envisaged?', cl.landConverted),
      new TableRow({ children: [cell('Conversion Type:', 7000, { bold: true }), cell(cl.conversionType || 'N/A', 2360, { align: AlignmentType.CENTER })] }),
      new TableRow({ children: [cell("Are there Minors' rights in the property?", 7000, { bold: true }), cell(cl.minorsRights || 'NIL', 2360, { align: AlignmentType.CENTER })] }),
      new TableRow({ children: [cell('Is the project land subject to any Land Acquisition Orders?', 7000, { bold: true }), cell(cl.landAcquisitionOrders || 'NIL', 2360, { align: AlignmentType.CENTER })] }),
      new TableRow({ children: [cell('Is the project land subject to any Litigations?', 7000, { bold: true }), cell(cl.litigations || 'NIL', 2360, { align: AlignmentType.CENTER })] }),
      new TableRow({ children: [cell('Other Observations, if any:', 7000, { bold: true }), cell(cl.otherObservations || 'NIL', 2360, { align: AlignmentType.CENTER })] }),
      checkRow('Can SARFAESI be enforced on the property sought to be mortgaged?', cl.sarfaesiEnforceable),
    ],
  });

  // ── Approvals table ────────────────────────────────────────────────────────
  const appRows = [
    new TableRow({ tableHeader: true, children: [headerCell('#', 500), headerCell('Authority', 2200), headerCell('Type / No.', 2400), headerCell('Date', 1200), headerCell('Description', 3060)] }),
    ...(d.approvalsSanctions || []).map((a, i) => new TableRow({ children: [
      cell(String(i + 1), 500, { align: AlignmentType.CENTER }),
      cell(a.authority || '', 2200),
      cell((a.type || '') + (a.number ? ' — ' + a.number : ''), 2400),
      cell(a.date || '', 1200, { align: AlignmentType.CENTER }),
      cell(a.description || '', 3060),
    ]})),
  ];
  const appTable = new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [500, 2200, 2400, 1200, 3060], rows: appRows });

  // ── Title Gaps / NOTE section ─────────────────────────────────────────────
  function noteSection() {
    if (!gaps.length) return [];
    const noteRows = [
      new TableRow({ tableHeader: true, children: [
        headerCell('#', 400, 'FFCCCC'),
        headerCell('Sy.No.', 800, 'FFCCCC'),
        headerCell('Gap / Missing Document', 5760, 'FFCCCC'),
        headerCell('Document Required', 2400, 'FFCCCC'),
      ]}),
      ...gaps.map((g, i) => new TableRow({ children: [
        cell(String(g.slNo || i + 1), 400, { align: AlignmentType.CENTER, bg: i % 2 === 0 ? 'FFF5F5' : 'FFFFFF' }),
        cell(g.syNo || '—', 800, { align: AlignmentType.CENTER, bold: true, bg: i % 2 === 0 ? 'FFF5F5' : 'FFFFFF' }),
        cell(g.description || g.gapDescription || '', 5760, { bg: i % 2 === 0 ? 'FFF5F5' : 'FFFFFF' }),
        cell(g.documentRequired || 'To be called for', 2400, { italic: true, color: 'CC0000', bg: i % 2 === 0 ? 'FFF5F5' : 'FFFFFF' }),
      ]})),
    ];
    const noteTable = new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [400, 800, 5760, 2400], rows: noteRows });

    return [
      sectionHeading('NOTE — GAPS IN TITLE / DOCUMENTS TO BE CALLED FOR'),
      para([
        txt('The following gaps in the chain of title have been identified. The documents listed are ', { size: SZ_SM }),
        txt('required to be submitted prior to / at the time of disbursal', { bold: true, size: SZ_SM }),
        txt('. These gaps are also highlighted in ', { size: SZ_SM }),
        txt('RED / ORANGE', { bold: true, color: 'CC0000', size: SZ_SM }),
        txt(' in the document table above.', { size: SZ_SM }),
      ], { align: AlignmentType.BOTH, after: 120 }),
      noteTable,
      emptyRow(),
    ];
  }

  function disbursalTable(items, widths = [500, 6200, 2660]) {
    return new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: widths,
      rows: [
        new TableRow({ tableHeader: true, children: [headerCell('Sl.', widths[0]), headerCell('Particulars', widths[1]), headerCell('Original / Certified / Notarized / Photostat', widths[2])] }),
        ...(items || []).map((it, i) => new TableRow({ children: [
          cell(String(it.slNo || i + 1), widths[0], { align: AlignmentType.CENTER }),
          cell(it.particulars || '', widths[1]),
          cell(it.documentType || '', widths[2], { align: AlignmentType.CENTER }),
        ]})),
      ],
    });
  }

  function postDisbursalTable(items) {
    return new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [500, 8860],
      rows: [
        new TableRow({ tableHeader: true, children: [headerCell('Sl.', 500), headerCell('Documents', 8860)] }),
        ...(items || []).map((it, i) => new TableRow({ children: [
          cell(String(it.slNo || i + 1), 500, { align: AlignmentType.CENTER }),
          cell(it.document || '', 8860),
        ]})),
      ],
    });
  }

  // ── Overall status colour ──────────────────────────────────────────────────
  const statusColor = { CLEAR: '006400', 'CONDITIONALLY CLEAR': 'CC5500', 'REFER BACK': 'CC0000' }[d.overallStatus] || '555555';

  // ── Assemble document ──────────────────────────────────────────────────────
  const dbd = d.documentsBeforeDisbursal || {};
  const dfc = d.documentsForCharge || {};
  const dpd = d.documentsPostDisbursal || {};
  const ownerNames = (ph.ownerNames || []).join(', ');

  const doc = new Document({
    styles: { default: { document: { run: { font: TAHOMA, size: SZ } } } },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1400, right: 900, bottom: 900, left: 900 }, // top larger for letterhead
        },
      },
      headers: {
        default: new Header({
          children: buildLetterhead(firmName),
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: '1F497D', space: 2 } },
            spacing: { before: 60 },
            children: [
              txt('Legal Scrutiny Report  |  Confidential  |  Page ', { size: SZ_XS }),
              new TextRun({ children: [PageNumber.CURRENT], font: TAHOMA, size: SZ_XS }),
              txt(' of ', { size: SZ_XS }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], font: TAHOMA, size: SZ_XS }),
            ],
          })],
        }),
      },
      children: [

        // ── Title ──────────────────────────────────────────────────────────
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [txt('LEGAL SCRUTINY REPORT', { bold: true, underline: true, size: 24 })] }),
        emptyRow(),
        para([
          txt('Ref. No. ' + (hdr.refNo || ''), { bold: true, size: SZ_SM }),
          txt('\t\t\t\t\t', { size: SZ_SM }),
          txt('Date: ' + (hdr.date || ''), { bold: true, size: SZ_SM }),
        ], { align: AlignmentType.LEFT, after: 60 }),
        emptyRow(),
        para([txt('To,', { bold: true })], { align: AlignmentType.LEFT, after: 0 }),
        para([txt(hdr.addressee?.designation || '', { bold: true })], { align: AlignmentType.LEFT, after: 0 }),
        para([txt(hdr.addressee?.department || '', { bold: true })], { align: AlignmentType.LEFT, after: 0 }),
        para([txt(hdr.addressee?.bank || '', { bold: true })], { align: AlignmentType.LEFT, after: 0 }),
        para([txt(hdr.addressee?.city || 'Bangalore', { bold: true })], { align: AlignmentType.LEFT, after: 80 }),
        emptyRow(),
        para([txt('Sub:\t', { bold: true }), txt(d.subjectLine || '', { bold: false })], { align: AlignmentType.BOTH, after: 80 }),
        emptyRow(),

        // ── Property details ───────────────────────────────────────────────
        labelValueNoTable('APF No', ph.apfNo),
        labelValueNoTable('Name of the Applicant and Co-Applicant', (ph.applicantName || '') + (ph.coApplicantName ? ' / ' + ph.coApplicantName : '')),
        labelValueNoTable('Nature of Transaction', ph.natureOfTransaction),
        labelValueNoTable('Nature of Property', ph.natureOfProperty),
        labelValueNoTable('Name of the Owner(s)', ownerNames),
        labelValueNoTable('Name of the Developer', ph.developerName),
        labelValueNoTable('RERA No', ph.reraNo),
        emptyRow(),

        // ── Schedule ───────────────────────────────────────────────────────
        para([txt('Schedule of Property:', { bold: true, size: SZ_SM })], { align: AlignmentType.LEFT, after: 60 }),
        para([txt(sp.description || '', { size: SZ_SM })], { align: AlignmentType.BOTH, after: 60 }),
        ...(sp.boundaries ? [
          para([txt('East by: ', { bold: true, size: SZ_SM }), txt(sp.boundaries.east || '', { size: SZ_SM })], { after: 30 }),
          para([txt('West by: ', { bold: true, size: SZ_SM }), txt(sp.boundaries.west || '', { size: SZ_SM })], { after: 30 }),
          para([txt('North by: ', { bold: true, size: SZ_SM }), txt(sp.boundaries.north || '', { size: SZ_SM })], { after: 30 }),
          para([txt('South by: ', { bold: true, size: SZ_SM }), txt(sp.boundaries.south || '', { size: SZ_SM })], { after: 80 }),
        ] : []),
        emptyRow(),

        // ── Documents table ────────────────────────────────────────────────
        sectionHeading('DETAILS OF DOCUMENTS FURNISHED FOR SCRUTINY'),
        docTable,
        emptyRow(),

        // ── Title Tracing ──────────────────────────────────────────────────
        ...(d.titleFlow && d.titleFlow.length > 0 ? [
          sectionHeading('TRACING OF TITLE'),
          ...buildTitleTracingParas(d.titleFlow, d.propertyDetails),
          emptyRow(),
        ] : []),

        // ── Checklist ──────────────────────────────────────────────────────
        sectionHeading('KEY CHECKLIST'),
        checkTable,
        emptyRow(),

        // ── Legal interventions ────────────────────────────────────────────
        sectionHeading('LEGAL INTERVENTIONS / ISSUES AFFECTING TITLE'),
        para([txt(d.legalInterventions || 'NIL as per documents furnished', { size: SZ_SM })], { align: AlignmentType.BOTH }),
        emptyRow(),

        // ── Approvals ──────────────────────────────────────────────────────
        ...(d.approvalsSanctions?.length ? [sectionHeading('APPROVALS, SANCTIONS & NOCs OBTAINED'), appTable, emptyRow()] : []),

        // ── Steps before disbursal ─────────────────────────────────────────
        sectionHeading('STEPS / DOCUMENTS REQUIRED PRIOR TO DISBURSAL OF LOAN'),
        para([txt('For Developer Share:', { bold: true, size: SZ_SM })], { align: AlignmentType.LEFT, after: 60 }),
        disbursalTable(dbd.developerShare),
        emptyRow(),
        para([txt('For Landowner Share:', { bold: true, size: SZ_SM })], { align: AlignmentType.LEFT, after: 60 }),
        disbursalTable(dbd.landownerShare),
        emptyRow(),

        // ── Documents for creation of charge ──────────────────────────────
        sectionHeading('DOCUMENTS TO BE DEPOSITED IN ORIGINAL FOR CREATION OF CHARGE'),
        para([txt('For Developer Share:', { bold: true, size: SZ_SM })], { align: AlignmentType.LEFT, after: 60 }),
        disbursalTable(dfc.developerShare),
        emptyRow(),
        para([txt('For Landowner Share:', { bold: true, size: SZ_SM })], { align: AlignmentType.LEFT, after: 60 }),
        disbursalTable(dfc.landownerShare),
        emptyRow(),

        // ── Documents post disbursal ───────────────────────────────────────
        sectionHeading('DOCUMENTS TO BE DEPOSITED IN ORIGINAL POST DISBURSAL'),
        para([txt('For Developer Share:', { bold: true, size: SZ_SM })], { align: AlignmentType.LEFT, after: 60 }),
        postDisbursalTable(dpd.developerShare),
        emptyRow(),
        para([txt('For Landowner Share:', { bold: true, size: SZ_SM })], { align: AlignmentType.LEFT, after: 60 }),
        postDisbursalTable(dpd.landownerShare),
        emptyRow(),

        // ── NOTE — Title Gaps ──────────────────────────────────────────────
        ...noteSection(),

        // ── Overall status ─────────────────────────────────────────────────
        sectionHeading('OVERALL STATUS'),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 }, children: [txt(d.overallStatus || 'CONDITIONALLY CLEAR', { bold: true, size: 32, color: statusColor })] }),
        emptyRow(),

        // ── Opinion ────────────────────────────────────────────────────────
        sectionHeading('OPINION'),
        para([txt(d.opinion || '', { size: SZ_SM })], { align: AlignmentType.BOTH }),
        emptyRow(),

        // ── Subject to ────────────────────────────────────────────────────
        sectionHeading('SUBJECT TO'),
        ...(d.subjectTo || []).map((c, i) => para([txt((i + 1) + '.  ' + c, { size: SZ_SM })], { align: AlignmentType.BOTH, after: 60 })),
        emptyRow(),

        // ── Standard note ─────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.BOTH,
          spacing: { before: 120, after: 80 },
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: '888888', space: 4 }, bottom: { style: BorderStyle.SINGLE, size: 4, color: '888888', space: 4 }, left: { style: BorderStyle.SINGLE, size: 4, color: '888888', space: 4 }, right: { style: BorderStyle.SINGLE, size: 4, color: '888888', space: 4 } },
          children: [
            txt('NOTE: ', { bold: true, size: SZ_SM }),
            txt('Copies of documents perused herein are bona-fide believed to be genuine photo-copies of originals. We also suggest forensic expert opinion in case your bank deems fit. In the process of legal verification of documents, we have relied upon the veracity of contents of documents and have assumed the identity and signatures of the parties to deeds as authentic. We have not carried out any search to confirm the genuineness of documents as the same is outside the scope of activity entrusted to us.', { size: SZ_SM }),
          ],
        }),
        emptyRow(),
        para([txt('Specific Note: This legal report is given on the basis of cumulative compilation of information furnished & documents perused for the property. However, in order to thwart the possible undisclosed risk/s of existing/impending litigation/s and land acquisition proceedings, please ask the panel engineer of your bank to make enquiry in the neighbourhood of the property during his/their routine visit/s. All the documents referred to us are returned herewith.', { size: SZ_SM })], { align: AlignmentType.BOTH }),
        emptyRow(),

        // ── Signature ──────────────────────────────────────────────────────
        para([txt('Thanking you,', { size: SZ_SM })], { align: AlignmentType.LEFT }),
        emptyRow(),
        para([txt('For ' + firmName, { bold: true, size: SZ_SM })], { align: AlignmentType.LEFT }),
        emptyRow(), emptyRow(),
        para([txt(advocateName, { bold: true, size: SZ_SM })], { align: AlignmentType.LEFT }),
        para([txt('Advocate', { size: SZ_SM })], { align: AlignmentType.LEFT }),
        para([txt(hdr.addressee?.city || 'Bangalore', { size: SZ_SM })], { align: AlignmentType.LEFT }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

module.exports = { generateLegalReport };
