# Legal Ops AI — How to Generate Reports

## STEP 1 — Set Your API Key (One time only)

Open this file in Notepad:
  C:\Users\drsra\legal-ops-system\backend\.env

Change:
  ANTHROPIC_API_KEY=your_api_key_here

To:
  ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXXXXXXXX

Get your key from: https://console.anthropic.com/settings/keys

---

## STEP 2A — Process the Thanisandra ZIP Documents (Batch)

After setting API key, run in Command Prompt:

  cd C:\Users\drsra\legal-ops-system
  node process-docs.js "C:\Users\drsra\Downloads\legal-docs-extracted" "Axis Bank Limited" "APF"

The report will be saved to:
  C:\Users\drsra\Downloads\Legal_Scrutiny_Report_[timestamp].docx

---

## STEP 2B — Use the Web UI

1. Start backend:   double-click start-backend.bat
2. Start frontend:  double-click start-frontend.bat
3. Open browser:    http://localhost:5173
4. Upload documents → AI reads each one → Review → Download

---

## What the AI Now Does (Fixed)

BEFORE (wrong):
  "Sale deed executed by the owner in favour of the purchaser"

AFTER (correct):
  "Sale deed registered as Document No.18183/2004-05, executed by
  Mr. Lakshmaiah, Mrs. Lakshmidevi, Mrs. Shubha represented by her
  SPA Holder Mr. Lakshmaiah, Ms. Shilpa and Mr. Prasad, in respect
  of the property bearing Sy.No.47/1 of Whitefield Village, K.R.
  Puram Hobli, Bangalore East Taluk, Bangalore District, measuring
  21 Guntas in favour of Mr. Naved M. Hassan"

Gap rows appear in RED/ORANGE in the document table and are listed
in a NOTE section at the end of the report.
