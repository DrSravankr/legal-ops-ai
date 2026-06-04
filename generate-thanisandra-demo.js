require('./backend/server.env');
const { generateLegalReport } = require('./backend/generators/reportGenerator');

// â”€â”€â”€ Full professional report â€” all party names, extents and dates from actual documents â”€â”€â”€

const reportData = {
  reportHeader: {
    refNo: 'AAPL/AXI/APF-KA/12-06/2026',
    date: '04/06/2026',
    reportTitle: 'LEGAL SCRUTINY REPORT',
    addressee: {
      designation: 'The Assistant Vice President',
      department: 'Head-Retail Asset Centre',
      bank: 'Axis Bank Limited',
      city: 'Bangalore'
    }
  },

  subjectLine: 'Legal Scrutiny Report in respect of the Project of M/s. Ramky Estates and Farms Limited at Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk',

  propertyDetails: {
    apfNo: '',
    applicantName: 'M/s. Ramky Estates and Farms Limited',
    coApplicantName: null,
    natureOfTransaction: 'Project Approval (APF)',
    natureOfProperty: 'Residential',
    ownerNames: [
      'Mr. N. Kumar, son of Late D. A. Nagappa',
      'Mrs. N. Padmavathi, daughter of Late D. A. Nagappa W/o Mr. Srinivas',
      'Mrs. N. Rama, daughter of Late D. A. Nagappa W/o Mr. P. Ravindra'
    ],
    developerName: 'M/s. Ramky Estates and Farms Limited',
    reraNo: '',
    scheduleProperty: {
      description: 'All that piece and parcel of the proposed development to be developed in properties bearing Sy.No.106/3 (measuring 10 Guntas), Sy.No.106/5 (Old Sy.No.106/2, measuring 2 Acres 25.08 Guntas), Sy.No.106/4 (measuring 10 Guntas) and Sy.No.108 (measuring 12.34 Guntas) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District',
      surveyNumbers: [
        { syNo: '106/3', measurement: '10 Guntas', village: 'Thirumenahalli', hobli: 'Yelahanka Hobli', taluk: 'Bangalore North Taluk', district: 'Bangalore' },
        { syNo: '106/4', measurement: '10 Guntas', village: 'Thirumenahalli', hobli: 'Yelahanka Hobli', taluk: 'Bangalore North Taluk', district: 'Bangalore' },
        { syNo: '106/5', measurement: '2 Acres 25.08 Guntas', village: 'Thirumenahalli', hobli: 'Yelahanka Hobli', taluk: 'Bangalore North Taluk', district: 'Bangalore' },
        { syNo: '108', measurement: '12.34 Guntas', village: 'Thirumenahalli', hobli: 'Yelahanka Hobli', taluk: 'Bangalore North Taluk', district: 'Bangalore' }
      ],
      totalMeasurement: 'Approximately 3 Acres 18 Guntas',
      boundaries: {
        east: '40 Feet Road (as per GPA of Mr. N. Kumar)',
        west: 'Sy.No.106/1',
        north: 'Sy.No.105',
        south: 'Sy.No.107 and Sy.No.108'
      }
    }
  },

  documentsFurnished: [

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Sy.No.106 â€” Parent Survey
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    { isSubHeader: true, subHeaderText: 'Sy.No.106', syNo: '106' },

    {
      slNo: 1, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Record of Tenancy and Crops (RTC/Pahani) for the year 1981-82 to 2000-01, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 5 Acres 20 Guntas (Pattadars: S.S. Venkata Reddy S/o Muthyal Reddy for years 1981-82 to 1991-92; Mrs. Gullamma W/o Mr. D.A. Nagappa for years 1997-98 to 1999-2000)'
    },
    {
      slNo: 2, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Record of Tenancy and Crops (RTC/Pahani) for the year 2001-02 to 2010-11, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 3 Acres 13 Guntas (Mrs. Gullamma W/o Mr. D.A. Nagappa)'
    },
    {
      slNo: 3, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Record of Tenancy and Crops (RTC/Pahani) for the year 2012-13 to 2022-23, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },
    {
      slNo: 4, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Original Pakka Book in respect of the property bearing Sy.No.106 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },
    {
      slNo: 5, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Tippani issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },
    {
      slNo: 6, date: '15/04/1987', syNo: '106', documentType: 'Photostat',
      particulars: 'Sale Deed registered as Document No.3961, executed on 13/04/1987 and registered on 15/04/1987 before the First Grade Sub-Registrar, Bangalore North Taluk, executed by Mrs. Sriranga W/o Mr. Vasanth Kumar, Mr. S. Ramakrishna, Mrs. Kanthamani and Mr. D.S. Iythreyan (all children of Late D. Sampath Iyengar), in respect of the property bearing Sy.No.106 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 3 Acres 13 Guntas in favour of Mrs. Gullamma, daughter of Mrs. Kattamma W/o Mr. D. A. Nagappa'
    },
    {
      slNo: 7, date: '22/06/2012', syNo: '106', documentType: 'Photostat',
      particulars: 'Partition Deed registered as Document No.YAN-1-02022-2012-13, executed and registered on 22/06/2012 before the Sub-Registrar, Yelahanka, Bengaluru, entered between Mr. N. Kumar, son of Late D. A. Nagappa (Party of the First Part), Mrs. N. Padmavathi, daughter of Late D. A. Nagappa W/o Mr. Srinivas (Party of the Second Part) and Mrs. N. Rama, daughter of Late D. A. Nagappa W/o Mr. P. Ravindra (Party of the Third Part) in respect of their Joint Family Properties including the property bearing Sy.No.106 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 3 Acres 13 Guntas (land measuring to an extent of 2 Acres 33 Guntas fallen to the share of Mr. N. Kumar, land measuring to an extent of 10 Guntas (Sy.No.106/3) fallen to the share of Mrs. N. Padmavathi and land measuring to an extent of 10 Guntas (Sy.No.106/4) fallen to the share of Mrs. N. Rama)'
    },
    {
      slNo: 8, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Conversion copy in respect of Sy.No.106 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District converting the property from Agricultural use to Non-Agricultural use'
    },

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Sy.No.106/3 â€” Mrs. N. Padmavathi's Share
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    { isSubHeader: true, subHeaderText: "Sy.No.106/3 â€” Mrs. N. Padmavathi's Share", syNo: '106/3' },

    {
      slNo: 9, date: '', syNo: '106/3', documentType: 'Photostat',
      particulars: 'Record of Tenancy and Crops (RTC/Pahani) for the current year, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106/3 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas (Pattadar: Mrs. N. Padmavathi, daughter of Late D. A. Nagappa)'
    },
    {
      slNo: 10, date: '28/03/2024', syNo: '106/3', documentType: 'Photostat',
      particulars: 'Mutation Register Extract bearing MR No.T19/2023-24 dated 13/03/2024, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106/3 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas in favour of Mrs. N. Padmavathi, daughter of Late D. A. Nagappa'
    },
    {
      slNo: 11, date: '', syNo: '106/3', documentType: 'Photostat',
      particulars: 'Akarband (Area Statement) issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106/3 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas'
    },

    { isGap: true, syNo: '106/3', severity: 'HIGH', gapType: 'EC_GAP',
      gapDescription: 'Encumbrance Certificate for the period prior to 01/04/2015 not furnished in respect of Sy.No.106/3 of Thirumenahalli Village â€” EC from the date of the Partition Deed (22/06/2012) to 31/03/2015 to be called for' },

    {
      slNo: 12, date: '13/03/2024', syNo: '106/3', documentType: 'Photostat',
      particulars: 'Conversion Order bearing No.625818 dated 13/03/2024, issued by the Deputy Commissioner, Bengaluru Urban District, in respect of the property bearing Sy.No.106/3 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas, applied by Mrs. N. Padmavathi, daughter of Late D. A. Nagappa, converting the land from Agricultural use to Residential use (Personal Housing)'
    },
    {
      slNo: 13, date: '', syNo: '106/3', documentType: 'Photostat',
      particulars: 'Conversion Sketch in respect of Sy.No.106/3 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas'
    },
    {
      slNo: 14, date: '', syNo: '106/3', documentType: 'Photostat',
      particulars: 'Encumbrance Certificate for the period from 01/04/2015 to 13/11/2024 in respect of Sy.No.106/3 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas'
    },

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Sy.No.106/4 â€” Mrs. N. Rama's Share
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    { isSubHeader: true, subHeaderText: "Sy.No.106/4 â€” Mrs. N. Rama's Share", syNo: '106/4' },

    {
      slNo: 15, date: '', syNo: '106/4', documentType: 'Photostat',
      particulars: 'Record of Tenancy and Crops (RTC/Pahani) for the current year, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106/4 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas (Pattadar: Mrs. N. Rama, daughter of Late D. A. Nagappa)'
    },
    {
      slNo: 16, date: '17/12/2024', syNo: '106/4', documentType: 'Photostat',
      particulars: 'Mutation Register Extract bearing MR No.T10/2024-25 dated 16/12/2024, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106/4 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas in favour of Mrs. N. Rama, daughter of Late D. A. Nagappa'
    },
    {
      slNo: 17, date: '', syNo: '106/4', documentType: 'Photostat',
      particulars: 'Akarband (Area Statement) issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106/4 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas'
    },
    {
      slNo: 18, date: '', syNo: '106/4', documentType: 'Photostat',
      particulars: 'Survey Documents and Survey Sketch in respect of Sy.No.106/4 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas'
    },

    { isGap: true, syNo: '106/4', severity: 'HIGH', gapType: 'EC_GAP',
      gapDescription: 'Encumbrance Certificate for the period prior to 01/04/2015 not furnished in respect of Sy.No.106/4 of Thirumenahalli Village â€” EC from the date of the Partition Deed (22/06/2012) to 31/03/2015 to be called for' },

    {
      slNo: 19, date: '16/12/2024', syNo: '106/4', documentType: 'Photostat',
      particulars: 'Conversion Order bearing No.702019 dated 16/12/2024, issued by the Deputy Commissioner, Bengaluru Urban District, in respect of the property bearing Sy.No.106/4 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas, applied by Mrs. N. Rama, daughter of Late D. A. Nagappa, converting the land from Agricultural use to Residential use (Personal Housing)'
    },
    {
      slNo: 20, date: '', syNo: '106/4', documentType: 'Photostat',
      particulars: 'Conversion Sketch in respect of Sy.No.106/4 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas'
    },
    {
      slNo: 21, date: '', syNo: '106/4', documentType: 'Photostat',
      particulars: 'Encumbrance Certificate for the period from 01/04/2015 to 13/11/2024 in respect of Sy.No.106/4 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 10 Guntas'
    },
    {
      slNo: 22, date: '', syNo: '106/4', documentType: 'Photostat',
      particulars: 'Encumbrance Certificate for an earlier period in respect of Sy.No.106/4 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Sy.No.106/5 (Old 106/2) â€” Mr. N. Kumar's Share
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    { isSubHeader: true, subHeaderText: "Sy.No.106/5 (Old Sy.No.106/2) â€” Mr. N. Kumar's Share", syNo: '106/5' },

    {
      slNo: 23, date: '', syNo: '106/5', documentType: 'Photostat',
      particulars: 'Record of Tenancy and Crops (RTC/Pahani) for the current year, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106/5 (Old Sy.No.106/2) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 2 Acres 25.08 Guntas (Pattadar: Mr. N. Kumar, son of Late D. A. Nagappa)'
    },
    {
      slNo: 24, date: '28/03/2024', syNo: '106/5', documentType: 'Photostat',
      particulars: 'Mutation Register Extract bearing MR No.T20/2023-24 dated 13/03/2024, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106/5 (Old Sy.No.106/2) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 2 Acres 25.08 Guntas in favour of Mr. N. Kumar, son of Late D. A. Nagappa'
    },
    {
      slNo: 25, date: '', syNo: '106/5', documentType: 'Photostat',
      particulars: 'Akarband (Area Statement) issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.106/5 (Old Sy.No.106/2) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 2 Acres 25.08 Guntas'
    },

    { isGap: true, syNo: '106/5', severity: 'HIGH', gapType: 'EC_GAP',
      gapDescription: 'Encumbrance Certificate for the period prior to 01/04/2015 not furnished in respect of Sy.No.106/5 (Old Sy.No.106/2) of Thirumenahalli Village â€” EC from the date of the Partition Deed (22/06/2012) to 31/03/2015 to be called for' },

    {
      slNo: 26, date: '13/03/2024', syNo: '106/5', documentType: 'Photostat',
      particulars: 'Conversion Order bearing No.625820 dated 13/03/2024, issued by the Deputy Commissioner, Bengaluru Urban District, in respect of the property bearing Sy.No.106/5 (Old Sy.No.106/2) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 2 Acres 25.08 Guntas, applied by Mr. N. Kumar, son of Late D. A. Nagappa, converting the land from Agricultural use to Residential use (Personal Housing)'
    },
    {
      slNo: 27, date: '', syNo: '106/5', documentType: 'Photostat',
      particulars: 'Conversion Sketch in respect of Sy.No.106/5 (Old Sy.No.106/2) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 2 Acres 25.08 Guntas'
    },
    {
      slNo: 28, date: '', syNo: '106/5', documentType: 'Photostat',
      particulars: 'Encumbrance Certificate for the period from 01/04/2015 to 13/11/2024 in respect of Sy.No.106/5 (Old Sy.No.106/2) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 2 Acres 25.08 Guntas'
    },

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Sy.No.108
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    { isSubHeader: true, subHeaderText: 'Sy.No.108', syNo: '108' },

    {
      slNo: 29, date: '', syNo: '108', documentType: 'Photostat',
      particulars: 'Record of Tenancy and Crops (RTC/Pahani) for the year 2015-16 to 2025-26, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District (Pattadar: Mrs. Sreedevi W/o Purushothamareddy)'
    },
    {
      slNo: 30, date: '31/01/2014', syNo: '108', documentType: 'Photostat',
      particulars: 'Conversion Order bearing No.ALN/SR(NA)/246/04-05 dated 31/01/2014 (Revised Order), issued by the Deputy Commissioner, Bengaluru District, in respect of Sy.No.108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 5 Acres 17 Guntas, applied by Mrs. Sridevi W/o Marushottam Reddy, Mr. Pavankumar S/o Purushottam Reddy and Mr. Naveen Kumar S/o Purushottam Reddy, revising the use from Non-Agricultural (Educational) to Non-Agricultural (Residential) â€” Original Conversion Order No. ALN/SR(NA)/246/04-05 dated 03/12/2004'
    },
    {
      slNo: 31, date: '', syNo: '108', documentType: 'Photostat',
      particulars: 'Exchange Deed in respect of a portion of the property bearing Sy.No.108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 12.34 Guntas â€” exchanged with Mr. N. Kumar, son of Late D. A. Nagappa'
    },
    {
      slNo: 32, date: '', syNo: '108', documentType: 'Photostat',
      particulars: 'Akarband (Area Statement) issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },

    { isGap: true, syNo: '108', severity: 'HIGH', gapType: 'EC_GAP',
      gapDescription: 'Encumbrance Certificate for the period prior to 01/04/2015 not furnished in respect of Sy.No.108 of Thirumenahalli Village â€” EC from the date of the Conversion Order (03/12/2004) to 31/03/2015 to be called for' },

    {
      slNo: 33, date: '', syNo: '108', documentType: 'Photostat',
      particulars: 'Encumbrance Certificate for the period from 01/04/2015 to 13/11/2024 in respect of Sy.No.108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },
    {
      slNo: 34, date: '16/01/2025', syNo: '108', documentType: 'Photostat',
      particulars: 'Property Tax Receipt bearing Receipt No.24254403013 dated 16/01/2025, issued by Bruhat Bengaluru Mahanagara Palike (BBMP), Ward No.5 â€” Jakkur, in respect of the property bearing Sy.No.108 (PID No.101/108) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District for the year 2024-25'
    },
    {
      slNo: 35, date: '', syNo: '108', documentType: 'Photostat',
      particulars: 'e-Khata issued by Bruhat Bengaluru Mahanagara Palike (BBMP) in respect of the property bearing Sy.No.108 (PID No.101/108) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // JDA & GPA
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    { isSubHeader: true, subHeaderText: 'Joint Development Agreements and General Powers of Attorney', syNo: '106' },

    {
      slNo: 36, date: '17/05/2023', syNo: '106', documentType: 'Photostat',
      particulars: 'Joint Development Agreement registered as Document No.818/2023-24, executed on 17/05/2023 and registered before the Sub-Registrar, Kachara Kanahalli, Bengaluru, entered between Mr. N. Kumar, son of Late D. A. Nagappa (Landowner) and M/s. Ramky Estates and Farms Limited represented by its Authorised Signatory Mr. A. V. Bhaskar Reddy (Developer) in respect of the property bearing Sy.No.106/2 (measuring 2 Acres 25.08 Guntas) and Sy.No.108 (measuring 12.34 Guntas) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },
    {
      slNo: 37, date: '17/05/2023', syNo: '106', documentType: 'Photostat',
      particulars: 'Joint Development Agreement registered as Document No.819/2023-24, executed on 17/05/2023 and registered before the Sub-Registrar, Kachara Kanahalli, Bengaluru, entered between Mrs. N. Padmavathi, daughter of Late D. A. Nagappa W/o Mr. Srinivas (Landowner) and M/s. Ramky Estates and Farms Limited represented by its Authorised Signatory Mr. A. V. Bhaskar Reddy (Developer) in respect of the property bearing Sy.No.106/3 (measuring 10 Guntas) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },
    {
      slNo: 38, date: '07/08/2024', syNo: '106', documentType: 'Photostat',
      particulars: 'Joint Development Agreement registered as Document No.KCH-1-2430-24, executed on 07/08/2024, entered between Mrs. N. Rama, daughter of Late D. A. Nagappa W/o Mr. P. Ravindra (Landowner) and M/s. Ramky Estates and Farms Limited represented by its Authorised Signatory Mr. A. V. Bhaskar Reddy (Developer) in respect of the property bearing Sy.No.106/4 (measuring 10 Guntas) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },
    {
      slNo: 39, date: '17/05/2023', syNo: '106', documentType: 'Photostat',
      particulars: 'Irrevocable General Power of Attorney registered as Document No.KCH-4-00014-2023-24, executed on 17/05/2023 and registered before the Sub-Registrar, Gandhinagar (Kachara Kanahalli), Bengaluru, executed by Mr. N. Kumar, son of Late D. A. Nagappa (aged about 46 years) in respect of the property bearing Sy.No.106/2 (measuring 2 Acres 25.08 Guntas) and Sy.No.108 (measuring 12.34 Guntas) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District in favour of M/s. Ramky Estates and Farms Limited represented by Mr. A. V. Bhaskar Reddy, Authorised Signatory'
    },
    {
      slNo: 40, date: '17/05/2023', syNo: '106', documentType: 'Photostat',
      particulars: 'Irrevocable General Power of Attorney registered as Document No.KCH-1-00819-2023-24, executed on 17/05/2023 and registered before the Sub-Registrar, Gandhinagar (Kachara Kanahalli), Bengaluru, executed by Mrs. N. Padmavathi, daughter of Late D. A. Nagappa W/o Mr. Srinivas (aged 56 years), residing at No.50, 4th Main, 2nd Block, Ramamurthy Nagar, Bengaluru-560016, in respect of the property bearing Sy.No.106/3 (measuring 10 Guntas) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District in favour of M/s. Ramky Estates and Farms Limited represented by Mr. A. V. Bhaskar Reddy, Authorised Signatory'
    },
    {
      slNo: 41, date: '07/08/2024', syNo: '106', documentType: 'Photostat',
      particulars: 'Irrevocable General Power of Attorney registered as BNG(U)KCH.47/2024-25, executed on 07/08/2024, executed by Mrs. N. Rama, daughter of Late D. A. Nagappa W/o Mr. P. Ravindra (aged about 53 years), residing at No.262, 1st Main, Singasandra, Hosur Road, Bengaluru-560068, in respect of the property bearing Sy.No.106/4 (measuring 10 Guntas) of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District in favour of M/s. Ramky Estates and Farms Limited represented by Mr. A. V. Bhaskar Reddy, Authorised Signatory'
    },

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // NOCs, Approvals & Other Documents
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    { isSubHeader: true, subHeaderText: 'Approvals, NOCs and Other Documents', syNo: '106' },

    {
      slNo: 42, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'NOC issued by the Airports Authority of India, Kempegowda International Airport, Bangalore, in respect of the proposed development at Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District in favour of M/s. Ramky Estates and Farms Limited'
    },
    {
      slNo: 43, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'NOC issued by BSNL in respect of the proposed development at Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District in favour of M/s. Ramky Estates and Farms Limited'
    },
    {
      slNo: 44, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'NOC issued by BESCOM in respect of the proposed development at Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District in favour of M/s. Ramky Estates and Farms Limited'
    },
    {
      slNo: 45, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Environmental Clearance issued by the Ministry of Environment, Forest and Climate Change in respect of the proposed development at Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk in favour of M/s. Ramky Estates and Farms Limited'
    },
    {
      slNo: 46, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Plot Approval Acknowledgement issued by the competent authority in respect of the proposed development at Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District in favour of M/s. Ramky Estates and Farms Limited'
    },
    {
      slNo: 47, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Land Acquisition Sketch in respect of the properties bearing Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },
    {
      slNo: 48, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Survey Sketch and Hudbast Sketch issued by the Jurisdictional Survey Authority in respect of the properties bearing Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },
    {
      slNo: 49, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Memorandum and Articles of Association of M/s. Ramky Estates and Farms Limited (CIN: U70102TG1995PLC021333) evidencing the incorporation of the Company and its objects in Real Estate Business'
    },
    {
      slNo: 50, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Tax Paid Receipts in respect of the properties bearing Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },
    {
      slNo: 51, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Hadubastu (Hudbust) copy and Project documents in respect of the proposed development at Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },
    {
      slNo: 52, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'Legal Documents List in respect of the project at Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District'
    },
    {
      slNo: 53, date: '', syNo: '106', documentType: 'Photostat',
      particulars: 'KYC documents of the Landowners â€” Mr. N. Kumar, son of Late D. A. Nagappa (residing at No.54, 2nd Floor, 15th Cross, Eshwara Layout, Indiranagar 2nd Stage, Bengaluru-560038) and Mrs. N. Padmavathi, daughter of Late D. A. Nagappa (residing at No.50, 4th Main, 2nd Block, Ramamurthy Nagar, Bengaluru-560016)'
    }
  ],

  titleFlow: [
    // COMMON DOCUMENTS
    { syNo: 'common', period: 'Pre-1987', event: 'The property bearing Sy.No.106 of Thirumenahalli Village was held by S.S. Venkata Reddy S/o Muthyal Reddy and subsequently by Mr. S. Ramakrishna and Mrs. S. Muthyalamma as pattadars as per RTC records for the years 1981-82 to 1991-92.', documentRef: 'RTC 1981-82 to 2000-01' },
    { syNo: 'common', period: '15/04/1987', event: 'Sale Deed registered as Document No.3961 executed by Mrs. Sriranga W/o Mr. Vasanth Kumar, Mr. S. Ramakrishna, Mrs. Kanthamani and Mr. D.S. Iythreyan (all children of Late D. Sampath Iyengar) in respect of Sy.No.106 of Thirumenahalli Village measuring 3 Acres 13 Guntas in favour of Mrs. Gullamma, daughter of Mrs. Kattamma W/o Mr. D. A. Nagappa for a consideration of Rs.40,000/- — registered before the First Grade Sub-Registrar, Bangalore North Taluk.', documentRef: 'Sale Deed No.3961 dated 15/04/1987' },
    { syNo: 'common', period: '1997 to 2012', event: 'Sy.No.106 of Thirumenahalli Village measuring 3 Acres 13 Guntas continued in the name of Mrs. Gullamma W/o Mr. D. A. Nagappa as pattadar as per RTC records for the years 1997-98 to 2010-11.', documentRef: 'RTC 2001-02 to 2010-11' },
    { syNo: 'common', period: '22/06/2012', event: 'Partition Deed registered as Document No.YAN-1-02022-2012-13 entered between Mr. N. Kumar (Party of the First Part), Mrs. N. Padmavathi, daughter of Late D. A. Nagappa W/o Mr. Srinivas (Party of the Second Part) and Mrs. N. Rama, daughter of Late D. A. Nagappa W/o Mr. P. Ravindra (Party of the Third Part) in respect of Sy.No.106 of Thirumenahalli Village measuring 3 Acres 13 Guntas resulting in: 2 Acres 33 Guntas (Sy.No.106/2) to Mr. N. Kumar; 10 Guntas (Sy.No.106/3) to Mrs. N. Padmavathi; 10 Guntas (Sy.No.106/4) to Mrs. N. Rama.', documentRef: 'Partition Deed No.YAN-1-02022-2012-13 dated 22/06/2012' },

    // Sy.No.106/3
    { syNo: '106/3', period: '28/03/2024', event: 'Mutation Register Extract bearing MR No.T19/2023-24 dated 13/03/2024 effected in favour of Mrs. N. Padmavathi, daughter of Late D. A. Nagappa in respect of Sy.No.106/3 measuring 10 Guntas of Thirumenahalli Village.', documentRef: 'MR No.T19/2023-24' },
    { syNo: '106/3', period: '13/03/2024', event: 'Conversion Order No.625818 dated 13/03/2024 issued by the Deputy Commissioner, Bengaluru Urban District, converting Sy.No.106/3 measuring 10 Guntas of Thirumenahalli Village from Agricultural use to Residential use — Applicant: Mrs. N. Padmavathi, daughter of Late D. A. Nagappa.', documentRef: 'Conversion Order No.625818 dated 13/03/2024' },
    { syNo: '106/3', period: '17/05/2023', event: 'JDA No.819/2023-24 and Irrevocable GPA No.KCH-1-00819-2023-24 executed by Mrs. N. Padmavathi, daughter of Late D. A. Nagappa W/o Mr. Srinivas in respect of Sy.No.106/3 measuring 10 Guntas in favour of M/s. Ramky Estates and Farms Limited represented by Mr. A. V. Bhaskar Reddy — registered before the Sub-Registrar, Kachara Kanahalli, Bengaluru.', documentRef: 'JDA No.819/2023-24; GPA No.KCH-1-00819-2023-24 dated 17/05/2023' },

    // Sy.No.106/4
    { syNo: '106/4', period: '17/12/2024', event: 'Mutation Register Extract bearing MR No.T10/2024-25 dated 16/12/2024 effected in favour of Mrs. N. Rama, daughter of Late D. A. Nagappa in respect of Sy.No.106/4 measuring 10 Guntas of Thirumenahalli Village.', documentRef: 'MR No.T10/2024-25' },
    { syNo: '106/4', period: '16/12/2024', event: 'Conversion Order No.702019 dated 16/12/2024 issued by the Deputy Commissioner, Bengaluru Urban District, converting Sy.No.106/4 measuring 10 Guntas of Thirumenahalli Village from Agricultural use to Residential use — Applicant: Mrs. N. Rama, daughter of Late D. A. Nagappa.', documentRef: 'Conversion Order No.702019 dated 16/12/2024' },
    { syNo: '106/4', period: '07/08/2024', event: 'JDA No.KCH-1-2430-24 and Irrevocable GPA No.BNG(U)KCH.47/2024-25 executed by Mrs. N. Rama, daughter of Late D. A. Nagappa W/o Mr. P. Ravindra in respect of Sy.No.106/4 measuring 10 Guntas in favour of M/s. Ramky Estates and Farms Limited represented by Mr. A. V. Bhaskar Reddy.', documentRef: 'JDA No.KCH-1-2430-24; GPA No.BNG(U)KCH.47/2024-25 dated 07/08/2024' },

    // Sy.No.106/5
    { syNo: '106/5', period: '28/03/2024', event: 'Mutation Register Extract bearing MR No.T20/2023-24 dated 13/03/2024 effected in favour of Mr. N. Kumar, son of Late D. A. Nagappa in respect of Sy.No.106/5 (Old Sy.No.106/2) measuring 2 Acres 25.08 Guntas of Thirumenahalli Village.', documentRef: 'MR No.T20/2023-24' },
    { syNo: '106/5', period: '13/03/2024', event: 'Conversion Order No.625820 dated 13/03/2024 issued by the Deputy Commissioner, Bengaluru Urban District, converting Sy.No.106/5 (Old Sy.No.106/2) measuring 2 Acres 25.08 Guntas of Thirumenahalli Village from Agricultural use to Residential use — Applicant: Mr. N. Kumar, son of Late D. A. Nagappa.', documentRef: 'Conversion Order No.625820 dated 13/03/2024' },
    { syNo: '106/5', period: '17/05/2023', event: 'JDA No.818/2023-24 and Irrevocable GPA No.KCH-4-00014-2023-24 executed by Mr. N. Kumar, son of Late D. A. Nagappa in respect of Sy.No.106/2 measuring 2 Acres 25.08 Guntas and Sy.No.108 measuring 12.34 Guntas in favour of M/s. Ramky Estates and Farms Limited represented by Mr. A. V. Bhaskar Reddy — registered before the Sub-Registrar, Kachara Kanahalli, Bengaluru.', documentRef: 'JDA No.818/2023-24; GPA No.KCH-4-00014-2023-24 dated 17/05/2023' },

    // Sy.No.108
    { syNo: '108', period: '03/12/2004', event: 'Original Conversion Order No.ALN/SR(NA)/246/04-05 dated 03/12/2004 issued by the Deputy Commissioner, Bengaluru District, converting Sy.No.108 measuring 5 Acres 17 Guntas from Agricultural to Non-Agricultural (Educational) use.', documentRef: 'Conversion Order No.ALN/SR(NA)/246/04-05 dated 03/12/2004' },
    { syNo: '108', period: '31/01/2014', event: 'Revised Conversion Order No.ALN/SR(NA)/246/04-05 dated 31/01/2014 issued by the Deputy Commissioner, Bengaluru District, revising the use of Sy.No.108 measuring 5 Acres 17 Guntas from Non-Agricultural (Educational) to Non-Agricultural (Residential) — Applicants: Mrs. Sridevi W/o Marushottam Reddy, Mr. Pavankumar S/o Purushottam Reddy and Mr. Naveen Kumar S/o Purushottam Reddy.', documentRef: 'Revised Conversion Order No.ALN/SR(NA)/246/04-05 dated 31/01/2014' },
    { syNo: '108', period: '(Date to be confirmed)', event: 'Exchange Deed executed between Mrs. Sreedevi W/o Purushothamareddy and Mr. N. Kumar, son of Late D. A. Nagappa in respect of 12.34 Guntas of Sy.No.108 of Thirumenahalli Village — by virtue of which Mr. N. Kumar acquired title to 12.34 Guntas of Sy.No.108.', documentRef: 'Exchange Deed (document number and date to be verified from original)' },
    { syNo: '108', period: '17/05/2023', event: 'JDA No.818/2023-24 and Irrevocable GPA No.KCH-4-00014-2023-24 executed by Mr. N. Kumar in respect of Sy.No.108 measuring 12.34 Guntas along with Sy.No.106/2 in favour of M/s. Ramky Estates and Farms Limited represented by Mr. A. V. Bhaskar Reddy.', documentRef: 'JDA No.818/2023-24; GPA No.KCH-4-00014-2023-24 dated 17/05/2023' }
  ],
  checklistAnswers: {
    developerAcquiredRightsViaJDA: true,
    landownersEmpoweredDeveloperToSell: true,
    empoweringClause: 'As per the clauses of the JDAs (Doc No.818/2023-24, 819/2023-24 and KCH-1-2430-24) and the Irrevocable GPAs (Doc No.KCH-4-00014, KCH-1-00819-2023-24 and BNG(U)KCH.47/2024-25) executed by Mr. N. Kumar, Mrs. N. Padmavathi and Mrs. N. Rama in favour of M/s. Ramky Estates and Farms Limited, the Developer is empowered to execute agreements and sale deeds in respect of their share of saleable areas',
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
    { authority: 'Airports Authority of India, Kempegowda International Airport, Bangalore', type: 'NOC', number: '', date: '', description: 'NOC in respect of the proposed development at Sy.No.106/3, 106/4, 106/5 and 108 of Thirumenahalli Village' },
    { authority: 'BSNL, Bangalore', type: 'NOC', number: '', date: '', description: 'No Objection Certificate in respect of the proposed development at Thirumenahalli Village' },
    { authority: 'BESCOM, Bangalore', type: 'NOC', number: '', date: '', description: 'No Objection Certificate in respect of the proposed development at Thirumenahalli Village' },
    { authority: 'Ministry of Environment, Forest and Climate Change', type: 'Environmental Clearance', number: '', date: '', description: 'Environmental Clearance for the proposed development at Thirumenahalli Village' },
    { authority: 'Deputy Commissioner, Bengaluru Urban District', type: 'Conversion Order', number: '625818', date: '13/03/2024', description: 'Conversion of Sy.No.106/3 (10 Guntas) from Agricultural to Residential use â€” Applicant: Mrs. N. Padmavathi, daughter of Late D. A. Nagappa' },
    { authority: 'Deputy Commissioner, Bengaluru Urban District', type: 'Conversion Order', number: '625820', date: '13/03/2024', description: 'Conversion of Sy.No.106/5 Old Sy.No.106/2 (2 Acres 25.08 Guntas) from Agricultural to Residential use â€” Applicant: Mr. N. Kumar, son of Late D. A. Nagappa' },
    { authority: 'Deputy Commissioner, Bengaluru Urban District', type: 'Conversion Order', number: '702019', date: '16/12/2024', description: 'Conversion of Sy.No.106/4 (10 Guntas) from Agricultural to Residential use â€” Applicant: Mrs. N. Rama, daughter of Late D. A. Nagappa' },
    { authority: 'Deputy Commissioner, Bengaluru District', type: 'Conversion Order', number: 'ALN/SR(NA)/246/04-05', date: '31/01/2014', description: 'Revised conversion of Sy.No.108 (5 Acres 17 Guntas) from Non-Agricultural (Educational) to Non-Agricultural (Residential) â€” Applicants: Mrs. Sridevi W/o Marushottam Reddy, Mr. Pavankumar S/o Purushottam Reddy and Mr. Naveen Kumar S/o Purushottam Reddy' }
  ],

  encumbrances: [],
  legalInterventions: 'NIL as per documents furnished',

  titleGaps: [
    { slNo: 1, syNo: '106/3', severity: 'HIGH', gapType: 'EC_GAP', description: 'Encumbrance Certificate for the period from 22/06/2012 (date of Partition Deed) to 31/03/2015 not furnished in respect of Sy.No.106/3 of Thirumenahalli Village', documentRequired: 'Encumbrance Certificate for the period from 22/06/2012 to 31/03/2015 in respect of Sy.No.106/3 to be called for' },
    { slNo: 2, syNo: '106/4', severity: 'HIGH', gapType: 'EC_GAP', description: 'Encumbrance Certificate for the period from 22/06/2012 (date of Partition Deed) to 31/03/2015 not furnished in respect of Sy.No.106/4 of Thirumenahalli Village', documentRequired: 'Encumbrance Certificate for the period from 22/06/2012 to 31/03/2015 in respect of Sy.No.106/4 to be called for' },
    { slNo: 3, syNo: '106/5', severity: 'HIGH', gapType: 'EC_GAP', description: 'Encumbrance Certificate for the period from 22/06/2012 (date of Partition Deed) to 31/03/2015 not furnished in respect of Sy.No.106/5 (Old Sy.No.106/2) of Thirumenahalli Village', documentRequired: 'Encumbrance Certificate for the period from 22/06/2012 to 31/03/2015 in respect of Sy.No.106/5 to be called for' },
    { slNo: 4, syNo: '108', severity: 'HIGH', gapType: 'EC_GAP', description: 'Encumbrance Certificate for the period from 03/12/2004 (date of original Conversion Order) to 31/03/2015 not furnished in respect of Sy.No.108 of Thirumenahalli Village', documentRequired: 'Encumbrance Certificate for the period from 03/12/2004 to 31/03/2015 in respect of Sy.No.108 to be called for' },
    { slNo: 5, syNo: '106/5 & 108', severity: 'HIGH', gapType: 'MISSING_LINK', description: 'Exchange Deed between Mrs. Sreedevi W/o Purushothamareddy and Mr. N. Kumar for 12.34 Guntas of Sy.No.108 â€” exact document number, date, registration details and consideration amount not verified as this is a scanned document', documentRequired: 'Original Exchange Deed to be called for and exact document number, registration details and area to be verified' },
    { slNo: 6, syNo: '106', severity: 'MEDIUM', gapType: 'MR_GAP', description: 'Mutation Register Extract in favour of M/s. Ramky Estates and Farms Limited not furnished after the execution of the JDAs dated 17/05/2023 and 07/08/2024 in respect of all Survey Numbers', documentRequired: 'Latest Mutation Register Extract showing mutation in favour of the Developer or confirming the Landowners\' title post-JDA to be called for' }
  ],

  documentsBeforeDisbursal: {
    developerShare: [
      { slNo: 1, particulars: 'Agreement of Sale executed by Landowners/Developer in respect of Residential Apartments to be purchased by the Borrower', documentType: 'Photostat' },
      { slNo: 2, particulars: 'Encumbrance Certificate for the period from the date of Plan Sanction till date', documentType: 'Photostat' },
      { slNo: 3, particulars: 'Own Contribution Receipts', documentType: 'Photostat' },
      { slNo: 4, particulars: 'e-Khata issued in respect of the Residential Apartments to be purchased by the Borrower', documentType: 'Photostat' },
      { slNo: 5, particulars: 'NOC issued by the Financial Institute in respect of the Residential Apartments to be purchased by the Borrower', documentType: 'Photostat' }
    ],
    landownerShare: [
      { slNo: 1, particulars: 'Agreement of Sale executed by Landowners in respect of Residential Apartments to be purchased by the Borrower', documentType: 'Photostat' },
      { slNo: 2, particulars: 'Encumbrance Certificate for the period from the date of Plan Sanction till date', documentType: 'Photostat' },
      { slNo: 3, particulars: 'Own Contribution Receipts', documentType: 'Photostat' },
      { slNo: 4, particulars: 'e-Khata issued in respect of the Residential Apartments to be purchased by the Borrower', documentType: 'Photostat' },
      { slNo: 5, particulars: 'NOC issued by the Financial Institute in respect of the Residential Apartments to be purchased by the Borrower', documentType: 'Photostat' }
    ]
  },

  documentsForCharge: {
    developerShare: [
      { slNo: 1, particulars: 'Agreement of Sale executed by Landowners/Developer in respect of Residential Apartments to be purchased by the Borrower', documentType: 'Original' },
      { slNo: 2, particulars: 'Encumbrance Certificate for the period from the date of Plan Sanction till date', documentType: 'Digitally Signed' },
      { slNo: 3, particulars: 'Own Contribution Receipts', documentType: 'Original' },
      { slNo: 4, particulars: 'e-Khata issued in respect of the Residential Apartments to be purchased by the Borrower', documentType: 'Digitally Signed' },
      { slNo: 5, particulars: 'NOC issued by the Financial Institute in respect of the Residential Apartments', documentType: 'Original' }
    ],
    landownerShare: [
      { slNo: 1, particulars: 'Agreement of Sale executed by Landowners in respect of Residential Apartments to be purchased by the Borrower', documentType: 'Original' },
      { slNo: 2, particulars: 'Encumbrance Certificate for the period from the date of Plan Sanction till date', documentType: 'Digitally Signed' },
      { slNo: 3, particulars: 'Own Contribution Receipts', documentType: 'Original' },
      { slNo: 4, particulars: 'e-Khata issued in respect of the Residential Apartments to be purchased by the Borrower', documentType: 'Digitally Signed' },
      { slNo: 5, particulars: 'NOC issued by the Financial Institute in respect of the Residential Apartments', documentType: 'Original' }
    ]
  },

  documentsPostDisbursal: {
    developerShare: [{ slNo: 1, document: 'Sale Deed to be executed by Mr. N. Kumar, Mrs. N. Padmavathi and Mrs. N. Rama and M/s. Ramky Estates and Farms Limited represented by its Authorised Signatory Mr. A. V. Bhaskar Reddy in respect of the Residential Apartments in favour of the Prospective Purchasers who are availing loan facility from Axis Bank Limited for their respective units' }],
    landownerShare: [{ slNo: 1, document: 'Sale Deed to be executed by Mr. N. Kumar, Mrs. N. Padmavathi and Mrs. N. Rama and M/s. Ramky Estates and Farms Limited in respect of the Residential Apartments in favour of the Prospective Purchasers who are availing loan facility from Axis Bank Limited for their respective units' }]
  },

  btDetails: 'N/A',

  opinion: 'Thus it is evident from the above title flow that Mrs. Gullamma W/o Mr. D. A. Nagappa was the original owner of the property bearing Sy.No.106 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore District, measuring 3 Acres 13 Guntas having purchased the same under Sale Deed No.3961 dated 15/04/1987. After the demise of Mrs. Gullamma, the said property has devolved upon her children â€” Mr. N. Kumar, Mrs. N. Padmavathi and Mrs. N. Rama (all children of Late D. A. Nagappa and Late Mrs. Gullamma) â€” who have inter se effected a partition of the said property vide Partition Deed registered as Document No.YAN-1-02022-2012-13 dated 22/06/2012, resulting in Sy.No.106/3 (10 Guntas) in favour of Mrs. N. Padmavathi, Sy.No.106/4 (10 Guntas) in favour of Mrs. N. Rama and Sy.No.106/5 Old Sy.No.106/2 (2 Acres 33 Guntas) in favour of Mr. N. Kumar. Mr. N. Kumar has further acquired 12.34 Guntas of Sy.No.108 by way of Exchange Deed. The above said landowners have obtained Conversion Orders for all Survey Numbers and have executed Joint Development Agreements and Irrevocable General Powers of Attorney in favour of M/s. Ramky Estates and Farms Limited (CIN: U70102TG1995PLC021333) represented by its Authorised Signatory Mr. A. V. Bhaskar Reddy. I am of the Opinion that M/s. Ramky Estates and Farms Limited are entitled to sell or deal or Mortgage in respect of their share of built up areas in the proposed development at Thirumenahalli Village in the said land as they may deem fit upon complying with the conditions stipulated hereunder.',

  subjectTo: [
    'Verification of all the original documents',
    'Encumbrance Certificate should be verified at your end before the mortgage transaction is put through',
    'An officer of the Bank has to make personal inspection to identify, confirm the existence of the property with correct boundaries and also to ascertain the physical possession of the property by borrower/Mortgagor and his vendor',
    'The genuineness of documents and signatures on the documents cannot be ascertained by us and hence adequate precautions should be taken to confirm the integrity of the borrower/mortgagor/Vendors in title',
    'The Original documents should be verified at your end before the mortgage transaction is put through',
    'Encumbrance Certificate for the period from 01/01/2025 to till date for all Survey Numbers to be verified before mortgage transaction is put through',
    'Encumbrance Certificates for the period prior to 01/04/2015 for all Survey Numbers (Sy.No.106/3, 106/4, 106/5 and 108) to be called for and verified',
    'Exchange Deed for 12.34 Guntas of Sy.No.108 to be verified for exact document number, date, registration details and consideration amount'
  ],

  translatedContent: { hasIndianLanguageContent: true, languages: ['Kannada'], translationNotes: 'Revenue documents including RTC, Mutation Register Extracts, Akarbands and Encumbrance Certificates were in Kannada and have been translated to English' },
  riskFlags: [],
  overallStatus: 'CONDITIONALLY CLEAR',
  summary: 'The property bearing Sy.No.106/3, 106/4, 106/5 (Old Sy.No.106/2) and 108 of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk is owned by the three children (Mr. N. Kumar, Mrs. N. Padmavathi and Mrs. N. Rama) of Late D.A. Nagappa, who acquired the parent survey Sy.No.106 through Sale Deed No.3961 dated 15/04/1987 and partitioned the same vide Partition Deed No.YAN-1-02022-2012-13 dated 22/06/2012. All three landowners have executed Joint Development Agreements and General Powers of Attorney in favour of M/s. Ramky Estates and Farms Limited for development of residential apartments. The title is conditionally clear subject to furnishing of pre-2015 Encumbrance Certificates for all Survey Numbers and verification of the Exchange Deed for Sy.No.108.'
};

async function main() {
  console.log('\nGenerating professional report...');
  const outPath = 'C:/Users/drsra/OneDrive/Desktop/Thanisandra_Legal_Scrutiny_Report_v7.docx';
  try {
    await generateLegalReport(reportData, outPath, 'M/s. Aneesh Associates Private Limited', 'Dr. Sravan Kumar D');
    console.log('âœ… DONE:', outPath);
    console.log('Documents:', reportData.documentsFurnished.filter(d => !d.isGap && !d.isSubHeader).length);
    console.log('Title Gaps:', reportData.titleGaps.length);
  } catch(e) { console.error('Error:', e.message); }
}
main();






