# AI-Powered CSV Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the `handleFileUpload` function in `ManageAward.tsx` to use Google GenAI to map and parse uploaded CSV rows into valid nominees instead of hardcoded column matching.

**Architecture:** Use `PapaParse` to convert the uploaded CSV into an array of objects. Split the array into batches (max 20 rows each). For each batch, stringify the raw rows and send them to `gemini-2.5-flash`. The prompt will instruct Gemini to map the keys into a strictly defined JSON array matching the system's `Nominee` schema, inferring missing descriptions when possible. Finally, insert the validated results into Firestore.

**Tech Stack:** React, Google GenAI SDK, PapaParse, Firebase Firestore

---

### Task 1: Add Progress State to ManageAward

**Files:**
- Modify: `src/pages/ManageAward.tsx`

- [ ] **Step 1: Add state for import progress message**

```tsx
// Find where `const [importing, setImporting] = useState(false);` is defined (around line 37).
// Add right below it:
const [importProgressMsg, setImportProgressMsg] = useState('');
```

- [ ] **Step 2: Display progress message in the UI**

```tsx
// Find where the `importing` state disables the upload button or shows a loading state.
// Look for `<div className="mt-4 flex justify-between items-center">` inside the "Bulk Import" section.
// Modify the uploading indicator to show the message:
                {importing ? (
                  <div className="flex items-center text-sm text-anthropic-orange font-semibold gap-2 bg-anthropic-orange/10 px-4 py-2 rounded-xl border border-anthropic-orange/20">
                    <div className="w-4 h-4 border-2 border-anthropic-orange border-t-transparent rounded-full animate-spin"></div>
                    {importProgressMsg || 'Importing...'}
                  </div>
                ) : (
```

### Task 2: Implement AI Processing Logic in `handleFileUpload`

**Files:**
- Modify: `src/pages/ManageAward.tsx`

- [ ] **Step 1: Overhaul the Papa.parse onComplete callback**

```tsx
// Inside `handleFileUpload`, replace the `complete: async (results) => { ... }` block entirely.
        complete: async (results) => {
          const rawRows = results.data as any[];
          if (rawRows.length === 0) {
            setImporting(false);
            e.target.value = '';
            return;
          }

          if (!ai) {
            setImportErrors(['AI configuration is missing. Cannot process CSV.']);
            setImporting(false);
            e.target.value = '';
            return;
          }

          setImportErrors([]);
          let totalImported = 0;
          let newErrors: string[] = [];
          
          // Filter out completely empty rows
          const validRows = rawRows.filter(row => Object.keys(row).some(k => row[k] && row[k].trim() !== ''));
          
          const BATCH_SIZE = 20;
          const totalBatches = Math.ceil(validRows.length / BATCH_SIZE);

          for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            setImportProgressMsg(`Processing batch ${batchIndex + 1} of ${totalBatches}...`);
            
            const batch = validRows.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);
            
            try {
              const prompt = `
You are a data mapping assistant. I am giving you a JSON array of raw CSV rows. 
Your job is to map these rows into a strict JSON array of nominee objects.

Requirements for each output object:
- "name": Combine first and last name if separated, or use the company/person name provided.
- "email": Find the email address (ignore "Yes" or non-email values).
- "categoryName": Find the closest matching category name from the provided data.
- "title": Job title (if any).
- "company": Company name (if any).
- "description": A brief bio or description. If missing, generate a short 1-sentence professional summary based on their title and company.
- "website": URL (if any).
- "linkedinUrl": LinkedIn URL (if any).
- "logoUrl": Image/Logo URL (if any).

Raw Data:
${JSON.stringify(batch)}

Return ONLY a valid JSON array of objects. Do not use markdown blocks like \`\`\`json. Just the raw JSON array.
`;

              const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
              });

              let jsonText = response.text || '[]';
              if (jsonText.startsWith('\`\`\`json')) {
                jsonText = jsonText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
              }
              if (jsonText.startsWith('\`\`\`')) {
                jsonText = jsonText.replace(/\`\`\`/g, '').trim();
              }

              const parsedNominees = JSON.parse(jsonText);

              for (let i = 0; i < parsedNominees.length; i++) {
                const nom = parsedNominees[i];
                
                if (!nom.name || !nom.email || !nom.categoryName) {
                  newErrors.push(\`Batch \${batchIndex + 1}, Item \${i + 1}: AI failed to extract required name, email, or category.\`);
                  continue;
                }

                const cat = categories.find(c => c.name.toLowerCase() === nom.categoryName.toLowerCase());
                if (!cat) {
                  newErrors.push(\`Batch \${batchIndex + 1}, Item \${i + 1}: Category "\${nom.categoryName}" not found in this award.\`);
                  continue;
                }

                const docRef = await addDoc(collection(db, 'nominees'), {
                  awardId: id,
                  categoryId: cat.id,
                  name: nom.name,
                  email: nom.email,
                  description: nom.description || '',
                  website: nom.website || '',
                  linkedinUrl: nom.linkedinUrl || '',
                  title: nom.title || '',
                  company: nom.company || '',
                  logoUrl: nom.logoUrl || '',
                  aiSummary: '',
                  status: 'approved',
                  voteCount: 0,
                  submittedBy: user?.uid,
                  createdAt: new Date().toISOString()
                });
                
                setNominees(prev => [...prev, {
                  id: docRef.id,
                  awardId: id,
                  categoryId: cat.id,
                  name: nom.name,
                  email: nom.email,
                  description: nom.description || '',
                  website: nom.website || '',
                  linkedinUrl: nom.linkedinUrl || '',
                  title: nom.title || '',
                  company: nom.company || '',
                  logoUrl: nom.logoUrl || '',
                  status: 'approved',
                  voteCount: 0
                }]);
                
                totalImported++;
              }
            } catch (err) {
              console.error('Batch error:', err);
              newErrors.push(\`Batch \${batchIndex + 1} failed to process due to an AI or parsing error.\`);
            }
          }

          setImportErrors(newErrors);
          setImporting(false);
          setImportProgressMsg('');
          e.target.value = '';
          
          if (totalImported > 0) {
            alert(\`Successfully imported \${totalImported} nominees via AI!\`);
          }
        },
```

- [ ] **Step 3: Update the UI Guide Text to reflect AI capability**

```tsx
// Inside the "showImportGuide" modal around line 1050
// Replace the first paragraph and required columns with AI context:
                    <p>Our new AI-powered importer automatically maps your CSV data. You don't need exact column names!</p>
                    
                    <div>
                      <h4 className="font-bold text-[#111111] mb-2 text-base">How it works:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>The AI will read your headers and intelligently extract the <strong>Name</strong>, <strong>Email</strong>, and <strong>Category</strong> (which must match your existing categories).</li>
                        <li>It will also pull any extra details like <strong>Title</strong>, <strong>Company</strong>, <strong>LinkedIn</strong>, <strong>Website</strong>, and <strong>Image URL</strong>.</li>
                        <li>If a nominee is missing a description, the AI will automatically generate a professional summary for them!</li>
                      </ul>
                    </div>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/ManageAward.tsx
git commit -m "feat: upgrade csv bulk upload to be AI-powered for automatic column mapping and description generation"
```
