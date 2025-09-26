// AI Prompt Processor Pro - Complete Professional Implementation
class AIPromptProcessorPro {
    constructor() {
        this.init();
        this.loadSettings();
        this.bindEvents();
        this.uploadedTemplates = {
            coverLetter: null,
            cv: null
        };
        this.loadPersistedData();
    }

    init() {
        this.elements = {
            // Input elements
            userText: document.getElementById('userText'),
            generateBtn: document.getElementById('generateBtn'),
            
            // Results elements
            resultsContent: document.getElementById('resultsContent'),
            loadingState: document.getElementById('loadingState'),
            
            // Lazy button
            lazyBtn: document.getElementById('lazyBtn'),
            
            // Upload elements
            coverLetterUpload: document.getElementById('coverLetterUpload'),
            cvUpload: document.getElementById('cvUpload'),
            uploadCoverLetterBtn: document.getElementById('uploadCoverLetterBtn'),
            uploadCvBtn: document.getElementById('uploadCvBtn'),
            
            // Textarea controls
            toggleTextarea: document.getElementById('toggleTextarea'),
            resetTextarea: document.getElementById('resetTextarea'),
            
            // Download buttons in header
            downloadButtons: document.getElementById('downloadButtons'),
            downloadCvBtn: document.getElementById('downloadCvBtn'),
            downloadCoverLetterBtn: document.getElementById('downloadCoverLetterBtn'),
            
            // Settings elements
            settingsBtn: document.getElementById('settingsBtn'),
            settingsModal: document.getElementById('settingsModal'),
            closeSettingsBtn: document.getElementById('closeSettingsBtn'),
            saveSettingsBtn: document.getElementById('saveSettingsBtn'),
            openaiKey: document.getElementById('openaiKey'),
            geminiKey: document.getElementById('geminiKey'),
            maxTokens: document.getElementById('maxTokens'),
            temperature: document.getElementById('temperature'),
            temperatureValue: document.getElementById('temperatureValue')
        };
    }

    bindEvents() {
        // Main processing
        this.elements.generateBtn.addEventListener('click', () => this.generateDocuments());
        
        // Lazy button - extract job description
        this.elements.lazyBtn.addEventListener('click', () => this.extractJobDescription());
        
        // Upload buttons
        this.elements.uploadCoverLetterBtn.addEventListener('click', () => this.elements.coverLetterUpload.click());
        this.elements.uploadCvBtn.addEventListener('click', () => this.elements.cvUpload.click());
        this.elements.coverLetterUpload.addEventListener('change', (e) => this.handleFileUpload(e, 'coverLetter'));
        this.elements.cvUpload.addEventListener('change', (e) => this.handleFileUpload(e, 'cv'));
        
        // Settings modal
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        
        // Temperature slider
        this.elements.temperature.addEventListener('input', (e) => {
            this.elements.temperatureValue.textContent = e.target.value;
        });
        
        // Close modal on outside click
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeSettings();
            }
        });
        
        // Auto-save content when typing
        this.elements.userText.addEventListener('input', () => this.saveContent());
        
        // Textarea controls
        this.elements.toggleTextarea.addEventListener('click', () => this.toggleTextarea());
        this.elements.resetTextarea.addEventListener('click', () => this.resetTextarea());
        
        // Download buttons
        this.elements.downloadCvBtn.addEventListener('click', () => this.downloadDocument('cv'));
        this.elements.downloadCoverLetterBtn.addEventListener('click', () => this.downloadDocument('coverLetter'));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.generateDocuments();
                } else if (e.key === ',') {
                    e.preventDefault();
                    this.openSettings();
                }
            }
        });

        // Auto-resize textareas
        this.setupAutoResize();
    }

    setupAutoResize() {
        const textareas = [this.elements.userText];
        textareas.forEach(textarea => {
            if (textarea) {
                textarea.addEventListener('input', () => {
                    textarea.style.height = 'auto';
                    textarea.style.height = textarea.scrollHeight + 'px';
                });
            }
        });
    }

    async loadPersistedData() {
        try {
            const result = await chrome.storage.local.get(['persistedData']);
            const data = result.persistedData || {};
            
            // Load text content
            if (data.textContent) {
                this.elements.userText.value = data.textContent;
                this.elements.userText.style.height = 'auto';
                this.elements.userText.style.height = this.elements.userText.scrollHeight + 'px';
            }
            
            // Load uploaded templates
            if (data.uploadedTemplates) {
                this.uploadedTemplates = data.uploadedTemplates;
                this.updateUploadButtonStates();
            }
        } catch (error) {
            console.error('Error loading persisted data:', error);
        }
    }

    async saveContent() {
        try {
            const persistedData = {
                textContent: this.elements.userText.value,
                uploadedTemplates: this.uploadedTemplates
            };
            await chrome.storage.local.set({ persistedData });
        } catch (error) {
            console.error('Error saving content:', error);
        }
    }

    updateUploadButtonStates() {
        if (this.uploadedTemplates.coverLetter) {
            this.elements.uploadCoverLetterBtn.textContent = '✅ Cover Letter Uploaded';
            this.elements.uploadCoverLetterBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        }
        if (this.uploadedTemplates.cv) {
            this.elements.uploadCvBtn.textContent = '✅ CV Uploaded';
            this.elements.uploadCvBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        }
    }

    logAction(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        console.log(logEntry);
        
        // Add to UI logs
        const logsContainer = document.getElementById('actionLogs');
        if (logsContainer) {
            const logDiv = document.createElement('div');
            logDiv.className = 'log-entry';
            logDiv.textContent = logEntry;
            logsContainer.appendChild(logDiv);
            logsContainer.scrollTop = logsContainer.scrollHeight;
        }
    }

    async extractJobDescription() {
        this.showToast('Extracting job description from current page...', 'info');
        this.elements.lazyBtn.disabled = true;
        this.elements.lazyBtn.textContent = '🔍 Extracting...';
        this.logAction('😴 Starting job description extraction...');

        try {
            // Get the current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.logAction(`📍 Current tab: ${tab.title}`);
            
            // Inject script to get page HTML
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    // Remove script tags, style tags, and other non-content elements
                    const clone = document.cloneNode(true);
                    const scripts = clone.querySelectorAll('script, style, noscript, iframe');
                    scripts.forEach(el => el.remove());
                    
                    // Get the cleaned HTML
                    const html = clone.documentElement.innerHTML;
                    
                    // Also get just the text content for better processing
                    const textContent = document.body.innerText || document.body.textContent || '';
                    
                    return {
                        html: html.substring(0, 50000), // Limit size
                        text: textContent.substring(0, 30000), // Limit size
                        title: document.title,
                        url: window.location.href
                    };
                }
            });

            const pageData = results[0].result;
            this.logAction(`✅ Page data extracted (${pageData.text.length} characters)`);

            // Process with AI to extract job description
            await this.processJobDescriptionExtraction(pageData);

        } catch (error) {
            console.error('Error extracting job description:', error);
            this.logAction(`❌ Error: ${error.message}`);
            this.showError(`Failed to extract job description: ${error.message}`);
        } finally {
            this.elements.lazyBtn.disabled = false;
            this.elements.lazyBtn.innerHTML = '😴 I am lazy';
        }
    }

    async handleFileUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        this.logAction(`📁 Uploading ${type === 'coverLetter' ? 'Cover Letter' : 'CV'} template: ${file.name}`);

        try {
            const text = await this.readFileAsText(file);
            this.uploadedTemplates[type] = {
                name: file.name,
                content: text
            };
            
            // Save to persistent storage
            await this.saveContent();
            this.logAction(`✅ ${type === 'coverLetter' ? 'Cover Letter' : 'CV'} template uploaded and saved`);
            
            this.showToast(`${type === 'coverLetter' ? 'Cover Letter' : 'CV'} template uploaded successfully!`, 'success');
            
            // Update button text to show uploaded status
            const button = type === 'coverLetter' ? this.elements.uploadCoverLetterBtn : this.elements.uploadCvBtn;
            button.textContent = `✅ ${type === 'coverLetter' ? 'Cover Letter' : 'CV'} Uploaded`;
            button.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            
        } catch (error) {
            console.error('Error reading file:', error);
            this.logAction(`❌ Error uploading ${type === 'coverLetter' ? 'cover letter' : 'CV'}: ${error.message}`);
            this.showToast(`Failed to upload ${type === 'coverLetter' ? 'cover letter' : 'CV'} template`, 'error');
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                
                // Check if it's a binary file (like .docx) that can't be read as text
                if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
                    reject(new Error(`Cannot read ${file.name} as text. Please convert to .html format or copy-paste the content.`));
                    return;
                }
                
                // Check for binary content indicators
                if (content.includes('PK') && content.includes('word/')) {
                    reject(new Error(`File appears to be a Word document (.docx). Please convert to .html format or copy-paste the content.`));
                    return;
                }
                
                // Validate HTML content
                if (file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')) {
                    if (!content.includes('<html') && !content.includes('<HTML')) {
                        console.warn('File has .html extension but may not contain valid HTML');
                    }
                }
                
                resolve(content);
            };
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    async processJobDescriptionExtraction(pageData) {
        const settings = await this.getSettings();
        const apiKey = settings.openaiKey; // Use OpenAI GPT-3.5-turbo

        if (!apiKey) {
            this.showError('Please configure your OpenAI API key in settings first.');
            this.openSettings();
            return;
        }

        // Create a specialized prompt for job description extraction
        const prompt = `You are a job description extraction specialist. Analyze the following webpage content and extract ONLY the job description details if present.

Website: ${pageData.title}
URL: ${pageData.url}

Content to analyze:
${pageData.text}

Instructions:
1. Look for job titles, responsibilities, requirements, qualifications, company information, salary, benefits, etc.
2. If this webpage contains a job description, extract and format it clearly with sections like:
   - Job Title
   - Company
   - Location
   - Job Description/Responsibilities
   - Requirements/Qualifications
   - Benefits (if mentioned)
   - Salary (if mentioned)

3. If this webpage does NOT contain a job description, respond EXACTLY with: "No job description found"

4. Only extract job-related information. Ignore navigation, ads, unrelated content.

5. Format the output in a clean, readable format.

Extract the job description:`;

        try {
            this.showLoading();
            this.logAction('🤖 Sending page content to AI for analysis...');
            const result = await this.callAI(prompt, 'gpt-3.5-turbo-16k', apiKey, settings);
            
            if (result.toLowerCase().includes('no job description found')) {
                this.logAction('ℹ️ No job description found on this page');
                this.showToast('No job description found on this page', 'info');
                this.elements.userText.value = 'No job description found on this page. Try navigating to a job posting page.';
            } else {
                this.logAction('✅ Job description extracted successfully!');
                // Prefill the text box with the extracted job description
                this.elements.userText.value = result;
                this.showToast('Job description extracted and filled!', 'success');
                
                // Auto-resize the textarea
                this.elements.userText.style.height = 'auto';
                this.elements.userText.style.height = this.elements.userText.scrollHeight + 'px';
                
                // Save the content
                await this.saveContent();
                this.logAction('💾 Job description saved to persistent storage');
            }
            
        } catch (error) {
            console.error('Error processing job description:', error);
            this.logAction(`❌ Error: ${error.message}`);
            this.showError(`Error extracting job description: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }


    async generateDocuments() {
        const jobDescription = this.elements.userText.value.trim();
        if (!jobDescription) {
            this.showError('Please enter job description text first. Use "I am lazy" button to extract from current page.');
            return;
        }

        const settings = await this.getSettings();
        const apiKey = settings.openaiKey;

        if (!apiKey) {
            this.showError('Please configure your OpenAI API key in settings first.');
            this.openSettings();
            return;
        }

        this.showLoading();
        this.elements.generateBtn.disabled = true;
        this.logAction('🤖 AI Agent: Initializing intelligent document generation system...');

        try {
            // Initialize AI Agent with tools
            const agent = new AIAgent(apiKey, settings, this, 'openai');
            await agent.executeWorkflow(jobDescription);

        } catch (error) {
            console.error('AI Agent Error:', error);
            this.logAction(`❌ AI Agent Error: ${error.message}`);
            this.showError(`Error in AI Agent workflow: ${error.message}`);
        } finally {
            this.hideLoading();
            this.elements.generateBtn.disabled = false;
        }
    }


    showDocumentDownloads(documents) {
        this.logAction('📥 Showing document download buttons in header...');
        this.logAction(`📥 Documents received: ${Object.keys(documents).join(', ')}`);
        
        // Store documents in memory for download
        this.generatedDocuments = documents;
        
        // Show download buttons in header
        this.elements.downloadButtons.style.display = 'flex';
        
        if (documents.coverLetter) {
            this.logAction('📄 Showing cover letter download button in header');
            this.elements.downloadCoverLetterBtn.style.display = 'block';
        }

        if (documents.cv) {
            this.logAction('📋 Showing CV download button in header');
            this.elements.downloadCvBtn.style.display = 'block';
        }
        
        // Clear results content and show success message
        this.elements.resultsContent.innerHTML = `
            <div class="success-message">
                <h3>🎉 PDF Documents Generated Successfully!</h3>
                <p>Your personalized PDF documents with full formatting are ready for download. Use the download buttons in the header above.</p>
            </div>
        `;
        this.elements.resultsContent.classList.add('has-content');
        this.elements.resultsContent.style.display = 'block';
        this.elements.loadingState.style.display = 'none';
        
        this.logAction('✅ Download buttons should now be visible in header');
    }

    downloadDocument(type) {
        console.log(`🔍 DEBUG: downloadDocument called with type: ${type}`);
        this.logAction(`📥 Download requested for: ${type}`);
        
        if (!this.generatedDocuments || !this.generatedDocuments[type]) {
            console.log(`❌ DEBUG: No ${type} document found in memory`);
            console.log(`❌ DEBUG: generatedDocuments:`, this.generatedDocuments);
            this.logAction(`❌ No ${type} document found in memory`);
            this.showError(`No ${type} document available for download`);
            return;
        }
        
        const content = this.generatedDocuments[type];
        const documentTitle = type === 'coverLetter' ? 'Cover_Letter' : 'CV_Resume';
        const fileName = `${documentTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        console.log(`📥 DEBUG: Creating PDF download for ${fileName} (${content.length} characters)`);
        this.logAction(`📥 Creating PDF download for ${fileName} (${content.length} characters)`);
        
        // Use the new PDF generation function
        this.generatePDFFromHTML(content, fileName, type);
    }

    generatePDFFromHTML(htmlContent, fileName, type) {
        try {
            // Log character count of input HTML
            const inputCharCount = htmlContent.length;
            this.logAction(`📊 Input HTML character count: ${inputCharCount.toLocaleString()}`);
            console.log(`📊 DEBUG: Input HTML character count: ${inputCharCount.toLocaleString()}`);
            
            this.logAction(`🎨 Generating PDF from raw LLM output (no post-processing)...`);
            
            // Create a new window for PDF generation with specific features
            const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
            
            if (!printWindow) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }
            
            // Use raw LLM output directly - check if it's already a complete HTML document
            let completeHTML;
            
            if (htmlContent.includes('<!DOCTYPE html>') || htmlContent.includes('<html')) {
                // LLM output is already a complete HTML document
                this.logAction('📄 LLM output is already a complete HTML document');
                completeHTML = htmlContent;
            } else {
                // LLM output needs basic HTML wrapper
                this.logAction('📄 Adding basic HTML wrapper to LLM output');
                completeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
    <style>
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            body {
                margin: 0 !important;
                padding: 20px !important;
                font-size: 12pt !important;
                line-height: 1.4 !important;
                color: #000 !important;
                background: #fff !important;
                max-width: none !important;
                overflow: visible !important;
            }
            
            .page-break {
                page-break-before: always !important;
            }
            
            .no-break {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid !important;
                break-after: avoid !important;
            }
            
            p, li, div {
                orphans: 3 !important;
                widows: 3 !important;
            }
            
            ul, ol {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            table {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            img {
                max-width: 100% !important;
                height: auto !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            .container, .wrapper, .content {
                max-width: none !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .section, .block, .item {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                margin-bottom: 10pt !important;
            }
            
            .flex, .grid {
                display: block !important;
            }
            
            .hidden-print {
                display: none !important;
            }
        }
        
        @media screen {
            body {
                margin: 20px;
                padding: 20px;
                background: #f5f5f5;
                font-family: Arial, sans-serif;
            }
            
            .print-preview {
                max-width: 8.5in;
                margin: 0 auto;
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                padding: 40px;
            }
            
            .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                z-index: 1000;
            }
            
            .print-button:hover {
                background: #0056b3;
            }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Print to PDF</button>
    <div class="print-preview">
        ${htmlContent}
    </div>
    <script>
        // Auto-trigger print dialog when page loads
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 1000);
        };
        
        // Close window after printing
        window.onafterprint = function() {
            setTimeout(function() {
                window.close();
            }, 500);
        };
    </script>
</body>
</html>`;
            }
            
            // Log character count of complete HTML document
            const completeHTMLCharCount = completeHTML.length;
            this.logAction(`📊 Complete HTML document character count: ${completeHTMLCharCount.toLocaleString()}`);
            console.log(`📊 DEBUG: Complete HTML document character count: ${completeHTMLCharCount.toLocaleString()}`);
            
            // Write the HTML content to the new window
            printWindow.document.write(completeHTML);
            
            printWindow.document.close();
            
            // Wait for content to load, then trigger print
            setTimeout(() => {
                printWindow.focus();
                
                // Try to trigger print dialog
                try {
                    printWindow.print();
                } catch (e) {
                    console.log('Print dialog blocked, showing manual print button');
                    this.logAction('Print dialog blocked, please click the print button in the new window');
                }
                
                console.log(`✅ DEBUG: PDF generation initiated for ${fileName}`);
                this.logAction(`✅ PDF generation initiated for ${fileName}`);
                this.logAction(`📊 Character count summary: Input=${inputCharCount.toLocaleString()}, Complete HTML=${completeHTMLCharCount.toLocaleString()}`);
                this.showToast(`${type === 'coverLetter' ? 'Cover Letter' : 'CV'} PDF generation started!`, 'success');
                
            }, 1000);
            
        } catch (error) {
            console.error('❌ DEBUG: PDF generation error:', error);
            this.logAction(`❌ PDF generation failed: ${error.message}`);
            this.showError(`Failed to generate PDF for ${type}: ${error.message}`);
        }
    }

    async callAI(prompt, model, apiKey, settings) {
        if (model === 'openai' || model === 'gpt-3.5-turbo' || model === 'gpt-3.5-turbo-16k') {
            return await this.callOpenAI(prompt, apiKey, settings);
        } else if (model === 'gemini-2.0-flash') {
            return await this.callGemini(prompt, apiKey, settings, 'gemini-2.0-flash-exp');
        } else if (model === 'gemini-1.5-flash') {
            return await this.callGemini(prompt, apiKey, settings, 'gemini-1.5-flash');
        } else if (model === 'gemini-1.5-pro') {
            return await this.callGemini(prompt, apiKey, settings, 'gemini-1.5-pro');
        }
        throw new Error('Unsupported model selected');
    }

    async callOpenAI(prompt, apiKey, settings) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo-16k',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: parseInt(settings.maxTokens),
                temperature: parseFloat(settings.temperature)
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callGemini(prompt, apiKey, settings, modelName = 'gemini-1.5-flash') {
        console.log(`Calling Gemini API with model: ${modelName}`);
        console.log('Prompt:', prompt.substring(0, 100) + '...');
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: parseInt(settings.maxTokens),
                    temperature: parseFloat(settings.temperature)
                }
            })
        });

        console.log('Gemini API Response Status:', response.status);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Gemini API Error:', error);
            throw new Error(error.error?.message || `Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Gemini API Response:', data);
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error('Invalid Gemini response structure:', data);
            throw new Error('Invalid response from Gemini API - no content generated');
        }
        
        const result = data.candidates[0].content.parts[0].text;
        console.log('Gemini generated result:', result.substring(0, 200) + '...');
        return result;
    }

    showLoading() {
        this.elements.loadingState.style.display = 'flex';
        this.elements.resultsContent.style.display = 'none';
    }

    hideLoading() {
        this.elements.loadingState.style.display = 'none';
    }

    showResult(result) {
        this.elements.resultsContent.innerHTML = `<div class="response-content">${this.escapeHtml(result)}</div>`;
        this.elements.resultsContent.classList.add('has-content');
        this.elements.resultsContent.style.display = 'block';
        this.elements.loadingState.style.display = 'none';
    }

    showError(message) {
        this.elements.resultsContent.innerHTML = `
            <div class="error-message">
                <strong>Error:</strong> ${this.escapeHtml(message)}
            </div>
        `;
        this.elements.resultsContent.classList.add('has-content');
        this.elements.resultsContent.style.display = 'block';
        this.elements.loadingState.style.display = 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }


    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            font-size: 14px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            ${type === 'success' ? 'background: linear-gradient(45deg, #4CAF50, #45a049);' : ''}
            ${type === 'error' ? 'background: linear-gradient(45deg, #F44336, #d32f2f);' : ''}
            ${type === 'info' ? 'background: linear-gradient(45deg, #2196F3, #1976D2);' : ''}
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    openSettings() {
        this.elements.settingsModal.classList.add('active');
        
        // Ensure save button is visible and clickable
        setTimeout(() => {
            const saveBtn = this.elements.saveSettingsBtn;
            if (saveBtn) {
                saveBtn.style.display = 'inline-block';
                saveBtn.style.visibility = 'visible';
                saveBtn.style.opacity = '1';
                console.log('Save button should be visible now');
            }
        }, 100);
    }

    closeSettings() {
        this.elements.settingsModal.classList.remove('active');
    }

    async saveSettings() {
        const settings = {
            openaiKey: this.elements.openaiKey.value.trim(),
            geminiKey: this.elements.geminiKey.value.trim(),
            maxTokens: this.elements.maxTokens.value,
            temperature: this.elements.temperature.value
        };

        try {
            await chrome.storage.sync.set({ aiPromptSettings: settings });
            this.closeSettings();
            this.showToast('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showToast('Failed to save settings', 'error');
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['aiPromptSettings']);
            const settings = result.aiPromptSettings || {
                openaiKey: '',
                geminiKey: '',
                maxTokens: '1500',
                temperature: '0.7'
            };

            this.elements.openaiKey.value = settings.openaiKey;
            this.elements.geminiKey.value = settings.geminiKey;
            this.elements.maxTokens.value = settings.maxTokens;
            this.elements.temperature.value = settings.temperature;
            this.elements.temperatureValue.textContent = settings.temperature;
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async getSettings() {
        try {
            const result = await chrome.storage.sync.get(['aiPromptSettings']);
            return result.aiPromptSettings || {
                openaiKey: '',
                geminiKey: '',
                maxTokens: '1500',
                temperature: '0.7'
            };
        } catch (error) {
            console.error('Failed to get settings:', error);
            return {
                openaiKey: '',
                geminiKey: '',
                maxTokens: '1500',
                temperature: '0.7'
            };
        }
    }

    toggleTextarea() {
        const textarea = this.elements.userText;
        const toggleBtn = this.elements.toggleTextarea;
        
        if (textarea.style.height === '60px' || textarea.style.height === '') {
            // Expand
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
            toggleBtn.classList.remove('collapsed');
            this.logAction('📝 Textarea expanded');
        } else {
            // Collapse
            textarea.style.height = '60px';
            toggleBtn.classList.add('collapsed');
            this.logAction('📝 Textarea collapsed');
        }
    }

    resetTextarea() {
        this.elements.userText.value = '';
        this.elements.userText.style.height = 'auto';
        this.elements.userText.style.height = this.elements.userText.scrollHeight + 'px';
        this.saveContent();
        this.logAction('🗑️ Textarea cleared');
        this.showToast('Text area cleared!', 'success');
    }

    addPrintOptimizedCSS(htmlContent) {
        this.logAction('🎨 Adding print-optimized CSS to prevent PDF truncation...');
        
        // Log input HTML content length
        const inputLength = htmlContent.length;
        this.logAction(`📊 Input HTML to addPrintOptimizedCSS: ${inputLength.toLocaleString()} characters`);
        console.log(`📊 DEBUG: Input HTML to addPrintOptimizedCSS: ${inputLength.toLocaleString()} characters`);
        
        // Define print-optimized CSS
        const printCSS = `
        <style>
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            body {
                margin: 0 !important;
                padding: 20px !important;
                font-size: 12pt !important;
                line-height: 1.4 !important;
                color: #000 !important;
                background: #fff !important;
                max-width: none !important;
                overflow: visible !important;
            }
            
            .page-break {
                page-break-before: always !important;
            }
            
            .no-break {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid !important;
                break-after: avoid !important;
            }
            
            p, li, div {
                orphans: 3 !important;
                widows: 3 !important;
            }
            
            ul, ol {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            table {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            img {
                max-width: 100% !important;
                height: auto !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            .container, .wrapper, .content {
                max-width: none !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            /* Ensure content doesn't get cut off */
            .section, .block, .item {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                margin-bottom: 10pt !important;
            }
            
            /* Fix common layout issues */
            .flex, .grid {
                display: block !important;
            }
            
            .hidden-print {
                display: none !important;
            }
        }
        
        /* Screen styles for better viewing */
        @media screen {
            body {
                margin: 20px;
                padding: 20px;
                background: #f5f5f5;
                font-family: Arial, sans-serif;
            }
            
            .print-preview {
                max-width: 8.5in;
                margin: 0 auto;
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                padding: 40px;
            }
        }
        </style>`;
        
        // Insert CSS into the HTML
        let processedHTML = htmlContent;
        
        // If HTML has a <head> section, insert CSS there
        if (processedHTML.includes('<head>')) {
            processedHTML = processedHTML.replace('<head>', `<head>${printCSS}`);
        } else if (processedHTML.includes('<html>')) {
            processedHTML = processedHTML.replace('<html>', `<html><head>${printCSS}</head>`);
        } else {
            // If no proper HTML structure, wrap the content
            processedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    ${printCSS}
</head>
<body>
    ${processedHTML}
</body>
</html>`;
        }
        
        // Log the final processed HTML length
        const finalLength = processedHTML.length;
        const cssLength = printCSS.length;
        this.logAction(`📊 CSS added: ${cssLength.toLocaleString()} characters`);
        this.logAction(`📊 Final processed HTML: ${finalLength.toLocaleString()} characters`);
        console.log(`📊 DEBUG: CSS added: ${cssLength.toLocaleString()} characters`);
        console.log(`📊 DEBUG: Final processed HTML: ${finalLength.toLocaleString()} characters`);
        
        this.logAction('✅ Print-optimized CSS added successfully');
        return processedHTML;
    }

    // Test function to verify download functionality
    testDownload() {
        console.log('🧪 DEBUG: Testing download functionality...');
        this.logAction('🧪 Testing download functionality...');
        
        // Create test HTML content
        const testContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Document</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .timestamp { color: #7f8c8d; font-style: italic; }
    </style>
</head>
<body>
    <h1>Test Document for Download Functionality</h1>
    <p>This is a test HTML document to verify download functionality.</p>
    <p class="timestamp">Generated at: ${new Date().toISOString()}</p>
</body>
</html>`;
        const fileName = `Test_Document_${new Date().toISOString().split('T')[0]}.html`;
        
        try {
            // Create blob with the test HTML content
            const blob = new Blob([testContent], { type: 'text/html;charset=utf-8' });
            console.log('📦 DEBUG: Test blob created:', blob);
            
            // Create object URL
            const url = URL.createObjectURL(blob);
            console.log('🔗 DEBUG: Test object URL created:', url);
            
            // Create temporary download link
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = fileName;
            downloadLink.style.display = 'none';
            
            console.log('🔗 DEBUG: Test download link created:', downloadLink);
            
            // Add to DOM, click, and remove
            document.body.appendChild(downloadLink);
            console.log('📎 DEBUG: Test link added to DOM');
            
            downloadLink.click();
            console.log('👆 DEBUG: Test link clicked');
            
            document.body.removeChild(downloadLink);
            console.log('🗑️ DEBUG: Test link removed from DOM');
            
            // Revoke object URL to free memory
            setTimeout(() => {
                URL.revokeObjectURL(url);
                console.log('🗑️ DEBUG: Test object URL revoked');
            }, 1000);
            
            console.log('✅ DEBUG: Test download completed');
            this.logAction('✅ Test download completed successfully');
            this.showToast('Test download completed!', 'success');
            
        } catch (error) {
            console.error('❌ DEBUG: Test download error:', error);
            this.logAction(`❌ Test download failed: ${error.message}`);
            this.showError(`Test download failed: ${error.message}`);
        }
    }
}

// Initialize the application
// AI Agent Class with Tool-Based Architecture
class AIAgent {
    constructor(apiKey, settings, appInstance, model = 'openai') {
        this.apiKey = apiKey;
        this.settings = settings;
        this.app = appInstance;
        this.model = model;
        this.tools = {
            identifyPageType: this.identifyPageType.bind(this),
            fetchJobDescription: this.fetchJobDescription.bind(this),
            fetchDocumentRequirements: this.fetchDocumentRequirements.bind(this),
            generateCVDocument: this.generateCVDocument.bind(this),
            generateCoverLetterDocument: this.generateCoverLetterDocument.bind(this)
        };
    }

    async executeWorkflow(jobDescription) {
        this.app.logAction('🧠 AI Agent: Starting intelligent workflow execution...');
        
        try {
            // Step 1: Identify page type
            this.app.logAction('🔍 AI Agent: Calling tool - identifyPageType()');
            const pageType = await this.callTool('identifyPageType', {});
            this.app.logAction(`🔍 AI Agent: Page type result: "${pageType}"`);
            
            // Step 2: Based on page type, decide next actions
            if (pageType.includes('job_posting') || pageType.includes('job_description')) {
                this.app.logAction('📋 AI Agent: Detected job posting page, fetching job description...');
                const jobDesc = await this.callTool('fetchJobDescription', {});
                
                if (jobDesc && !jobDesc.includes('No job description found')) {
                    this.app.logAction('✅ AI Agent: Job description extracted successfully');
                    // Update the text area with extracted job description
                    this.app.elements.userText.value = jobDesc;
                    await this.app.saveContent();
                }
            } else {
                this.app.logAction(`ℹ️ AI Agent: Page type "${pageType}" - skipping job description extraction`);
            }
            
            // Step 3: Check document requirements
            this.app.logAction('📄 AI Agent: Calling tool - fetchDocumentRequirements()');
            const requirements = await this.callTool('fetchDocumentRequirements', {});
            this.app.logAction(`📄 AI Agent: Requirements result: "${requirements}"`);
            
            // Step 4: Generate documents based on requirements
            if (requirements.includes('CV') || requirements.includes('BOTH')) {
                this.app.logAction('📋 AI Agent: CV required, calling generateCVDocument()');
                await this.callTool('generateCVDocument', { jobDescription });
            } else {
                this.app.logAction(`ℹ️ AI Agent: CV not required (requirements: "${requirements}")`);
            }
            
            if (requirements.includes('COVER_LETTER') || requirements.includes('BOTH')) {
                this.app.logAction('📄 AI Agent: Cover letter required, calling generateCoverLetterDocument()');
                await this.callTool('generateCoverLetterDocument', { jobDescription });
            } else {
                this.app.logAction(`ℹ️ AI Agent: Cover letter not required (requirements: "${requirements}")`);
            }
            
            this.app.logAction('🎉 AI Agent: Workflow completed successfully!');
            
        } catch (error) {
            this.app.logAction(`❌ AI Agent: Workflow error: ${error.message}`);
            throw error;
        }
    }

    async callTool(toolName, parameters) {
        // Enhanced parameter logging
        let paramSummary = '';
        if (parameters.jobDescription) {
            paramSummary = `Job Description: ${parameters.jobDescription.substring(0, 100)}${parameters.jobDescription.length > 100 ? '...' : ''}`;
        } else {
            paramSummary = JSON.stringify(parameters);
        }
        
        this.app.logAction(`🛠️ AI Agent: Executing tool "${toolName}"`);
        this.app.logAction(`🛠️ Parameters: ${paramSummary}`);
        
        try {
            const result = await this.tools[toolName](parameters);
            this.app.logAction(`✅ AI Agent: Tool "${toolName}" completed successfully`);
            return result;
        } catch (error) {
            this.app.logAction(`❌ AI Agent: Tool "${toolName}" failed: ${error.message}`);
            throw error;
        }
    }

    // Tool 1: Identify Page Type
    async identifyPageType(params) {
        this.app.logAction('🔍 Tool: Analyzing current page to identify type...');
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                const textContent = document.body.innerText || document.body.textContent || '';
                return {
                    text: textContent.substring(0, 20000),
                    title: document.title,
                    url: window.location.href
                };
            }
        });

        const pageData = results[0].result;
        
        const prompt = `Analyze the following webpage and identify its type:

Title: ${pageData.title}
URL: ${pageData.url}
Content: ${pageData.text}

Classify this page as one of these types:
- "job_posting" - if it's a job posting/description page
- "application_form" - if it's a job application form page
- "company_careers" - if it's a company careers page
- "other" - if it doesn't fit the above categories

Respond with only the classification:`;

        const result = await this.app.callAI(prompt, 'gpt-3.5-turbo-16k', this.apiKey, this.settings);
        this.app.logAction(`🔍 Tool Result: Page identified as "${result.trim()}"`);
        return result.trim();
    }

    // Tool 2: Fetch Job Description
    async fetchJobDescription(params) {
        this.app.logAction('📋 Tool: Extracting job description from current page...');
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                const textContent = document.body.innerText || document.body.textContent || '';
                return {
                    text: textContent.substring(0, 20000),
                    title: document.title,
                    url: window.location.href
                };
            }
        });

        const pageData = results[0].result;
        
        const prompt = `Extract the job description from the following webpage content:

Title: ${pageData.title}
URL: ${pageData.url}
Content: ${pageData.text}

Instructions:
1. Look for job title, responsibilities, requirements, qualifications, company info, salary, benefits
2. If job description found, format it clearly with sections:
   - Job Title
   - Company
   - Location
   - Job Description/Responsibilities
   - Requirements/Qualifications
   - Benefits (if mentioned)
   - Salary (if mentioned)
3. If NO job description found, respond with: "No job description found"
4. Only extract job-related information, ignore navigation/ads

Extract the job description:`;

        const result = await this.app.callAI(prompt, 'gpt-3.5-turbo-16k', this.apiKey, this.settings);
        this.app.logAction(`📋 Tool Result: Job description extraction completed`);
        return result;
    }

    // Tool 3: Fetch Document Requirements
    async fetchDocumentRequirements(params) {
        this.app.logAction('📄 Tool: Analyzing page for document upload requirements...');
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                const textContent = document.body.innerText || document.body.textContent || '';
                return {
                    text: textContent.substring(0, 20000),
                    title: document.title,
                    url: window.location.href
                };
            }
        });

        const pageData = results[0].result;
        
        const prompt = `You are a web page analyzer specializing in job application forms. Analyze the following webpage content and determine EXACTLY what documents are required for application.

Title: ${pageData.title}
URL: ${pageData.url}
Content: ${pageData.text}

CRITICAL ANALYSIS INSTRUCTIONS:
1. Look SPECIFICALLY for these exact phrases and variations:
   - "Upload CV" or "Upload Resume" or "CV Upload" or "Resume Upload"
   - "Upload Cover Letter" or "Cover Letter Upload" or "Cover Letter Required"
   - "Attach CV" or "Attach Resume" or "Attach Cover Letter"
   - File upload fields labeled with these terms

2. Look for application form sections that mention:
   - Document upload requirements
   - Required attachments
   - File upload buttons/fields
   - Application checklist items

3. IGNORE these elements (they are NOT document requirements):
   - General job descriptions
   - Company information
   - Benefits and perks
   - Job responsibilities
   - Contact information
   - Navigation menus
   - Footer content
   - Social media links

4. Be VERY PRECISE in your analysis:
   - If you see ONLY CV/Resume upload mentioned → respond "CV_ONLY"
   - If you see ONLY Cover Letter upload mentioned → respond "COVER_LETTER_ONLY"  
   - If you see BOTH CV/Resume AND Cover Letter mentioned → respond "BOTH"
   - If you see NO document upload requirements → respond "NONE"

5. IMPORTANT: Only count actual upload requirements, not general mentions of documents in job descriptions.

6. Look for specific upload buttons, file input fields, or explicit text like:
   - "Please upload your CV"
   - "Attach your resume"
   - "Cover letter required"
   - "Upload documents"

RESPOND WITH EXACTLY ONE WORD: CV_ONLY, COVER_LETTER_ONLY, BOTH, or NONE`;

        const result = await this.app.callAI(prompt, 'gpt-3.5-turbo-16k', this.apiKey, this.settings);
        this.app.logAction(`📄 Tool Result: Document requirements identified as "${result.trim()}"`);
        return result.trim();
    }

    // Tool 4: Generate CV Document
    async generateCVDocument(params) {
        this.app.logAction('📋 Tool: Generating optimized CV document...');
        
        if (!this.app.uploadedTemplates.cv) {
            this.app.logAction('❌ Tool Error: CV template not found');
            throw new Error('CV template required! Please upload your CV template first.');
        }

        // Log CV content being sent to LLM
        this.app.logAction(`📄 CV Template Content (${this.app.uploadedTemplates.cv.name}):`);
        this.app.logAction(`📄 ${this.app.uploadedTemplates.cv.content.substring(0, 200)}${this.app.uploadedTemplates.cv.content.length > 200 ? '...' : ''}`);
        this.app.logAction(`📄 CV Template Length: ${this.app.uploadedTemplates.cv.content.length} characters`);

        const prompt = `You are a professional resume writer. Your task is to optimize the provided CV content to better match the job requirements while maintaining the EXACT same structure, length, and factual accuracy.

CONTEXT - COMPLETE CV TEMPLATE:
${this.app.uploadedTemplates.cv.content}

REFERENCE - JOB DESCRIPTION:
${params.jobDescription}

CRITICAL REQUIREMENTS:
1. OUTPUT LENGTH: Your output must be approximately the same length as the input CV template (${this.app.uploadedTemplates.cv.content.length} characters)
2. NO TRUNCATION: Include ALL sections, experiences, skills, and content from the original CV
3. EXACT STRUCTURE: Keep the EXACT same HTML structure, CSS classes, and formatting
4. FACTUAL ACCURACY: NEVER add, remove, or modify any factual information (dates, company names, job titles, project names, technologies, achievements, etc.)
5. NO HALLUCINATION: NEVER invent any work experience, projects, skills, or accomplishments

OPTIMIZATION TASK - TWEAK EACH SECTION:
For each section of the CV, optimize the content to highlight relevance to the job description:

1. PROFESSIONAL SUMMARY: Rephrase to emphasize skills and experiences that match the job requirements
2. SKILLS SECTION: Reorder and rephrase skills to highlight those mentioned in the job description
3. WORK EXPERIENCE: For each job experience:
   - Rephrase job descriptions to emphasize relevant skills and achievements
   - Adjust bullet points to highlight experiences that match job requirements
   - Use keywords from the job description where appropriate
   - Maintain the same level of detail and content volume
4. PROJECTS: Rephrase project descriptions to emphasize relevant technologies and outcomes
5. EDUCATION: Keep as-is unless directly relevant to job requirements

OPTIMIZATION EXAMPLES:
- Original: "Developed web applications using various technologies"
- Optimized: "Developed scalable web applications using React, Node.js, and MongoDB, focusing on user experience and performance optimization"
- Structure and length remain the same, but content is optimized for relevance

OUTPUT REQUIREMENTS:
- Return the COMPLETE optimized HTML document
- Maintain approximately the same character count as input
- Include ALL original content, just rephrased and optimized
- No additional text or explanations
- No truncation or content removal`;

        this.app.logAction('🤖 Sending CV template and job description to OpenAI GPT-3.5-turbo-16k...');
        const result = await this.app.callAI(prompt, 'gpt-3.5-turbo-16k', this.apiKey, this.settings);
        
        // Log LLM output character count and preview
        const llmOutputCharCount = result.length;
        this.app.logAction(`📊 LLM Output character count: ${llmOutputCharCount.toLocaleString()}`);
        console.log(`📊 DEBUG: LLM Output character count: ${llmOutputCharCount.toLocaleString()}`);
        
        // Log a preview of the LLM output to see if it's truncated
        const llmPreview = result.substring(0, 500);
        this.app.logAction(`📊 LLM Output Preview: ${llmPreview}${result.length > 500 ? '...' : ''}`);
        console.log(`📊 DEBUG: LLM Output Preview: ${llmPreview}${result.length > 500 ? '...' : ''}`);
        
        // Log the end of the LLM output to check for truncation
        if (result.length > 1000) {
            const llmEnd = result.substring(result.length - 500);
            this.app.logAction(`📊 LLM Output End: ...${llmEnd}`);
            console.log(`📊 DEBUG: LLM Output End: ...${llmEnd}`);
        }
        
        this.app.logAction('📋 Tool Result: CV document generated successfully');
        
        // Use LLM output directly without post-processing
        this.app.logAction('✅ Using LLM output directly without post-processing');
        
        // Show download button with raw LLM output
        this.app.showDocumentDownloads({ cv: result });
        return result;
    }

    // Tool 5: Generate Cover Letter Document
    async generateCoverLetterDocument(params) {
        this.app.logAction('📄 Tool: Generating personalized cover letter document...');
        
        if (!this.app.uploadedTemplates.coverLetter) {
            this.app.logAction('❌ Tool Error: Cover letter template not found');
            throw new Error('Cover letter template required! Please upload your cover letter template first.');
        }

        // Log cover letter content being sent to LLM
        this.app.logAction(`📄 Cover Letter Template Content (${this.app.uploadedTemplates.coverLetter.name}):`);
        this.app.logAction(`📄 ${this.app.uploadedTemplates.coverLetter.content.substring(0, 200)}${this.app.uploadedTemplates.coverLetter.content.length > 200 ? '...' : ''}`);
        this.app.logAction(`📄 Cover Letter Template Length: ${this.app.uploadedTemplates.coverLetter.content.length} characters`);

        const prompt = `You are a professional resume writer. Using the provided HTML cover letter template and job description, create a personalized cover letter that matches the job requirements while maintaining the exact same structure and factual accuracy.

HTML Cover Letter Template:
${this.app.uploadedTemplates.coverLetter.content}

Job Description:
${params.jobDescription}

CRITICAL INSTRUCTIONS - MAINTAIN STRUCTURE AND FACTUAL ACCURACY:
1. Keep the EXACT same HTML structure, CSS classes, and formatting as the template
2. NEVER add, remove, or modify any factual information (personal details, work experience, skills, achievements, etc.)
3. NEVER hallucinate or invent any work experience, projects, skills, or accomplishments
4. Keep all personal information intact

CONTENT OPTIMIZATION REQUIRED:
5. Replace placeholder content with job-specific information (using only existing facts from the template)
6. Optimize the content to highlight relevant skills and experiences that match the job requirements
7. Adjust language and emphasis to better align with the job description
8. Use keywords and phrases from the job description where appropriate
9. Maintain professional tone and language
10. Keep the letter concise but impactful

SPECIFIC OPTIMIZATION EXAMPLES:
- If job requires "Python development", emphasize Python experience
- If job requires "team leadership", highlight leadership experiences
- If job requires "data analysis", emphasize analytical skills
- If job requires "cloud technologies", highlight relevant cloud experience

TECHNICAL REQUIREMENTS:
11. Maintain all HTML tags, CSS classes, and styling exactly as in the template
12. Add print-friendly CSS to ensure proper PDF generation:
    - Use @media print rules for print optimization
    - Set page-break-inside: avoid for sections
    - Use page-break-before: auto for new sections
    - Set margins and padding for print
    - Ensure content fits within page boundaries

EXAMPLE OF CONTENT OPTIMIZATION:
- Original: "I have experience in software development"
- Optimized: "My experience in software development, particularly in [specific technology mentioned in template], aligns well with your requirements for [specific job requirement]"
- Structure remains the same, but content is optimized for relevance

Return only the complete HTML document, no additional text or explanations`;

        this.app.logAction('🤖 Sending cover letter template and job description to OpenAI GPT-3.5-turbo-16k...');
        const result = await this.app.callAI(prompt, 'gpt-3.5-turbo-16k', this.apiKey, this.settings);
        
        // Log LLM output character count and preview
        const llmOutputCharCount = result.length;
        this.app.logAction(`📊 LLM Output character count: ${llmOutputCharCount.toLocaleString()}`);
        console.log(`📊 DEBUG: LLM Output character count: ${llmOutputCharCount.toLocaleString()}`);
        
        // Log a preview of the LLM output to see if it's truncated
        const llmPreview = result.substring(0, 500);
        this.app.logAction(`📊 LLM Output Preview: ${llmPreview}${result.length > 500 ? '...' : ''}`);
        console.log(`📊 DEBUG: LLM Output Preview: ${llmPreview}${result.length > 500 ? '...' : ''}`);
        
        // Log the end of the LLM output to check for truncation
        if (result.length > 1000) {
            const llmEnd = result.substring(result.length - 500);
            this.app.logAction(`📊 LLM Output End: ...${llmEnd}`);
            console.log(`📊 DEBUG: LLM Output End: ...${llmEnd}`);
        }
        
        this.app.logAction('📄 Tool Result: Cover letter document generated successfully');
        
        // Use LLM output directly without post-processing
        this.app.logAction('✅ Using LLM output directly without post-processing');
        
        // Show download button with raw LLM output
        this.app.showDocumentDownloads({ coverLetter: result });
        return result;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new AIPromptProcessorPro();
    
    // Expose test function globally for debugging
    window.testDownload = () => {
        if (window.app) {
            window.app.testDownload();
        } else {
            console.error('App not initialized yet');
        }
    };
    
    console.log('🔧 DEBUG: Extension loaded. Use testDownload() to test download functionality.');
});


// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);