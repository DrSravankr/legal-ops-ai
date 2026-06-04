require('./backend/server.env');
const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { GoogleGenerativeAI } = require('./backend/node_modules/@google/generative-ai');
const { generateLegalReport } = require('./backend/generators/reportGenerator');

async function run() {
  // Load cached extractions
  const cpFile = path.join(os.tmpdir(), 'legal_ops_checkpoint.json');
  const cp = JSON.parse(fs.readFileSync(cpFile, 'utf8'));
  const DIR = 'C:/Users/drsra/Downloads/legal-docs-extracted';
  const allFiles = fs.readdirSync(DIR).filter(f => f.endsWith('.pdf'));
  const remaining = allFiles.filter(f => !cp[f]);

  let docText = Object.entries(cp)
    .map(([name, text]) => `\n${'='.repeat(50)}\nDOC: ${name}\n${'='.repeat(50)}\n${text.substring(0, 1500)}`)
    .join('\n');
  docText += '\n\nADDITIONAL DOCUMENTS (filename only):\n' + remaining.join('\n');

  console.log('Cached:', Object.keys(cp).length, '| Remaining filenames:', remaining.length);
  console.log('Calling Gemini API (single call)...\n');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are a senior Indian property law advocate preparing a Legal Scrutiny Report for Axis Bank Limited.

PROPERTY: Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District 560064
DEVELOPER: M/s. Ramky Estates and Farms Limited
LANDOWNERS: Mr. N. Kumar, Mrs. N. Padmavathi, Mr. N. Rama
LAW FIRM: M/s. Aneesh Associates Private Limited | ADVOCATE: Dr. Sravan Kumar D

DOCUMENT EXTRACTIONS (use this actual data):
${docText.substring(0, 90000)}

STRICT RULES - FOLLOW EXACTLY:
1. ALL text must be CLEAN ENGLISH ONLY - zero Kannada/regional language characters in output
2. Use EXACT Axis Bank report writing style:
   - RTC: "Record of Tenancy and Crops (RTC/Pahani) for the year [YY-YY], issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.[X] of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring [AREA], ([Pattadar Name])"
   - Sale Deed: "Sale deed registered as Document No.[X/YY-YY], executed by [PARTIES with SPA details], in respect of the property bearing Sy.No.[X] of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring [AREA] in favour of [BUYER]"
   - Partition Deed: "Partition Deed entered between [PARTIES] in respect of their Joint Family Properties..."
   - MR: "Mutation Register Extract bearing MR No.[X/YY-YY], issued by the Jurisdictional Revenue Authority..."
   - EC: "Encumbrance Certificate for the period from [DATE] to [DATE] in respect of Sy.No.[X] of Thirumenahalli Village..."
   - GPA: "General Power of Attorney executed by [NAME] in respect of the property bearing Sy.No.[X]... in favour of [DEVELOPER]"
   - JDA: "Joint Development Agreement executed by [LANDOWNER] (Landowner) and M/s. Ramky Estates and Farms Limited (Developer) in respect of the property bearing Sy.No.[X]..."
   - Conversion Order: "Conversion Order bearing No.[X] dated [DATE], issued by [AUTHORITY], converting the property bearing Sy.No.[X]... from Agricultural to Residential use"
   - NOC: "NOC dated [DATE] issued by [AUTHORITY] in respect of the proposed development at Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village..."
3. Group documents by Survey Number. Use isSubHeader:true rows as section headers
4. Chronological order within each group
5. Insert isGap:true rows where title chain is broken
6. No portal URLs, no digital signatures, no metadata, no "[SCANNED]" text
7. Return ONLY valid JSON - no markdown

{
  "reportHeader":{"refNo":"AAPL/AXI/APF-KA/12-06/2026","date":"04/06/2026","reportTitle":"LEGAL SCRUTINY REPORT","addressee":{"designation":"The Assistant Vice President","department":"Head-Retail Asset Centre","bank":"Axis Bank Limited","city":"Bangalore"}},
  "subjectLine":"Legal Scrutiny Report in respect of the project of M/s. Ramky Estates and Farms Limited at Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk",
  "propertyDetails":{
    "apfNo":"",
    "applicantName":"M/s. Ramky Estates and Farms Limited",
    "coApplicantName":null,
    "natureOfTransaction":"Project Approval (APF)",
    "natureOfProperty":"Residential",
    "ownerNames":["Mr. N. Kumar","Mrs. N. Padmavathi","Mr. N. Rama"],
    "developerName":"M/s. Ramky Estates and Farms Limited",
    "reraNo":"",
    "scheduleProperty":{
      "description":"All that piece and parcel of the proposed development to be developed in properties bearing Sy.No.106/3, Sy.No.106/4, Sy.No.106/5 and Sy.No.108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District — 560064",
      "surveyNumbers":[
        {"syNo":"106/3","measurement":"10 Guntas","village":"Thirumenahalli","hobli":"Yelahanka Hobli","taluk":"Bangalore North Taluk","district":"Bangalore"},
        {"syNo":"106/4","measurement":"10 Guntas","village":"Thirumenahalli","hobli":"Yelahanka Hobli","taluk":"Bangalore North Taluk","district":"Bangalore"},
        {"syNo":"106/5","measurement":"2 Acres 25 Guntas","village":"Thirumenahalli","hobli":"Yelahanka Hobli","taluk":"Bangalore North Taluk","district":"Bangalore"},
        {"syNo":"108","measurement":"As per RTC","village":"Thirumenahalli","hobli":"Yelahanka Hobli","taluk":"Bangalore North Taluk","district":"Bangalore"}
      ],
      "totalMeasurement":"[Extract from documents]",
      "boundaries":{"east":"Road","west":"Private Layout","north":"Site No.70","south":"Site No.68"}
    }
  },
  "documentsFurnished":[
    {"isSubHeader":true,"subHeaderText":"Sy.No.106/3","syNo":"106/3","slNo":null,"date":null,"particulars":null,"documentType":null},
    {"slNo":1,"date":"[DATE]","particulars":"[EXACT AXIS BANK STYLE - USE ACTUAL DATA FROM DOCUMENTS]","documentType":"Photostat","syNo":"106/3","isGap":false,"isSubHeader":false,"subHeaderText":null},
    {"isGap":true,"gapDescription":"[EXACT gap description]","syNo":"106/3","severity":"HIGH","slNo":null,"date":null,"particulars":null,"documentType":null}
  ],
  "titleFlow":[{"period":"","event":"","parties":"","documentRef":""}],
  "checklistAnswers":{"developerAcquiredRightsViaJDA":true,"landownersEmpoweredDeveloperToSell":true,"empoweringClause":"As per clauses of JDA and GPA executed by landowners in favour of M/s. Ramky Estates and Farms Limited","considerationType":"Area Sharing","supplementaryAgreementExecuted":true,"allLandownersSignedSupplementary":true,"landConverted":true,"conversionType":"Residential","minorsRights":"NIL","landAcquisitionOrders":"NIL","litigations":"NIL as per documents furnished","otherObservations":"NIL","sarfaesiEnforceable":true},
  "approvalsSanctions":[{"authority":"[FROM DOCS]","type":"NOC/Plan/RERA","number":"","date":"","description":""}],
  "encumbrances":[],
  "legalInterventions":"NIL as per documents furnished",
  "titleGaps":[{"slNo":1,"syNo":"","severity":"HIGH","gapType":"EC_GAP","description":"[PRECISE GAP]","documentRequired":"[DOCUMENT NEEDED]"}],
  "documentsBeforeDisbursal":{"developerShare":[{"slNo":1,"particulars":"Agreement of Sale executed by Landowners/Developer in respect of Residential Apartments to be purchased by the Borrower","documentType":"Photostat"},{"slNo":2,"particulars":"Encumbrance Certificate for the period from date of Plan Sanction till date","documentType":"Photostat"},{"slNo":3,"particulars":"Own Contribution Receipts","documentType":"Photostat"},{"slNo":4,"particulars":"e-Khata issued in respect of the Residential Apartments to be purchased by the Borrower","documentType":"Photostat"},{"slNo":5,"particulars":"NOC from Financial Institution in respect of the Residential Apartments","documentType":"Photostat"}],"landownerShare":[{"slNo":1,"particulars":"Agreement of Sale executed by Landowners in respect of Residential Apartments to be purchased by the Borrower","documentType":"Photostat"},{"slNo":2,"particulars":"Encumbrance Certificate for the period from date of Plan Sanction till date","documentType":"Photostat"},{"slNo":3,"particulars":"Own Contribution Receipts","documentType":"Photostat"},{"slNo":4,"particulars":"e-Khata issued in respect of the Residential Apartments","documentType":"Photostat"},{"slNo":5,"particulars":"NOC from Financial Institution","documentType":"Photostat"}]},
  "documentsForCharge":{"developerShare":[{"slNo":1,"particulars":"Agreement of Sale executed by Landowners/Developer","documentType":"Original"},{"slNo":2,"particulars":"Encumbrance Certificate from date of Plan Sanction till date","documentType":"Digitally Signed"},{"slNo":3,"particulars":"Own Contribution Receipts","documentType":"Original"},{"slNo":4,"particulars":"e-Khata","documentType":"Digitally Signed"},{"slNo":5,"particulars":"NOC from Financial Institution","documentType":"Original"}],"landownerShare":[{"slNo":1,"particulars":"Agreement of Sale executed by Landowners","documentType":"Original"},{"slNo":2,"particulars":"Encumbrance Certificate from date of Plan Sanction till date","documentType":"Digitally Signed"},{"slNo":3,"particulars":"Own Contribution Receipts","documentType":"Original"},{"slNo":4,"particulars":"e-Khata","documentType":"Digitally Signed"},{"slNo":5,"particulars":"NOC from Financial Institution","documentType":"Original"}]},
  "documentsPostDisbursal":{"developerShare":[{"slNo":1,"document":"Sale Deed to be executed by M/s. Ramky Estates and Farms Limited in favour of Prospective Purchasers availing loan from Axis Bank Limited for their respective units"}],"landownerShare":[{"slNo":1,"document":"Sale Deed to be executed by Mr. N. Kumar, Mrs. N. Padmavathi and Mr. N. Rama in favour of Prospective Purchasers availing loan from Axis Bank Limited for their respective units"}]},
  "btDetails":"N/A",
  "opinion":"[Write full legal opinion using actual names, actual survey numbers, actual document references from the extracted data above]",
  "subjectTo":["Verification of all the original documents","Encumbrance Certificate should be verified at your end before the mortgage transaction is put through","An officer of the Bank has to make personal inspection to identify, confirm the existence of the property with correct boundaries and also to ascertain the physical possession of the property","The genuineness of documents and signatures on the documents cannot be ascertained by us and hence adequate precautions should be taken","The Original documents should be verified at your end before the mortgage transaction is put through"],
  "translatedContent":{"hasIndianLanguageContent":true,"languages":["Kannada"],"translationNotes":"Revenue documents including RTC, Mutation Register and Akarband were in Kannada and have been translated to English"},
  "riskFlags":[],
  "overallStatus":"CONDITIONALLY CLEAR",
  "summary":"[2-3 sentence summary using actual property and party details]"
}`;

  try {
    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();
    if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    console.log('Parsing JSON...');
    const data = JSON.parse(raw);

    const outPath = 'C:/Users/drsra/OneDrive/Desktop/Thanisandra_Legal_Scrutiny_Report_FINAL.docx';
    console.log('Generating DOCX...');
    await generateLegalReport(data, outPath, 'M/s. Aneesh Associates Private Limited', 'Dr. Sravan Kumar D');

    console.log('\n==============================');
    console.log('REPORT READY:', outPath);
    console.log('Status:', data.overallStatus);
    console.log('Documents:', (data.documentsFurnished||[]).filter(d => !d.isGap && !d.isSubHeader).length);
    console.log('Title Gaps:', (data.titleGaps||[]).length);
    console.log('==============================\n');
  } catch(e) {
    console.error('ERROR:', e.message.substring(0, 300));
  }
}

run();
