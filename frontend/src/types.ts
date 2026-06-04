export interface ExtractedFile {
  filename: string
  storedAs: string
  method: string
  text: string
  charCount?: number
  error?: string
}

export interface ReportConfig {
  bankName: string
  firmName: string
  advocateName: string
  reportType: string
}

export interface LegalData {
  reportHeader: {
    refNo: string
    date: string
    reportTitle: string
    addressee: {
      designation: string
      department: string
      bank: string
      city: string
    }
  }
  subjectLine: string
  propertyDetails: {
    apfNo: string
    applicantName: string
    coApplicantName: string
    natureOfTransaction: string
    natureOfProperty: string
    ownerNames: string[]
    developerName: string
    reraNo: string
    scheduleProperty: {
      description: string
      surveyNumbers: Array<{
        syNo: string
        measurement: string
        village: string
        hobli: string
        taluk: string
        district: string
      }>
      totalMeasurement: string
      boundaries: {
        east: string
        west: string
        north: string
        south: string
      }
    }
  }
  documentsFurnished: Array<{
    slNo: number
    date: string
    particulars: string
    documentType: string
    syNo: string
    documentNo: string
    parties: string
    relevance: string
  }>
  titleFlow: Array<{
    period: string
    event: string
    parties: string
    documentRef: string
  }>
  checklistAnswers: {
    developerAcquiredRightsViaJDA: boolean
    landownersEmpoweredDeveloperToSell: boolean
    empoweringClause: string
    considerationType: string
    supplementaryAgreementExecuted: boolean
    allLandownersSignedSupplementary: boolean
    landConverted: boolean
    conversionType: string
    minorsRights: string
    landAcquisitionOrders: string
    litigations: string
    otherObservations: string
    sarfaesiEnforceable: boolean
  }
  approvalsSanctions: Array<{
    authority: string
    type: string
    number: string
    date: string
    description: string
  }>
  encumbrances: Array<{
    type: string
    in_favour_of: string
    date: string
    documentNo: string
    remarks: string
  }>
  legalInterventions: string
  documentsBeforeDisbursal: {
    developerShare: Array<{ slNo: number; particulars: string; documentType: string }>
    landownerShare: Array<{ slNo: number; particulars: string; documentType: string }>
  }
  documentsForCharge: {
    developerShare: Array<{ slNo: number; particulars: string; documentType: string }>
    landownerShare: Array<{ slNo: number; particulars: string; documentType: string }>
  }
  documentsPostDisbursal: {
    developerShare: Array<{ slNo: number; document: string }>
    landownerShare: Array<{ slNo: number; document: string }>
  }
  btDetails: string
  opinion: string
  subjectTo: string[]
  translatedContent: {
    hasIndianLanguageContent: boolean
    languages: string[]
    translationNotes: string
  }
  riskFlags: Array<{
    severity: 'HIGH' | 'MEDIUM' | 'LOW'
    issue: string
    recommendation: string
  }>
  overallStatus: 'CLEAR' | 'CONDITIONALLY CLEAR' | 'REFER BACK'
  summary: string
}
