/**
 * Demo Report Generator — uses actual Phase-I document data
 * No API key needed — data is extracted from the real Axis Bank Phase-I report
 */
require('./backend/server.env');
const { generateLegalReport } = require('./backend/generators/reportGenerator');
const path = require('path');

// ── ACTUAL DATA extracted from the real Phase-I Legal Scrutiny Report ─────────
const reportData = {
  reportHeader: {
    refNo: 'AAPL/AXI/APF-KA/11-02/2026',
    date: '24/02/2025',
    reportTitle: 'LEGAL SCRUTINY REPORT',
    addressee: {
      designation: 'The Assistant Vice President',
      department: 'Head-Retail Asset Centre',
      bank: 'Axis Bank Limited',
      city: 'Bangalore'
    }
  },
  subjectLine: 'Legal Scrutiny Report in respect of the File of APF- Folium by Sumadhura Phase-III',
  propertyDetails: {
    apfNo: 'P2642022519107',
    applicantName: 'M/s. Sumadhura Folium',
    coApplicantName: null,
    natureOfTransaction: 'Project Approval (APF)',
    natureOfProperty: 'Residential',
    ownerNames: [
      'Mr. Naved M. Hassan',
      'M/s Samarkhand Property Management Pvt. Ltd. represented by its Director Mr. Naved M. Shah',
      'Mr. H.A. Srinivas',
      'Mr. H.A. Narendra Kumar',
      'Mr. H.A. Somashekar',
      'Mr. H.A. Satish Kumar',
      'Mrs. Kavitha',
      'M/s Sumadhura Infracon Private Limited'
    ],
    developerName: 'M/s Sumadhura Infracon Private Limited',
    reraNo: 'PRM/KA/RERA/1251/446/PR/280222/004738',
    scheduleProperty: {
      description: 'All that piece and parcel of in the proposed development known as Folium by Sumadhura Phase-III to be developed in Property bearing Sy No. 47/1 (measuring 5 acres 4 guntas), Sy No. 48/4 (measuring 1 acre 38 guntas), Sy No. 47/2A (measuring 1 acre 16½ guntas), Sy No. 47/3 (measuring 1 acre 16½ guntas), Sy No. 47/2B (measuring 31 guntas), Sy No. 48/3 (measuring 29.03 guntas), Sy No. 48/1C (measuring 4 acre 05 guntas), Sy No. 48/5, Old No. 48/1B1 (measuring 1 acre) of Whitefield Village, KR Puram Hobli, Bangalore East Taluk, Bangalore totally measuring 16 acres 20.03 guntas',
      surveyNumbers: [
        { syNo: '47/1', measurement: '5 Acres 4 Guntas', village: 'Whitefield', hobli: 'K.R. Puram Hobli', taluk: 'Bangalore East Taluk', district: 'Bangalore' },
        { syNo: '48/4', measurement: '1 Acre 38 Guntas', village: 'Whitefield', hobli: 'K.R. Puram Hobli', taluk: 'Bangalore East Taluk', district: 'Bangalore' },
        { syNo: '47/2A', measurement: '1 Acre 16½ Guntas', village: 'Whitefield', hobli: 'K.R. Puram Hobli', taluk: 'Bangalore East Taluk', district: 'Bangalore' },
        { syNo: '47/3', measurement: '1 Acre 16½ Guntas', village: 'Whitefield', hobli: 'K.R. Puram Hobli', taluk: 'Bangalore East Taluk', district: 'Bangalore' },
        { syNo: '47/2B', measurement: '31 Guntas', village: 'Whitefield', hobli: 'K.R. Puram Hobli', taluk: 'Bangalore East Taluk', district: 'Bangalore' },
        { syNo: '48/3', measurement: '29.03 Guntas', village: 'Whitefield', hobli: 'K.R. Puram Hobli', taluk: 'Bangalore East Taluk', district: 'Bangalore' },
        { syNo: '48/1C', measurement: '4 Acres 05 Guntas', village: 'Whitefield', hobli: 'K.R. Puram Hobli', taluk: 'Bangalore East Taluk', district: 'Bangalore' },
        { syNo: '48/5', measurement: '1 Acre', village: 'Whitefield', hobli: 'K.R. Puram Hobli', taluk: 'Bangalore East Taluk', district: 'Bangalore' }
      ],
      totalMeasurement: '16 Acres 20.03 Guntas',
      boundaries: {
        east: 'Land in Sy No. 48/1B1 and Road',
        west: 'Land in Sy No. 41',
        north: 'Land in Sy No. 23 and Road',
        south: 'Road and Land in Sy No. 48/1A'
      }
    }
  },

  documentsFurnished: [

    // ══════════════════ Sy.No. 47/1 ══════════════════
    { isSubHeader: true, subHeaderText: 'Sy.No.47/1', syNo: '47/1' },
    {
      slNo: 1, date: '', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Record of Tenancy and Crops (RTC/Pahani) for the year 1977-78 to 1979-80, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 5 Acres 4 Guntas, (Mr. Narayanappa)'
    },
    {
      slNo: 2, date: '14/10/1980', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Partition Deed entered between Mr. Narayanappa, Mr. Muniswamappa, Mr. Lakshmaiah and Mr. Srinivasa, in respect of their Joint Family Properties including the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore South Taluk, Bangalore District, measuring 5 acres 04 guntas (land measuring to an extent of 02 Acres 04 Guntas fallen to the share of Mr. Muniswamappa), land measuring to an extent of 02 Acres 04 Guntas fallen to the share of Mr. Lakshmaiah and land measuring to an extent of 36 Guntas fallen to the share of Mr. Srinivasa'
    },
    {
      slNo: 3, date: '', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Mutation Register Extract bearing MR No.3/1995-96, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore South Taluk, Bangalore District, measuring 5 acres 04 guntas (land measuring to an extent of 02 Acres 04 Guntas in favour of Mr. Muniswamappa), land measuring to an extent of 02 Acres 04 Guntas in favour of Mr. Lakshmaiah and land measuring to an extent of 36 Guntas in favour of Mr. Srinivasa'
    },
    {
      slNo: 4, date: '', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Record of Tenancy and Crops (RTC/Pahani) for the year 1992-93 to 2003-04, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore South Taluk, Bangalore District, measuring 5 acres 04 guntas (land measuring to an extent of 02 Acres 04 Guntas in favour of Mr. Muniswamappa), land measuring to an extent of 02 Acres 04 Guntas in favour of Mr. Lakshmaiah and land measuring to an extent of 36 Guntas in favour of Mr. Srinivasa'
    },

    // ── GAP: MR not furnished for period 1980 to 1995 ──
    {
      isGap: true, syNo: '47/1', severity: 'MEDIUM',
      gapType: 'MR_GAP',
      gapDescription: 'Mutation Register Extract not furnished for the period from 14/10/1980 (Partition Deed) to MR No.3/1995-96 — Gap of 15 years in Mutation Register entries for Sy.No.47/1'
    },

    // Lakshmaiah's Share
    { isSubHeader: true, subHeaderText: "Lakshmaiah's Share", syNo: '47/1' },
    {
      slNo: 5, date: '26/08/2004', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Special Power of Attorney executed by Ms. Shubha, in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 2 acres 04 guntas in favour of Mr. Lakshmaiah'
    },
    {
      slNo: 6, date: '29/09/2004', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Sale deed registered as Document No.18183/2004-05, executed by Mr. Lakshmaiah, Mrs. Lakshmidevi, Mrs. Shubha represented by her SPA Holder Mr. Lakshmaiah, Ms. Shilpa and Mr. Prasad, in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 21 Guntas in favour of Mr. Naved M. Hassan'
    },
    {
      slNo: 7, date: '25/10/2004', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Sale deed registered as Document No.20452/2004-05, executed by Mr. Lakshmaiah, Mrs. Lakshmidevi, Mrs. Shubha represented by her SPA Holder Mr. Lakshmaiah, Ms. Shilpa and Mr. Prasad, in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 21 Guntas in favour of Mr. Naved M. Hassan'
    },
    {
      slNo: 8, date: '03/11/2004', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Sale deed registered as Document No.20923/2004-05, executed by Mr. Lakshmaiah, Mrs. Lakshmidevi, Mrs. Shubha represented by her SPA Holder Mr. Lakshmaiah, Ms. Shilpa and Mr. Prasad, in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 21 Guntas in favour of Mr. Naved M. Hassan'
    },
    {
      slNo: 9, date: '03/11/2004', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Sale deed registered as Document No.4068/2004-05, executed by Mr. Lakshmaiah, Mrs. Lakshmidevi, Mrs. Shubha represented by her SPA Holder Mr. Lakshmaiah, Ms. Shilpa and Mr. Prasad, in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 21 Guntas in favour of Mr. Naved M. Hassan'
    },

    // ── GAP: MR not furnished after Lakshmaiah's sale deeds ──
    {
      isGap: true, syNo: '47/1', severity: 'HIGH',
      gapType: 'MR_GAP',
      gapDescription: 'Mutation Register Extract not furnished in the name of Mr. Naved M. Hassan after the Sale Deeds dated 29/09/2004 to 03/11/2004 in respect of Lakshmaiah\'s share of Sy.No.47/1 — Mutation entries to be called for'
    },

    // Muniswamappa's Share
    { isSubHeader: true, subHeaderText: "Muniswamappa's Share", syNo: '47/1' },
    {
      slNo: 10, date: '29/09/2004', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Special Power of Attorney executed by Ms. Ashwini and Mr. Pavan in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 2 acres 04 guntas in favour of Mr. Muniswamaiah'
    },
    {
      slNo: 11, date: '02/09/2004', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Special Power of Attorney executed by Ms. Ashwini in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 2 acres 04 guntas, in favour of Mrs. Jayanthi'
    },
    {
      slNo: 12, date: '29/09/2004', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Sale deed registered as Document No.18184/2004-05, executed by Mr. Muniswamaiah, Mrs. Jayanthi, Mrs. Malini, Ms. Ashwini and Mr. Pavan both are represented by their father and SPA holder Mr. Muniswamaiah in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, in favour of Mr. Naved M. Hassan measuring 21 Guntas'
    },
    {
      slNo: 13, date: '25/10/2004', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Sale deed registered as Document No.20460/2004-05, executed by Mr. Muniswamaiah, Mrs. Jayanthi, Mrs. Malini, Ms. Ashwini and Mr. Pavan both are represented by their father and SPA holder Mr. Muniswamaiah in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, in favour of Mr. Naved M. Hassan measuring 21 Guntas'
    },
    {
      slNo: 14, date: '03/11/2004', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Sale deed registered as Document No.20924/2004-05, Mr. Muniswamaiah, Mrs. Jayanthi, Mrs. Malini, Ms. Ashwini and Mr. Pavan both are represented by their father and SPA holder Mr. Muniswamaiah in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 21 Guntas in favour of Mr. Naved M. Hassan'
    },
    {
      slNo: 15, date: '07/03/2005', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Sale deed registered as Document No.4067/2004-05, executed by Mr. Muniswamaiah, Mrs. Jayanthi, Mrs. Malini, Ms. Ashwini and Mr. Pavan both are represented by their father in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 21 Guntas in favour of Mr. Naved M. Hassan'
    },

    // Srinivasa's Share
    { isSubHeader: true, subHeaderText: "Srinivasa's Share", syNo: '47/1' },
    {
      slNo: 16, date: '29/09/2004', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Special Power of Attorney executed by Mrs. Vijayalakshmi in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District measuring 36 guntas in favour of Mr. Srinivas'
    },
    {
      slNo: 17, date: '03/11/2004', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Sale deed registered as Document No.20927/2004-05, executed by Mr. Srinivas, Mrs. Vijayalakshmi represented by her husband and SPA holder Mr. Srinivas, Ms. Harini and Ms. Thanushri both are minors represented by their father Mr. Srinivas in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District measuring 18 Guntas in favour of Mr. Naved M. Hassan'
    },
    {
      slNo: 18, date: '21/03/2005', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Sale deed registered as Document No.35228/2004-05, executed by Mr. Srinivas, Mrs. Vijayalakshmi represented by her husband and SPA holder Mr. Srinivas, Ms. Harini and Ms. Thanushri both are minors represented by their father Mr. Srinivas in respect of the property bearing Sy.No.47/1 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District measuring 18 Guntas in favour of Mr. Naved M. Hassan'
    },

    // EC for 47/1
    {
      slNo: 19, date: '', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Encumbrance Certificate for the period from 15/02/1957 to 31/05/1989, 01/06/1989 to 31/03/2004, 01/04/2004 to 25/02/2022, 01/04/2004 to 13/04/2023, 27/04/2022 to 27/04/2022, 01/04/2004 to 13/04/2023 and 01/04/2023 to date in respect of Sy No. 47/1'
    },

    // ── GAP: EC coverage gap ──
    {
      isGap: true, syNo: '47/1', severity: 'MEDIUM',
      gapType: 'EC_GAP',
      gapDescription: 'Encumbrance Certificate for the period from 01/04/2023 to date (present) not furnished in respect of Sy.No.47/1 — Latest EC to be called for to cover the current period'
    },

    // ══════════════════ Sy.No. 48/4 ══════════════════
    { isSubHeader: true, subHeaderText: 'Sy.No.48/4', syNo: '48/4' },
    {
      slNo: 20, date: '', syNo: '48/4', documentType: 'Photostat',
      particulars: 'Record of Tenancy and Crops (RTC/Pahani) for the year 1967-68 to 1979-80, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.48/4 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 1 Acre 38 Guntas, (Mr. Ballari Munishami @ Doddamunishamappa)'
    },

    // ── GAP: Original owner link not established ──
    {
      isGap: true, syNo: '48/4', severity: 'HIGH',
      gapType: 'MISSING_LINK',
      gapDescription: 'Link between original pattadar Mr. Ballari Munishami @ Doddamunishamappa (RTC 1967-68) and the subsequent partition parties (Mr. Narayanappa, Mr. Muniswamappa, Mr. Lakshmaiah, Mr. Srinivasa) is not established — Family relationship / succession document not furnished'
    },

    {
      slNo: 21, date: '14/10/1980', syNo: '48/4', documentType: 'Photostat',
      particulars: 'Partition Deed entered between Mr. Narayanappa, Mr. Muniswamappa, Mr. Lakshmaiah and Mr. Srinivasa, in respect of their Joint Family Properties including the Property bearing Sy.No.48/4 of Whitefield Village, KR Puram Hobli, Bangalore South Taluk, Bangalore measuring 1 acre 38 guntas (land measuring to an extent of 28 Guntas has fallen to the share of Mr. Narayanappa and land measuring 1 Acre 10 Guntas has fallen to the share of Mr.Srinivas)'
    },
    {
      slNo: 22, date: '', syNo: '48/4', documentType: 'Photostat',
      particulars: 'Mutation Register Extract bearing M.R. No.3/1995-96, issued by the Jurisdictional Revenue Authority in respect of the Property bearing Sy.No.48/4 of Whitefield Village, KR Puram Hobli, Bangalore South Taluk, Bangalore measuring 1 acre 38 guntas (land measuring to an extent of 28 Guntas in favour of Mr. Narayanappa and land measuring 1 Acre 10 Guntas in favour of Mr. Srinivas)'
    },
    {
      slNo: 23, date: '', syNo: '48/4', documentType: 'Photostat',
      particulars: 'Record of Tenancy and Crops (RTC/Pahani) for the year 1992-93 to 2003-04, issued by the Jurisdictional Revenue Authority in respect of the Property bearing Sy.No.48/4 of Whitefield Village, KR Puram Hobli, Bangalore South Taluk, Bangalore measuring 1 acre 38 guntas (land measuring to an extent of 28 Guntas in favour of Mr. Narayanappa and land measuring 1 Acre 10 Guntas in favour of Mr. Srinivas)'
    },
    {
      slNo: 24, date: '29/09/2004', syNo: '48/4', documentType: 'Photostat',
      particulars: 'Sale Deed registered as Document No.18186/2004-05, executed by Mr. Narayanappa, in respect of the property bearing Sy.No.48/4 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 14 Guntas, in favour of Mr. Naved M. Hassan'
    },
    {
      slNo: 25, date: '25/10/2004', syNo: '48/4', documentType: 'Photostat',
      particulars: 'Sale Deed registered as Document No.20520/2004-05, executed by Mr. Narayanappa, in respect of the property bearing Sy.No.48/4 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District, measuring 14 Guntas, in favour of Mr. Naved M. Hassan'
    },
    {
      slNo: 26, date: '29/09/2004', syNo: '48/4', documentType: 'Photostat',
      particulars: 'Sale Deed registered as Document No.18187/2004-05, executed by Mr. Srinivas, Mrs. Vijayalakshmi represented by her husband and SPA holder Mr. Srinivas, Ms. Harini and Ms. Thanushri both are minors represented by their father Mr. Srinivas, in respect of the property bearing Sy.No.48/4 of Whitefield Village, K.R. Puram Hobli, Bangalore East Taluk, Bangalore District measuring 25 Guntas, in favour of Mr. Naved M. Hassan'
    },
    {
      slNo: 27, date: '', syNo: '48/4', documentType: 'Photostat',
      particulars: 'Encumbrance Certificate for the period from 15/02/1957 to 31/05/1989, 01/06/1989 to 31/03/2004, 01/04/2004 to 25/02/2022, 01/04/2004 to 13/04/2023 and 01/04/2023 to date in respect of Sy No. 48/4'
    },

    // ══════════════════ Approvals & NOCs ══════════════════
    { isSubHeader: true, subHeaderText: 'Approvals, Sanctions & NOCs', syNo: '47/1' },
    {
      slNo: 28, date: '25/01/2022', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Building Plan and License bearing LP No.56 dated 25/01/2022, issued by ADTP, BBMP North Sub Division, Bangalore, (residential apartment comprising Wings A to D with Common 2 Basements + Ground Floor + 19 Upper Floors)'
    },
    {
      slNo: 29, date: '28/02/2022', syNo: '47/1', documentType: 'Photostat',
      particulars: 'RERA Certificate bearing No. PRM/KA/RERA/1251/446/PR/280222/004738 dated 28/02/2022, issued by the Karnataka Real Estate Regulatory Authority, in respect of the project known as Folium by Sumadhura Phase-III'
    },
    {
      slNo: 30, date: '06/04/2023', syNo: '47/1', documentType: 'Photostat',
      particulars: 'NOC dated 06/04/2023 issued by the Assistant General Manager, BSNL, Bangalore, certifying no objection for the proposed development'
    },
    {
      slNo: 31, date: '29/08/2024', syNo: '47/1', documentType: 'Photostat',
      particulars: 'NOC dated 29/08/2024 issued by the Office of the Director General of Police, Commandant General, Home Guards and Director of Civil Defence and Director General Karnataka State Fire and Emergency Services, Bangalore'
    },
    {
      slNo: 32, date: '15/05/2023', syNo: '47/1', documentType: 'Photostat',
      particulars: 'NOC dated 15/05/2023 issued by the General Manager (CIC) Airports Authority of India, KIA, Bangalore, certifying height clearance for the proposed construction'
    },
    {
      slNo: 33, date: '25/02/2025', syNo: '47/1', documentType: 'Photostat',
      particulars: 'Consent for Establishment (CFE) dated 25/02/2025 issued by the Chief/Senior Environmental Officer, KSPCB, Bangalore'
    },
    {
      slNo: 34, date: '15/04/2025', syNo: '47/1', documentType: 'Photostat',
      particulars: 'NOC dated 15/04/2025 issued by the Chief Engineer (East), BWSSB, Bangalore, for water supply connection for the proposed development'
    },
    {
      slNo: 35, date: '28/11/2025', syNo: '47/1', documentType: 'Photostat',
      particulars: 'NOC dated 28/11/2025 issued by the Chief Engineer (Ele), (CO and M) BMAZ North, BESCOM, Bangalore, for electrical connection for the proposed development'
    }
  ],

  titleFlow: [
    { period: '1977-78 to 1979-80', event: 'Sy.No.47/1 held by Mr. Narayanappa as per RTC/Pahani', parties: 'Mr. Narayanappa', documentRef: 'RTC 1977-78 to 1979-80' },
    { period: '14/10/1980', event: 'Partition Deed — Sy.No.47/1 divided: 2A 4G to Muniswamappa, 2A 4G to Lakshmaiah, 36G to Srinivasa', parties: 'Mr. Narayanappa, Mr. Muniswamappa, Mr. Lakshmaiah, Mr. Srinivasa', documentRef: 'Partition Deed' },
    { period: '1995-96', event: 'Mutation Register updated — MR No.3/1995-96 in favour of respective shareholders', parties: 'Mr. Muniswamappa, Mr. Lakshmaiah, Mr. Srinivasa', documentRef: 'MR No.3/1995-96' },
    { period: '29/09/2004 to 07/03/2005', event: 'Multiple Sale Deeds executed by all shareholders transferring their respective shares in Sy.No.47/1 in favour of Mr. Naved M. Hassan', parties: 'Mr. Lakshmaiah, Mr. Muniswamaiah, Mr. Srinivas → Mr. Naved M. Hassan', documentRef: 'Doc No.18183 to 35228/2004-05' },
    { period: '2022', event: 'Joint Development Agreement executed between Mr. Naved M. Hassan and other landowners with M/s Sumadhura Infracon Private Limited for development of residential apartments', parties: 'Mr. Naved M. Hassan, Samarkhand Property Management, H.A. Group & Mrs. Kavitha → M/s Sumadhura Infracon Pvt. Ltd.', documentRef: 'JDA' },
    { period: '28/02/2022', event: 'RERA Registration obtained for Folium by Sumadhura Phase-III', parties: 'M/s Sumadhura Infracon Private Limited', documentRef: 'RERA No. PRM/KA/RERA/…004738' }
  ],

  checklistAnswers: {
    developerAcquiredRightsViaJDA: true,
    landownersEmpoweredDeveloperToSell: true,
    empoweringClause: 'As per clause 9.6 of the JDA and clauses 2, 4, 5, 6 of GPA the Developers are empowered to execute the agreements and Sale deeds in respect of their share of saleable areas',
    considerationType: 'Area Sharing',
    supplementaryAgreementExecuted: true,
    allLandownersSignedSupplementary: true,
    landConverted: true,
    conversionType: 'Residential',
    minorsRights: 'NIL',
    landAcquisitionOrders: 'NIL',
    litigations: 'NIL as per documents furnished',
    otherObservations: 'NIL',
    sarfaesiEnforceable: true
  },

  approvalsSanctions: [
    { authority: 'ADTP, BBMP North Sub Division', type: 'Building Plan', number: 'LP No.56', date: '25/01/2022', description: 'Residential apartment comprising Wings A to D with Common 2 Basements + Ground Floor + 19 Upper Floors' },
    { authority: 'Karnataka Real Estate Regulatory Authority', type: 'RERA', number: 'PRM/KA/RERA/1251/446/PR/280222/004738', date: '28/02/2022', description: 'RERA Registration for Folium by Sumadhura Phase-III' },
    { authority: 'BSNL, Bangalore', type: 'NOC', number: 'Dated 06/04/2023', date: '06/04/2023', description: 'No Objection Certificate from BSNL' },
    { authority: 'Airports Authority of India, KIA Bangalore', type: 'NOC', number: 'Dated 15/05/2023', date: '15/05/2023', description: 'Height clearance NOC from AAI' },
    { authority: 'KSPCB, Bangalore', type: 'CFE', number: 'Dated 25/02/2025', date: '25/02/2025', description: 'Consent for Establishment from Karnataka State Pollution Control Board' },
    { authority: 'BWSSB, Bangalore', type: 'NOC', number: 'Dated 15/04/2025', date: '15/04/2025', description: 'NOC from Bangalore Water Supply and Sewerage Board' },
    { authority: 'BESCOM, Bangalore', type: 'NOC', number: 'Dated 28/11/2025', date: '28/11/2025', description: 'NOC from Bangalore Electricity Supply Company' },
    { authority: 'Bangalore Development Authority', type: 'Commencement Certificate', number: 'Dated 18/05/2024', date: '18/05/2024', description: 'Commencement Certificate in respect of Sy.No.48/5 permitting change of land use from Industrial (Hi-Tech) to Residential' }
  ],

  encumbrances: [
    {
      type: 'Memorandum of Deposit of Title Deeds',
      in_favour_of: 'Bajaj Housing Finance Limited',
      date: '17/10/2022',
      documentNo: 'Doc No.7182/2022-2023',
      remarks: 'Charge created by M/s Sumadhura Infracon Pvt. Ltd. on developer\'s share — NOC required from Bajaj Housing Finance Limited for each unit at the time of individual conveyance'
    }
  ],

  legalInterventions: 'NIL as per documents furnished',

  titleGaps: [
    {
      slNo: 1, syNo: '47/1', severity: 'MEDIUM',
      gapType: 'MR_GAP',
      description: 'Mutation Register Extract not furnished for the period from 14/10/1980 (date of Partition Deed) to MR No.3/1995-96 — Gap of approximately 15 years in Mutation Register entries for Sy.No.47/1',
      documentRequired: 'Mutation Register Extract for the period 1980 to 1995 to be called for'
    },
    {
      slNo: 2, syNo: '47/1', severity: 'HIGH',
      gapType: 'MR_GAP',
      description: 'Mutation Register Extract not furnished in the name of Mr. Naved M. Hassan after the Sale Deeds dated 29/09/2004 to 07/03/2005 conveying Lakshmaiah\'s share of Sy.No.47/1',
      documentRequired: 'Mutation Register Extract in the name of Mr. Naved M. Hassan for Sy.No.47/1 — Lakshmaiah\'s share to be called for'
    },
    {
      slNo: 3, syNo: '47/1', severity: 'MEDIUM',
      gapType: 'EC_GAP',
      description: 'Encumbrance Certificate for the current period (01/04/2023 to date) not furnished in respect of Sy.No.47/1',
      documentRequired: 'Latest Encumbrance Certificate from 01/04/2023 to date for Sy.No.47/1 to be called for before disbursal'
    },
    {
      slNo: 4, syNo: '48/4', severity: 'HIGH',
      gapType: 'MISSING_LINK',
      description: 'Link between original pattadar Mr. Ballari Munishami @ Doddamunishamappa (as per RTC 1967-68 to 1979-80) and the subsequent partition parties (Mr. Narayanappa, Mr. Muniswamappa, Mr. Lakshmaiah, Mr. Srinivasa) not established — Family relationship / succession document not furnished',
      documentRequired: 'Legal Heirship Certificate / Succession Certificate or Family Tree document establishing the relationship between Mr. Ballari Munishami and the Partition parties to be called for'
    },
    {
      slNo: 5, syNo: '48/4', severity: 'LOW',
      gapType: 'EC_GAP',
      description: 'Encumbrance Certificate for the current period (01/04/2023 to date) not furnished in respect of Sy.No.48/4',
      documentRequired: 'Latest Encumbrance Certificate from 01/04/2023 to date for Sy.No.48/4 to be called for before disbursal'
    }
  ],

  documentsBeforeDisbursal: {
    developerShare: [
      { slNo: 1, particulars: 'Agreement of Sale executed by Mr. Naved M. Hassan, M/s Samarkhand Property Management Pvt. Ltd. represented by its Director Mr. Naved M. Shah, Mr. H.A. Srinivas, Mr. H.A. Narendra Kumar, Mr. H.A. Somashekar, Mr. H.A. Satish Kumar, Mrs. Kavitha and represented by GPA holder M/s Sumadhura Infracon Private Limited in respect of the Residential Apartments intended to be purchased by the Borrower', documentType: 'Photostat' },
      { slNo: 2, particulars: 'Encumbrance Certificate for the period from the date of Plan Sanction till date', documentType: 'Photostat' },
      { slNo: 3, particulars: 'Own Contribution Receipts', documentType: 'Photostat' },
      { slNo: 4, particulars: 'e-Khata issued in respect of the Residential Apartments intended to be purchased by the Borrower', documentType: 'Photostat' },
      { slNo: 5, particulars: 'NOC issued by the Financial Institute (Bajaj Housing Finance Limited) in respect of the Residential Apartments intended to be purchased by the Borrower', documentType: 'Photostat' }
    ],
    landownerShare: [
      { slNo: 1, particulars: 'Agreement of Sale executed by Mr. Naved M. Hassan and other Landowners in respect of the Residential Apartments intended to be purchased by the Borrower', documentType: 'Photostat' },
      { slNo: 2, particulars: 'Encumbrance Certificate for the period from the date of Plan Sanction till date', documentType: 'Photostat' },
      { slNo: 3, particulars: 'Own Contribution Receipts', documentType: 'Photostat' },
      { slNo: 4, particulars: 'e-Khata issued in respect of the Residential Apartments intended to be purchased by the Borrower', documentType: 'Photostat' },
      { slNo: 5, particulars: 'NOC issued by the Financial Institute in respect of the Residential Apartments intended to be purchased by the Borrower', documentType: 'Photostat' }
    ]
  },

  documentsForCharge: {
    developerShare: [
      { slNo: 1, particulars: 'Agreement of Sale executed by Landowners/Developer in respect of the Residential Apartments intended to be purchased by the Borrower', documentType: 'Original' },
      { slNo: 2, particulars: 'Encumbrance Certificate for the period from the date of Plan Sanction till date', documentType: 'Digitally Signed' },
      { slNo: 3, particulars: 'Own Contribution Receipts', documentType: 'Original' },
      { slNo: 4, particulars: 'e-Khata issued in respect of the Residential Apartments', documentType: 'Digitally Signed' },
      { slNo: 5, particulars: 'NOC issued by Bajaj Housing Finance Limited for individual unit', documentType: 'Original' }
    ],
    landownerShare: [
      { slNo: 1, particulars: 'Agreement of Sale executed by Landowners in respect of the Residential Apartments intended to be purchased by the Borrower', documentType: 'Original' },
      { slNo: 2, particulars: 'Encumbrance Certificate for the period from the date of Plan Sanction till date', documentType: 'Digitally Signed' },
      { slNo: 3, particulars: 'Own Contribution Receipts', documentType: 'Original' },
      { slNo: 4, particulars: 'e-Khata issued in respect of the Residential Apartments', documentType: 'Digitally Signed' },
      { slNo: 5, particulars: 'NOC issued by Financial Institute', documentType: 'Original' }
    ]
  },

  documentsPostDisbursal: {
    developerShare: [
      { slNo: 1, document: 'Sale Deed to be executed by Mr. Naved M. Hassan, M/s Samarkhand Property Management Pvt. Ltd. represented by its Director Mr. Naved M. Shah, Mr. H.A. Srinivas, Mr. H.A. Narendra Kumar, Mr. H.A. Somashekar, Mr. H.A. Satish Kumar, Mrs. Kavitha and represented by GPA holder M/s Sumadhura Infracon Private Limited and M/s Sumadhura Infracon Private Limited represented by its Authorised Signatory in respect of the Residential Apartments in favour of the Prospective Purchasers who are availing loan facility from Axis Bank Limited for their respective units' }
    ],
    landownerShare: [
      { slNo: 1, document: 'Sale Deed to be executed by Mr. Naved M. Hassan, M/s Samarkhand Property Management Pvt. Ltd. represented by its Director Mr. Naved M. Shah, Mr. H.A. Srinivas, Mr. H.A. Narendra Kumar, Mr. H.A. Somashekar, Mr. H.A. Satish Kumar, Mrs. Kavitha and M/s Sumadhura Infracon Private Limited in respect of the Residential Apartments in favour of the Prospective Purchasers who are availing loan facility from Axis Bank Limited for their respective units' }
    ]
  },

  btDetails: 'The developer has created a charge over his share of salable areas in favour of Bajaj Housing Finance Limited vide Memorandum of Deposit of Title Deeds dated 17/10/2022 registered as Document No.7182/2022-2023 and the same need to be redeemed by way of NOC for each unit when they are conveying to their prospective purchasers.',

  opinion: 'Thus it is evident from the above title flow that Mr. Naved M. Hassan, M/s Samarkhand Property Management Pvt. Ltd. represented by its Director Mr. Naved M. Shah, Mr. H.A. Srinivas, Mr. H.A. Narendra Kumar, Mr. H.A. Somashekar, Mr. H.A. Satish Kumar, Mrs. Kavitha and M/s Sumadhura Infracon Private Limited are the absolute owners of the Property bearing Sy No. 47/1 (measuring 5 acres 4 guntas), Sy No. 48/4 (measuring 1 acre 38 guntas), Sy No. 47/2A (measuring 1 acre 16½ guntas), Sy No. 47/3 (measuring 1 acre 16½ guntas), Sy No. 47/2B (measuring 31 guntas), Sy No. 48/3 (measuring 29.03 guntas), Sy No. 48/1C (measuring 4 acre 05 guntas), Sy No. 48/5, Old No. 48/1B1 (measuring 1 acre) of Whitefield Village, KR Puram Hobli, Bangalore East Taluk, Bangalore totally measuring 16 acres 20.03 guntas and they have executed Joint Development Agreements in respect of the said property in favour of M/s Sumadhura Infracon Private Limited and by virtue of the said JDAs the above said M/s Sumadhura Infracon Private Limited have acquired rights over certain built up areas in the proposed development in the said land. I am of the Opinion that M/s Sumadhura Infracon Private Limited are entitled to sell or deal or Mortgage in respect of their share of built up areas in the proposed development Folium by Sumadhura Phase-III in the said land as they may deem fit upon receiving NOC from the financial institute where they availed finance for the construction of the project Folium by Sumadhura Phase-III.',

  subjectTo: [
    'Verification of all the original documents',
    'Encumbrance Certificate should be verified at your end before the mortgage transaction is put through',
    'An officer of the Bank has to make personal inspection to identify, confirm the existence of the property with correct boundaries and also to ascertain the physical possession of the property by borrower/Mortgagor and his vendor',
    'The genuineness of documents and signatures on the documents cannot be ascertained by us and hence adequate precautions should be taken to confirm the integrity of the borrower/mortgagor/Vendors in title',
    'The Original documents should be verified at your end before the mortgage transaction is put through',
    'Encumbrance Certificate for the period from 10/02/2025 to till date for the Project Land to be verified',
    'NOC from Bajaj Housing Finance Limited to be obtained in respect of the developer\'s share of each unit before conveyance'
  ],

  translatedContent: { hasIndianLanguageContent: false, languages: [], translationNotes: '' },
  riskFlags: [],
  overallStatus: 'CONDITIONALLY CLEAR',
  summary: 'The property bearing Sy.No.47/1 and 48/4 of Whitefield Village was originally held by the respective family members and has been transferred to Mr. Naved M. Hassan and other landowners through various Sale Deeds. The landowners have subsequently executed Joint Development Agreements with M/s Sumadhura Infracon Private Limited for development of residential apartments. The title is conditionally clear subject to furnishing of Mutation Register Extracts and latest Encumbrance Certificates as noted.'
};

// ── Generate the report ────────────────────────────────────────────────────────
async function main() {
  console.log('\n📝 Generating demo Legal Scrutiny Report...\n');
  console.log('   Documents listed:', reportData.documentsFurnished.filter(d => !d.isGap && !d.isSubHeader).length);
  console.log('   Gap rows:', reportData.documentsFurnished.filter(d => d.isGap).length);
  console.log('   Sub-headers:', reportData.documentsFurnished.filter(d => d.isSubHeader).length);
  console.log('   Title gaps noted:', reportData.titleGaps.length);
  console.log('   Status:', reportData.overallStatus);

  const outputPath = 'C:/Users/drsra/OneDrive/Desktop/DEMO_Legal_Scrutiny_Report_Sumadhura_Phase3.docx';

  try {
    await generateLegalReport(
      reportData,
      outputPath,
      'M/s. Aneesh Associates Private Limited',
      'Dr. Sravan Kumar D'
    );
    console.log('\n✅ DEMO REPORT GENERATED SUCCESSFULLY');
    console.log('   📄 File: ' + outputPath);
    console.log('\n   Open it in Microsoft Word to review the format.\n');
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error(e.stack);
  }
}

main();
