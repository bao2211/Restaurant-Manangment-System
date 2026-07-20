# Current Task Summary

## Task
Read the PDF file `LAB2-TH-TMDT.pdf` and complete the exercises in it. Take screenshots of every successful task and save them to a folder.

## MCPs Required

### 1. PDF Reader MCP
**Purpose**: Read and extract text/content from the PDF file

**Install**:
```bash
git clone https://github.com/SylphxAI/pdf-reader-mcp.git
cd pdf-reader-mcp
npm install
npm run build
```

**Add to opencode.json**:
```json
{
  "pdf-reader": {
    "type": "local",
    "command": ["node", "C:\\Users\\Admin\\Documents\\School\\CNPMNC\\RMS\\pdf-reader-mcp\\dist\\index.js"],
    "enabled": true
  }
}
```

### 2. BrowserOS MCP (Already Installed)
**Purpose**: Take screenshots of completed tasks

**Status**: Already configured at `http://127.0.0.1:9000/mcp`

## PDF File Location
The PDF file `LAB2-TH-TMDT.pdf` needs to be placed in one of these locations:
- `C:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System\`
- Or provide the full path when asked

## Screenshot Output Folder
Save screenshots to:
```
C:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System\LAB2_Screenshots\
```

## Steps to Complete Task
1. Install PDF Reader MCP (see above)
2. Restart opencode
3. Find the PDF file location
4. Read the PDF content using PDF Reader MCP
5. Complete each exercise from the PDF
6. Take screenshots using BrowserOS MCP
7. Save screenshots to the output folder
8. Name screenshots descriptively (e.g., `task1_login.png`, `task2_create_post.png`)

## Current Project
- **Project**: Restaurant Management System (RMS)
- **Working Directory**: `C:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System`
- **WordPress Site**: `http://192.168.192.85:8082/`
- **WordPress Credentials**: admin / CaoBao2211

## Already Installed MCPs
| MCP | Status | Purpose |
|-----|--------|---------|
| browseros | ✅ Installed | Take screenshots |
| figma-write | ✅ Installed | Design in Figma |
| wordpress | ✅ Installed | Manage WordPress |
| pdf-reader | ❌ Needs install | Read PDF files |
