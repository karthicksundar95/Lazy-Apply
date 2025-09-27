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
        
        // Show Fill it up button if CV is already uploaded
        setTimeout(() => {
            console.log('🔍 DEBUG: Constructor timeout - checking Fill it up button visibility');
            this.updateFillItUpButtonVisibility();
        }, 500);
    }

    init() {
        this.elements = {
            // Input elements
            userText: document.getElementById('userText'),
            generateBtn: document.getElementById('generateBtn'),
            fillItUpBtn: document.getElementById('fillItUpBtn'),
            
            // Results elements
            
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
        
        // Fill it up button
        this.elements.fillItUpBtn.addEventListener('click', () => this.fillApplicationForm());
        
        // Lazy button - extract job description
        this.elements.lazyBtn.addEventListener('click', () => this.extractJobDescription());
        
        // Upload buttons
        this.elements.uploadCoverLetterBtn.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                e.stopPropagation();
                this.removeUploadedFile('coverLetter');
            } else {
                this.elements.coverLetterUpload.click();
            }
        });
        this.elements.uploadCvBtn.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                e.stopPropagation();
                this.removeUploadedFile('cv');
            } else {
                this.elements.cvUpload.click();
            }
        });
        this.elements.coverLetterUpload.addEventListener('change', (e) => this.handleFileUpload(e, 'coverLetter'));
        this.elements.cvUpload.addEventListener('change', (e) => this.handleFileUpload(e, 'cv'));
        
        // Settings modal
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        
        // Temperature slider
        this.elements.temperature.addEventListener('input', (e) => {
            if (this.elements.temperatureValue) {
                this.elements.temperatureValue.textContent = e.target.value;
            }
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
        
        // Update Fill it up button visibility after all elements are set up
        console.log('🔍 DEBUG: Init complete - checking Fill it up button visibility');
        this.updateFillItUpButtonVisibility();
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
                this.updateFillItUpButtonVisibility();
            }
        } catch (error) {
            console.error('Error loading persisted data:', error);
        }
        
        // Always update Fill it up button visibility after loading data
        console.log('🔍 DEBUG: Data loaded - checking Fill it up button visibility');
        this.updateFillItUpButtonVisibility();
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

    updateFillItUpButtonVisibility() {
        console.log('🔍 DEBUG: updateFillItUpButtonVisibility called');
        console.log('🔍 DEBUG: fillItUpBtn element:', this.elements.fillItUpBtn);
        
        if (this.elements.fillItUpBtn) {
            // Always show the Fill it up button
            this.elements.fillItUpBtn.style.display = 'block';
            this.logAction('📝 Fill it up button is always visible');
            console.log('🔍 DEBUG: Button is now always visible');
        } else {
            console.log('🔍 DEBUG: fillItUpBtn element not found!');
            this.logAction('❌ Fill it up button element not found');
        }
    }

    updateUploadButtonStates() {
        // Update Cover Letter button
        if (this.uploadedTemplates.coverLetter) {
            this.elements.uploadCoverLetterBtn.innerHTML = '✅ Cover Letter Uploaded<span class="delete-btn" title="Remove cover letter">×</span>';
            this.elements.uploadCoverLetterBtn.classList.add('uploaded');
        } else {
            this.elements.uploadCoverLetterBtn.innerHTML = '📄 Cover Letter<span class="delete-btn" title="Remove cover letter" style="display: none;">×</span>';
            this.elements.uploadCoverLetterBtn.classList.remove('uploaded');
        }

        // Update CV button
        if (this.uploadedTemplates.cv) {
            this.elements.uploadCvBtn.innerHTML = '✅ CV Uploaded<span class="delete-btn" title="Remove CV">×</span>';
            this.elements.uploadCvBtn.classList.add('uploaded');
        } else {
            this.elements.uploadCvBtn.innerHTML = '📋 CV Template<span class="delete-btn" title="Remove CV" style="display: none;">×</span>';
            this.elements.uploadCvBtn.classList.remove('uploaded');
        }
    }

    removeUploadedFile(type) {
        if (type === 'coverLetter') {
            delete this.uploadedTemplates.coverLetter;
            this.logAction('🗑️ Cover letter removed');
            this.showToast('Cover letter removed!', 'success');
        } else if (type === 'cv') {
            delete this.uploadedTemplates.cv;
            this.logAction('🗑️ CV removed');
            this.showToast('CV removed!', 'success');
            
            // Fill it up button remains visible even without CV
            this.updateFillItUpButtonVisibility();
        }
        
        this.updateUploadButtonStates();
        this.saveContent();
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
        if (this.elements.lazyBtn) {
            this.elements.lazyBtn.disabled = true;
        }
        if (this.elements.lazyBtn) {
            this.elements.lazyBtn.textContent = '🔍 Extracting...';
        }
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
            if (this.elements.lazyBtn) {
                this.elements.lazyBtn.disabled = false;
                this.elements.lazyBtn.innerHTML = '🔍 Lazy Scan';
            }
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
            
            // Fill it up button is always visible now
            this.updateFillItUpButtonVisibility();
            
            this.showToast(`${type === 'coverLetter' ? 'Cover Letter' : 'CV'} template uploaded successfully!`, 'success');
            
            // Update button text to show uploaded status
            const button = type === 'coverLetter' ? this.elements.uploadCoverLetterBtn : this.elements.uploadCvBtn;
            if (button) {
                button.textContent = `✅ ${type === 'coverLetter' ? 'Cover Letter' : 'CV'} Uploaded`;
                button.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            }
            
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
                console.log('Job description set to textarea:', result.substring(0, 100) + '...');
                console.log('Textarea value:', this.elements.userText.value.substring(0, 100) + '...');
                this.showToast('Job description extracted and filled!', 'success');
                
                // Auto-resize the textarea and ensure it's visible
                if (this.elements.userText) {
                    this.elements.userText.style.height = 'auto';
                    this.elements.userText.style.height = this.elements.userText.scrollHeight + 'px';
                }
                
                // Ensure textarea is expanded to show content
                if (this.elements.toggleTextarea) {
                    this.elements.toggleTextarea.classList.remove('collapsed');
                }
                
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
        
        // Store documents in memory for download (accumulate, don't replace)
        if (!this.generatedDocuments) {
            this.generatedDocuments = {};
        }
        // Merge new documents with existing ones
        Object.assign(this.generatedDocuments, documents);
        
        // Debug: Log what's now in memory
        this.logAction(`📥 Documents now in memory: ${Object.keys(this.generatedDocuments).join(', ')}`);
        
        // Show download buttons in header
        if (this.elements.downloadButtons) {
            this.elements.downloadButtons.style.display = 'flex';
        }
        
        if (documents.coverLetter && this.elements.downloadCoverLetterBtn) {
            this.logAction('📄 Showing cover letter download button in header');
            this.elements.downloadCoverLetterBtn.style.display = 'block';
        }
        
        if (documents.cv && this.elements.downloadCvBtn) {
            this.logAction('📋 Showing CV download button in header');
            this.elements.downloadCvBtn.style.display = 'block';
        }
        
        // Note: Fill it up button visibility is handled independently in handleFileUpload
        
        // Success message removed - no longer needed
        
        this.logAction('✅ Download buttons should now be visible in header');
    }

    downloadDocument(type) {
        console.log(`🔍 DEBUG: downloadDocument called with type: ${type}`);
        this.logAction(`📥 Download requested for: ${type}`);
        
        if (!this.generatedDocuments || !this.generatedDocuments[type]) {
            console.log(`❌ DEBUG: No ${type} document found in memory`);
            console.log(`❌ DEBUG: generatedDocuments:`, this.generatedDocuments);
            this.logAction(`❌ No ${type} document found in memory`);
            this.logAction(`❌ Available documents: ${Object.keys(this.generatedDocuments || {}).join(', ')}`);
            this.showError(`No ${type} document available for download`);
            return;
        }
        
        const content = this.generatedDocuments[type];
        const documentTitle = type === 'coverLetter' ? 'Cover_Letter' : 'CV_Resume';
        const fileName = `${documentTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        console.log(`📥 DEBUG: Creating PDF download for ${fileName} (${content.length} characters)`);
        this.logAction(`📥 Creating PDF download for ${fileName} (${content.length} characters)`);
        
        // Use the new PDF generation function
        // Use blob download to avoid popup closing issues
        this.downloadAsBlob(content, fileName, type);
    }

    downloadAsBlob(htmlContent, fileName, type) {
        try {
            this.logAction(`📥 Creating download for ${fileName}`);
            
            // Create a blob with the HTML content
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // Create a temporary download link
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = fileName.replace('.pdf', '.html'); // Download as HTML
            downloadLink.style.display = 'none';
            
            // Add to DOM, click, and remove
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Clean up the URL
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);
            
            this.logAction(`✅ ${type === 'coverLetter' ? 'Cover Letter' : 'CV'} downloaded as HTML file`);
            this.showToast(`${type === 'coverLetter' ? 'Cover Letter' : 'CV'} downloaded! Open the HTML file and use Ctrl+P to save as PDF.`, 'success');
            
        } catch (error) {
            console.error(`Error downloading ${type}:`, error);
            this.logAction(`❌ Error downloading ${type}: ${error.message}`);
            this.showError(`Failed to download ${type}: ${error.message}`);
        }
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
            
            // Write the HTML content to the new window using a more robust method
            printWindow.document.open();
            printWindow.document.write(completeHTML);
            printWindow.document.close();
            
            // Debug: Check if content was written correctly
            setTimeout(() => {
                const bodyContent = printWindow.document.body ? printWindow.document.body.innerHTML : 'No body content';
                console.log(`📊 DEBUG: Window body content length: ${bodyContent.length}`);
                console.log(`📊 DEBUG: Window body preview: ${bodyContent.substring(0, 200)}...`);
                this.logAction(`📊 DEBUG: Window body content length: ${bodyContent.length}`);
                
                // Additional check for cover letter specific content
                if (type === 'coverLetter') {
                    const coverLetterContent = printWindow.document.querySelector('.print-preview');
                    if (coverLetterContent) {
                        console.log(`📊 DEBUG: Cover letter content length: ${coverLetterContent.innerHTML.length}`);
                        this.logAction(`📊 DEBUG: Cover letter content length: ${coverLetterContent.innerHTML.length}`);
                        
                        // Check if the content is actually visible
                        const visibleText = printWindow.document.body ? printWindow.document.body.innerText : 'No visible text';
                        console.log(`📊 DEBUG: Visible text length: ${visibleText.length}`);
                        console.log(`📊 DEBUG: Visible text preview: ${visibleText.substring(0, 200)}...`);
                        this.logAction(`📊 DEBUG: Visible text length: ${visibleText.length}`);
                        
                        // Check for any errors in the document
                        const errors = printWindow.document.querySelectorAll('*');
                        console.log(`📊 DEBUG: Total elements in document: ${errors.length}`);
                    } else {
                        console.log(`📊 DEBUG: No .print-preview element found`);
                        this.logAction(`📊 DEBUG: No .print-preview element found`);
                    }
                }
            }, 500);
            
            // Wait for content to load, then trigger print
            setTimeout(() => {
                printWindow.focus();
                
                // Special check for cover letter content integrity
                if (type === 'coverLetter') {
                    const visibleText = printWindow.document.body ? printWindow.document.body.innerText : '';
                    const visibleTextLength = visibleText.length;
                    
                    // If visible text is significantly less than input, trigger fallback
                    if (visibleTextLength < (inputCharCount * 0.1)) { // Less than 10% of input
                        this.logAction(`⚠️ Cover letter content appears truncated (${visibleTextLength} vs ${inputCharCount} chars) - triggering HTML fallback`);
                        printWindow.close();
                        this.downloadAsHTML(htmlContent, fileName.replace('.pdf', '.html'), type);
                        return;
                    }
                }
                
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
            
            // Special fallback for cover letter
            if (type === 'coverLetter') {
                this.logAction('📄 Cover letter PDF generation failed - attempting HTML fallback...');
                try {
                    this.downloadAsHTML(htmlContent, fileName.replace('.pdf', '.html'), type);
                    this.logAction('✅ Cover letter downloaded as HTML file instead');
                    this.showToast('Cover letter downloaded as HTML file!', 'success');
                    return;
                } catch (fallbackError) {
                    this.logAction(`❌ Cover letter HTML fallback also failed: ${fallbackError.message}`);
                }
            }
            
            this.showError(`Failed to generate PDF for ${type}: ${error.message}`);
        }
    }

    downloadAsHTML(content, fileName, type) {
        try {
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = fileName;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            URL.revokeObjectURL(url);
            
            this.logAction(`✅ ${type === 'cv' ? 'CV' : 'Cover Letter'} downloaded as HTML file`);
            this.showToast(`${type === 'cv' ? 'CV' : 'Cover Letter'} downloaded as HTML!`, 'success');
        } catch (error) {
            this.logAction(`❌ HTML download failed: ${error.message}`);
            this.showToast(`Download failed: ${error.message}`, 'error');
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
        console.log('📊 DEBUG: callOpenAI settings:', settings);
        console.log('📊 DEBUG: max_tokens being sent:', parseInt(settings.maxTokens));
        
        const requestBody = {
            model: 'gpt-3.5-turbo-16k',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: parseInt(settings.maxTokens),
            temperature: parseFloat(settings.temperature)
        };
        
        console.log('📊 DEBUG: OpenAI API request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📊 DEBUG: OpenAI API response:', JSON.stringify(data, null, 2));
        console.log('📊 DEBUG: Response content length:', data.choices[0].message.content.length);
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
        // Loading state removed - no longer needed
    }

    hideLoading() {
        // Loading state removed - no longer needed
    }

    showResult(result) {
        // Results display removed - no longer needed
    }

    showError(message) {
        // Error display removed - no longer needed
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
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.add('active');
        }
        
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
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.remove('active');
        }
    }

    async saveSettings() {
        const settings = {
            openaiKey: this.elements.openaiKey ? this.elements.openaiKey.value.trim() : '',
            geminiKey: this.elements.geminiKey ? this.elements.geminiKey.value.trim() : '',
            maxTokens: this.elements.maxTokens ? this.elements.maxTokens.value : '4000',
            temperature: this.elements.temperature ? this.elements.temperature.value : '0.7'
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
                maxTokens: '4000',
                temperature: '0.7'
            };

            if (this.elements.openaiKey) this.elements.openaiKey.value = settings.openaiKey;
            if (this.elements.geminiKey) this.elements.geminiKey.value = settings.geminiKey;
            if (this.elements.maxTokens) this.elements.maxTokens.value = settings.maxTokens;
            if (this.elements.temperature) this.elements.temperature.value = settings.temperature;
            if (this.elements.temperatureValue) this.elements.temperatureValue.textContent = settings.temperature;
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async getSettings() {
        try {
            const result = await chrome.storage.sync.get(['aiPromptSettings']);
            const settings = result.aiPromptSettings || {
                openaiKey: '',
                geminiKey: '',
                maxTokens: '4000',
                temperature: '0.7'
            };
            
            // Force update maxTokens to 4000 if it's not already
            if (settings.maxTokens !== '4000') {
                console.log(`📊 DEBUG: Updating maxTokens from ${settings.maxTokens} to 4000`);
                settings.maxTokens = '4000';
                // Save the updated settings
                await chrome.storage.sync.set({ aiPromptSettings: settings });
            }
            
            return settings;
        } catch (error) {
            console.error('Failed to get settings:', error);
            return {
                openaiKey: '',
                geminiKey: '',
                maxTokens: '4000',
                temperature: '0.7'
            };
        }
    }

    toggleTextarea() {
        const textarea = this.elements.userText;
        const toggleBtn = this.elements.toggleTextarea;
        
        if (!textarea || !toggleBtn) return;
        
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
        if (this.elements.userText) {
            this.elements.userText.value = '';
            this.elements.userText.style.height = 'auto';
            this.elements.userText.style.height = this.elements.userText.scrollHeight + 'px';
        }
        this.saveContent();
        this.logAction('🗑️ Textarea cleared');
        this.showToast('Text area cleared!', 'success');
    }

    truncateHTMLForFormAnalysis(html) {
        // Create a temporary DOM parser to extract input fields
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract only actual input elements that users can type into
        const inputElements = [];
        
        // Get all text input fields (input, textarea, select) - including those without explicit type
        const inputs = doc.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input[type="search"], input[type="password"], input:not([type]), textarea, select');
        
        inputs.forEach(input => {
            // Get the input element and its immediate context (label + container)
            const inputHTML = input.outerHTML;
            
            // Find associated label
            let labelHTML = '';
            const label = doc.querySelector(`label[for="${input.id}"]`);
            if (label) {
                labelHTML = label.outerHTML;
            } else {
                // Look for label that contains this input
                const parentLabel = input.closest('label');
                if (parentLabel) {
                    labelHTML = parentLabel.outerHTML;
                }
            }
            
            // Get the immediate container for context
            const container = input.closest('div, fieldset, section, article, main, li, tr, p') || input.parentElement;
            let containerHTML = '';
            if (container && container !== input) {
                containerHTML = container.outerHTML;
            }
            
            // Combine all relevant HTML for this input
            const inputContext = `
<!-- Input Field -->
${labelHTML}
${inputHTML}
${containerHTML}
            `.trim();
            
            inputElements.push(inputContext);
        });
        
        // Get page title and meta information
        const title = doc.querySelector('title')?.textContent || '';
        const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        // Combine all input-related content
        let truncatedContent = `
<!-- Page Title: ${title} -->
<!-- Meta Description: ${metaDescription} -->

<!-- Input Fields Found (${inputElements.length} fields): -->
${inputElements.join('\n\n')}
        `.trim();
        
        // Prioritize keeping ALL input fields - only truncate if absolutely necessary
        const maxLength = 30000; // Increased to accommodate more fields
        if (truncatedContent.length > maxLength) {
            // Try to fit all input fields first, then truncate other content if needed
            let headerContent = `
<!-- Page Title: ${title} -->
<!-- Meta Description: ${metaDescription} -->

<!-- Input Fields Found (${inputElements.length} fields): -->
            `.trim();
            
            // Calculate how much space we have for input fields
            const availableSpace = maxLength - headerContent.length - 200; // 200 chars buffer
            
            // Try to fit all input fields
            let allFieldsContent = '';
            let fieldsFit = 0;
            
            for (const field of inputElements) {
                if (allFieldsContent.length + field.length > availableSpace) {
                    break;
                }
                allFieldsContent += field + '\n\n';
                fieldsFit++;
            }
            
            // If we can fit all fields, use them all
            if (fieldsFit === inputElements.length) {
                truncatedContent = headerContent + '\n' + allFieldsContent;
            } else {
                // If we can't fit all fields, prioritize the most important ones
                // Sort fields by importance (text inputs first, then others)
                const sortedFields = inputElements.sort((a, b) => {
                    const aIsText = a.includes('type="text"') || a.includes('<textarea') || a.includes('<input[type="email"');
                    const bIsText = b.includes('type="text"') || b.includes('<textarea') || b.includes('<input[type="email"');
                    return bIsText - aIsText; // Text fields first
                });
                
                let prioritizedContent = '';
                let prioritizedCount = 0;
                
                for (const field of sortedFields) {
                    if (prioritizedContent.length + field.length > availableSpace) {
                        break;
                    }
                    prioritizedContent += field + '\n\n';
                    prioritizedCount++;
                }
                
                truncatedContent = `
<!-- Page Title: ${title} -->
<!-- Meta Description: ${metaDescription} -->

<!-- Input Fields Found (${prioritizedCount} of ${inputElements.length} fields shown - prioritized text inputs): -->
${prioritizedContent}
<!-- Truncated for length - showing most important fields first -->
                `.trim();
            }
        }
        
        return truncatedContent;
    }

    extractTextFromHTML(htmlContent) {
        // Create a temporary DOM parser to extract text content
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // Remove script and style elements
        const scripts = doc.querySelectorAll('script, style');
        scripts.forEach(el => el.remove());
        
        // Extract text content while preserving links and ALL p tags
        let textContent = '';
        
        // First, extract all p tags specifically to ensure none are missed
        const allPTags = doc.querySelectorAll('p');
        const pTagContents = [];
        
        allPTags.forEach(pTag => {
            let pContent = '';
            
            // Process each child node in the p tag
            for (let i = 0; i < pTag.childNodes.length; i++) {
                const child = pTag.childNodes[i];
                if (child.nodeType === Node.TEXT_NODE) {
                    // Handle text nodes
                    pContent += child.textContent || '';
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    if (child.tagName === 'A' && child.href) {
                        // For links, include both the text and the URL
                        pContent += `${child.textContent.trim()} (${child.href})`;
                    } else {
                        // For other elements, get their text content
                        pContent += child.textContent || '';
                    }
                }
            }
            
            if (pContent.trim()) {
                pTagContents.push(pContent.trim());
            }
        });
        
        // Also extract other important elements (headings, divs, etc.)
        const processElement = (element) => {
            if (element.tagName === 'A' && element.href) {
                // For links, include both the text and the URL
                return `${element.textContent.trim()} (${element.href})`;
            } else if (element.children.length > 0) {
                // For elements with children, process them recursively
                return Array.from(element.children).map(processElement).join(' ');
            } else {
                // For text nodes, return the text content
                return element.textContent || '';
            }
        };
        
        // Combine p tag contents with other content
        const otherContent = processElement(doc.body);
        textContent = pTagContents.join('\n') + '\n' + otherContent;
        
        // Clean up the text but preserve important structure
        let cleanText = textContent
            .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
            .replace(/\n\s*\n/g, '\n')  // Remove empty lines
            .trim();
        
        // Debug: Log what sections we captured
        const hasWorkExperience = cleanText.toLowerCase().includes('experience') || cleanText.toLowerCase().includes('work');
        const hasSkills = cleanText.toLowerCase().includes('skills') || cleanText.toLowerCase().includes('technical');
        const hasEducation = cleanText.toLowerCase().includes('education') || cleanText.toLowerCase().includes('degree');
        const hasProjects = cleanText.toLowerCase().includes('project') || cleanText.toLowerCase().includes('portfolio');
        
        console.log(`📊 CV Sections captured: Work Experience: ${hasWorkExperience}, Skills: ${hasSkills}, Education: ${hasEducation}, Projects: ${hasProjects}`);
        console.log(`📊 P tags extracted: ${pTagContents.length} paragraphs`);
        
        // If text is still too long, truncate it
        const maxLength = 15000; // Significantly increased to preserve more CV content
        if (cleanText.length > maxLength) {
            cleanText = cleanText.substring(0, maxLength) + '... (truncated)';
        }
        
        return cleanText;
    }

    async fillApplicationForm() {
        this.logAction('📝 Starting application form filling...');
        
        if (!this.uploadedTemplates.cv) {
            this.logAction('❌ CV template required for form filling');
            this.showToast('Please upload a CV template first!', 'error');
            return;
        }

        // Load settings to ensure API key is available
        const settings = await this.getSettings();
        if (!settings.openaiKey) {
            this.logAction('❌ OpenAI API key required for form filling');
            this.showToast('Please configure OpenAI API key in settings!', 'error');
            return;
        }

        try {
            // Get current page HTML
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.logAction(`📍 Current tab: ${tab.title}`);
            
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    return {
                        html: document.documentElement.outerHTML,
                        url: window.location.href,
                        title: document.title
                    };
                }
            });

            const pageData = results[0].result;
            this.logAction(`✅ Page data extracted (${pageData.html.length} characters)`);

            // Truncate HTML to focus on form elements and reduce context size
            const truncatedHTML = this.truncateHTMLForFormAnalysis(pageData.html);
            this.logAction(`📝 HTML truncated to ${truncatedHTML.length} characters for form analysis`);
            
            // Debug: Log a preview of what input fields were extracted
            const inputFieldsCount = truncatedHTML.split('<!-- Input Fields Found (')[1]?.split(' fields)')[0] || 'unknown';
            this.logAction(`🔍 DEBUG: Found ${inputFieldsCount} input fields`);
            this.logAction(`🔍 DEBUG: HTML preview (first 1000 chars): ${truncatedHTML.substring(0, 1000)}...`);
            this.logAction(`🔍 SIMPLIFIED: Now detecting only actual input fields (text, email, textarea, select)`);
            
            // Debug: Show what specific input fields were found
            const inputMatches = truncatedHTML.match(/<input[^>]*>/g) || [];
            const textareaMatches = truncatedHTML.match(/<textarea[^>]*>/g) || [];
            const selectMatches = truncatedHTML.match(/<select[^>]*>/g) || [];
            
            this.logAction(`🔍 DEBUG: Found ${inputMatches.length} input elements, ${textareaMatches.length} textareas, ${selectMatches.length} selects`);
            
            // Show first few input fields for debugging
            if (inputMatches.length > 0) {
                this.logAction(`🔍 DEBUG: First few inputs: ${inputMatches.slice(0, 3).join(', ')}`);
            }
            
            // Check for specific fields mentioned by user
            const hasWebsite = truncatedHTML.toLowerCase().includes('website');
            const hasLinkedIn = truncatedHTML.toLowerCase().includes('linkedin');
            const hasLocation = truncatedHTML.toLowerCase().includes('location');
            const hasPython = truncatedHTML.toLowerCase().includes('python');
            const hasDeployment = truncatedHTML.toLowerCase().includes('deployment');
            
            this.logAction(`🔍 DEBUG: Field detection - Website: ${hasWebsite}, LinkedIn: ${hasLinkedIn}, Location: ${hasLocation}, Python: ${hasPython}, Deployment: ${hasDeployment}`);
            
            // Debug: Check for question-like content
            const questionCount = (truncatedHTML.match(/\?/g) || []).length;
            const canYouCount = (truncatedHTML.match(/Can you/gi) || []).length;
            const howDoYouCount = (truncatedHTML.match(/How do you/gi) || []).length;
            this.logAction(`🔍 DEBUG: Found ${questionCount} question marks, ${canYouCount} "Can you" phrases, ${howDoYouCount} "How do you" phrases`);

            // Extract only text content from CV HTML to reduce context length
            const cvTextContent = this.extractTextFromHTML(this.uploadedTemplates.cv.content);
            this.logAction(`📄 CV text extracted: ${cvTextContent.length} characters (reduced from ${this.uploadedTemplates.cv.content.length})`);
            
            // Debug: Log the actual CV text content being sent to LLM
            this.logAction(`📄 CV TEXT CONTENT SENT TO LLM:`);
            this.logAction(`📄 ${cvTextContent}`);

            // Single LLM call to analyze form and get all field mappings
            const formAnalysisPrompt = `You are an AI assistant that analyzes web application forms and extracts information from CVs to fill them automatically.

CURRENT WEBPAGE HTML (truncated to focus on forms):
${truncatedHTML}

CV TEXT CONTENT (extracted from HTML):
${cvTextContent}

ANALYZE THE CV CONTENT ABOVE STEP BY STEP:
1. Read the CV content line by line
2. Identify any phone numbers (sequences of 10+ digits) - ONLY if they are clearly visible
3. Identify any email addresses (text with @ symbol) - ONLY if they are clearly visible
4. Identify any addresses (street names, building names, locations) - ONLY if they are clearly visible
5. Identify any cities, states, countries mentioned - ONLY if they are clearly visible
6. Extract the EXACT text for each piece of contact information found
7. If you are not 100% certain about any information, DO NOT include it in your response

TASK: Analyze the webpage HTML to identify all form fields and provide the exact values to fill them based on the CV content.

CRITICAL ANTI-HALLUCINATION RULE: You MUST NOT create, invent, make up, or hallucinate ANY information that is not explicitly present in the CV content provided above. Only use information that is clearly visible in the CV text. If information is not found in the CV, do not include that field in your response.

IMPORTANT DISTINCTION:
- For CONTACT FIELDS (phone, address, city, state, country, postal code): Only fill if the exact information is clearly visible in the CV
- For QUESTION FIELDS (textareas asking about experience, projects, skills): Fill with relevant information from your CV that answers the question
- For URL FIELDS (website, LinkedIn, GitHub): Only fill if the exact URL is present in the CV

STOP! DO NOT FILL CONTACT FIELDS WITH FAKE DATA! But DO fill question fields with relevant CV information.

INSTRUCTIONS:
1. CAREFULLY analyze the HTML to identify ALL form fields, including:
   - Standard input fields (text, email, phone, etc.)
   - Select dropdowns and radio buttons
   - Textarea fields
   - File upload fields
   - Hidden fields that might be relevant
2. Look for fields even if they don't have obvious form classes - many job application forms use custom styling
3. For each field found, determine what information should be filled based on the CV
4. DEEP DIVE into the CV content - thoroughly analyze every section to extract contact information
5. Be thorough - include fields that might be styled differently or use non-standard HTML structures
6. Return a JSON object with field mappings for ALL fields you can identify
7. DO NOT fill fields with made-up information - omit fields if the information is not in the CV

CRITICAL: DEEP ANALYSIS REQUIRED - Before responding, you MUST:
- Read through the ENTIRE CV content multiple times
- Look for contact information in headers, footers, and throughout the document
- Extract phone numbers, email addresses, addresses, cities, states, countries from ANYWHERE in the CV
- Parse address components carefully (street, city, state/province, postal code, country)
- Don't just skim - do a thorough line-by-line analysis of the CV content
- If you find contact info, use the EXACT values, not placeholder text like "Extract from CV"

MANDATORY CONTACT EXTRACTION - YOU MUST FIND AND EXTRACT:
1. PHONE NUMBER: Look for ANY sequence of digits that could be a phone number (10+ digits, with or without formatting)
2. EMAIL ADDRESS: Look for ANY text containing @ symbol followed by domain
3. ADDRESS: Look for ANY street address, building name, or location information
4. CITY: Look for city names in addresses or contact sections
5. STATE/PROVINCE: Look for state names, province names, or 2-letter codes
6. COUNTRY: Look for country names anywhere in the CV
7. POSTAL CODE: Look for ZIP codes, postal codes, or similar patterns

CONTACT EXTRACTION RULES:
- If you see digits like "1234567890" or "(123) 456-7890" or "+1-234-567-8900" → Extract as phone
- If you see text like "user@email.com" → Extract as email  
- If you see text like "123 Main Street" or "Building Name" → Extract as address
- If you see city names like "San Francisco", "New York", "London" → Extract as city
- If you see state names like "California", "NY", "Ontario" → Extract as state
- If you see country names like "USA", "Canada", "United Kingdom" → Extract as country

IMPORTANT: Only extract contact information that is ACTUALLY PRESENT in the CV content above. Do not make up or hallucinate phone numbers, addresses, or other contact details. If you cannot find specific information in the CV, do not include that field in your response.

SPECIFIC CONTACT INFO PATTERNS TO LOOK FOR:
- Phone: Look for patterns like +1234567890, (123) 456-7890, 123-456-7890, 123.456.7890
- Email: Look for patterns like user@domain.com, user.name@company.co.uk
- Address: Look for street numbers, street names, apartment numbers, building names
- City: Look for city names after addresses or in contact sections
- State/Province: Look for state names, province names, or abbreviations (CA, NY, ON, BC)
- Country: Look for country names or codes (USA, United States, Canada, UK, India)
- Postal Code: Look for ZIP codes (12345), postal codes (A1B 2C3), or similar patterns

ANALYSIS STEPS:
1. First pass: Scan for obvious contact sections (header, footer, contact info)
2. Second pass: Look for contact details embedded in other sections
3. Third pass: Extract and parse any addresses found
4. Fourth pass: Verify all extracted information is complete and accurate

IMPORTANT: NEVER use placeholder text like "Extract from CV" or "Not found" in your response. If you cannot find specific information after thorough analysis, leave that field out of the response entirely rather than using placeholder text.

FINAL WARNING: Only extract contact information that is ACTUALLY PRESENT in the CV content above. Do not hallucinate or make up phone numbers, addresses, or other contact details. If the information is not clearly visible in the CV text, omit that field entirely.

ABSOLUTE RULE: NEVER CREATE OR INVENT INFORMATION. Only use what is explicitly written in the CV content provided above. If you cannot find specific information in the CV, do not include that field in your response.

EXAMPLES OF WHAT NOT TO DO FOR CONTACT FIELDS:
- DO NOT use "1234567890" as a phone number unless it's actually in the CV
- DO NOT use "123 Main Street" as an address unless it's actually in the CV  
- DO NOT use "London" as a city unless it's actually in the CV
- DO NOT use "England" as a state unless it's actually in the CV
- DO NOT use "12345" as a postal code unless it's actually in the CV
- DO NOT use "United Kingdom" as a country unless it's actually in the CV
- DO NOT use "dd/mm/yyyy" as a date unless it's actually in the CV

EXAMPLES OF WHAT TO DO FOR QUESTION FIELDS:
- For "Can you provide examples of projects...": Use relevant project information from your CV
- For "How do you ensure quality...": Use relevant experience from your CV
- For "Can you discuss a time when...": Use relevant experience from your CV
- For "Can you describe a time when...": Use relevant experience from your CV

If you cannot find the exact contact information in the CV, OMIT that contact field entirely. But DO fill question fields with relevant CV information.

CRITICAL LINK EXTRACTION REQUIREMENTS:
- When filling Website, GitHub, LinkedIn, Portfolio, or any URL fields, look for embedded links in the CV
- Extract the actual href URLs from <a> tags in the CV content
- Use the complete URL (including https://) from the CV links
- For GitHub fields, look for GitHub.com links in the CV
- For LinkedIn fields, look for linkedin.com links in the CV
- For Website/Portfolio fields, look for personal website links in the CV
- If multiple relevant links exist, choose the most appropriate one for the field type

CRITICAL: Be comprehensive in your field detection. Look beyond obvious form elements and include fields that might be styled differently or use custom HTML structures. Job application forms often have non-standard implementations.

OUTPUT FORMAT (JSON only):
{
  "formFields": [
    {
      "selector": "input[name='first_name']",
      "type": "text",
      "value": "John",
      "fieldName": "First Name",
      "confidence": 0.95
    },
    {
      "selector": "input[name='email']",
      "type": "email", 
      "value": "john.doe@email.com",
      "fieldName": "Email",
      "confidence": 0.98
    },
    {
      "selector": "input[name='website']",
      "type": "url",
      "value": "https://johndoe.dev",
      "fieldName": "Website",
      "confidence": 0.95
    },
    {
      "selector": "input[name='github']",
      "type": "url",
      "value": "https://github.com/johndoe",
      "fieldName": "GitHub Profile",
      "confidence": 0.95
    },
    {
      "selector": "input[name='linkedin']",
      "type": "url",
      "value": "https://linkedin.com/in/johndoe",
      "fieldName": "LinkedIn Profile",
      "confidence": 0.95
    },
    {
      "selector": "textarea[name='ai_projects']",
      "type": "textarea",
      "value": "In my role as Software Engineer at Company XYZ, I designed and deployed a generative AI application for automated content generation. The project involved implementing transformer-based models using PyTorch and deploying them on AWS with Docker containers. I collaborated with the product team to integrate the AI system into our existing platform, resulting in a 40% reduction in content creation time and improved user engagement by 25%. The application processed over 10,000 requests daily with 99.5% uptime.",
      "fieldName": "AI Projects Question",
      "confidence": 0.90
    }
  ],
  "summary": {
    "totalFields": 10,
    "filledFields": 8,
    "unfilledFields": 2,
    "confidence": 0.85
  }
}

FIELD MAPPING RULES:
- First Name: Extract from CV header/name section
- Last Name: Extract from CV header/name section  
- Email: Look for email addresses in CV
- Phone: Look for phone numbers in CV
- Address: Extract from contact information
- Current Company: From work experience (most recent)
- Current Position: From work experience (most recent)
- Years of Experience: Calculate from work experience dates
- Education: From education section
- Skills: From skills section
- LinkedIn: Look for LinkedIn profile URLs
- Portfolio/Website: Look for personal websites
- Cover Letter: Use job description if available
- Resume Upload: Skip (handled separately)
- Salary Expectations: Skip (too personal)
- Availability: Skip (too specific)

LONG-FORM QUESTION HANDLING:
For textarea fields with detailed questions (like "Can you provide examples of project(s) where you designed, developed and deployed a generative AI application into production?"), generate comprehensive answers based on CV content:

1. PROJECT-BASED QUESTIONS:
   - Extract relevant projects from work experience
   - Highlight technologies, methodologies, and outcomes
   - Provide specific examples with measurable results
   - Use STAR method (Situation, Task, Action, Result)

2. TECHNICAL QUESTIONS:
   - Reference specific technologies and tools from CV
   - Explain approaches and methodologies used
   - Include performance metrics and improvements
   - Show depth of technical knowledge

3. LEADERSHIP/COLLABORATION QUESTIONS:
   - Extract leadership experiences from CV
   - Highlight cross-functional collaboration
   - Show problem-solving and initiative
   - Include team management and mentoring

4. RESEARCH/PROBLEM-SOLVING QUESTIONS:
   - Reference research projects and methodologies
   - Show analytical thinking and approach
   - Highlight resources used and outcomes
   - Demonstrate independent problem-solving

ANSWER GENERATION GUIDELINES:
- Keep answers concise but comprehensive (2-3 paragraphs)
- Use specific examples from CV
- Include measurable results and outcomes
- Maintain professional tone
- Focus on relevance to the question
- Avoid generic responses

IMPORTANT:
- Only return valid JSON
- Use exact CSS selectors that can be used with document.querySelector()
- Extract information accurately from CV
- Set confidence score (0-1) for each field
- If information is not available in CV, set value to null
- Focus on common application form fields
- ONLY include fields that actually exist in the provided HTML
- Do not create selectors for fields that don't exist
- Look for actual input, textarea, and select elements in the HTML

FIELD DETECTION PRIORITY:
1. Look for <input> elements with name, id, or class attributes
2. Look for <textarea> elements with name, id, or class attributes  
3. Look for <select> elements with name, id, or class attributes
4. Check for labels associated with form fields
5. Look for form containers and field groups

Return only the JSON object, no additional text.`;

            this.logAction('🤖 Analyzing form fields with AI...');
            
            // Create settings with increased max_tokens for long-form answers
            const formAnalysisSettings = {
                ...settings,
                maxTokens: '3000' // Reduced to stay within context limits
            };
            
            const formAnalysis = await this.callAI(formAnalysisPrompt, 'gpt-3.5-turbo-16k', settings.openaiKey, formAnalysisSettings);
            
            this.logAction('📊 Form analysis completed');
            console.log('Form analysis result:', formAnalysis);

            // Parse the JSON response
            let fieldMappings;
            try {
                // Extract JSON from response (in case there's extra text)
                const jsonMatch = formAnalysis.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    fieldMappings = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                this.logAction('❌ Failed to parse form analysis JSON');
                console.error('JSON parse error:', parseError);
                this.showToast('Failed to analyze form structure', 'error');
                return;
            }

            // Fill the form fields
            this.logAction(`📝 Filling ${fieldMappings.formFields.length} form fields...`);
            
            const fillResults = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: (mappings) => {
                    const results = {
                        filled: 0,
                        failed: 0,
                        details: []
                    };

                    mappings.formFields.forEach(field => {
                        try {
                            const element = document.querySelector(field.selector);
                            if (element && field.value) {
                                // Handle different input types
                                if (field.type === 'checkbox' || field.type === 'radio') {
                                    element.checked = true;
                                } else if (field.type === 'select') {
                                    element.value = field.value;
                                } else {
                                    element.value = field.value;
                                    // Trigger change event
                                    element.dispatchEvent(new Event('input', { bubbles: true }));
                                    element.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                                results.filled++;
                                results.details.push(`✅ ${field.fieldName}: ${field.value}`);
                            } else {
                                results.failed++;
                                results.details.push(`❌ ${field.fieldName}: Field not found or no value`);
                            }
                        } catch (error) {
                            results.failed++;
                            results.details.push(`❌ ${field.fieldName}: Error - ${error.message}`);
                        }
                    });

                    return results;
                },
                args: [fieldMappings]
            });

            const fillResult = fillResults[0].result;
            
            this.logAction(`✅ Form filling completed: ${fillResult.filled} filled, ${fillResult.failed} failed`);
            fillResult.details.forEach(detail => this.logAction(detail));
            
            if (fillResult.filled > 0) {
                this.showToast(`Successfully filled ${fillResult.filled} form fields!`, 'success');
            } else {
                this.showToast('No form fields could be filled', 'warning');
            }

        } catch (error) {
            this.logAction(`❌ Form filling failed: ${error.message}`);
            console.error('Form filling error:', error);
            this.showToast('Failed to fill application form', 'error');
        }
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
                try {
                    await this.callTool('generateCVDocument', { jobDescription });
                } catch (error) {
                    this.app.logAction(`❌ AI Agent: CV generation failed: ${error.message}`);
                    console.error('CV generation error:', error);
                }
            } else {
                this.app.logAction(`ℹ️ AI Agent: CV not required (requirements: "${requirements}")`);
            }
            
            if (requirements.includes('COVER_LETTER') || requirements.includes('BOTH')) {
                this.app.logAction('📄 AI Agent: Cover letter required, calling generateCoverLetterDocument()');
                try {
                    await this.callTool('generateCoverLetterDocument', { jobDescription });
                } catch (error) {
                    this.app.logAction(`❌ AI Agent: Cover letter generation failed: ${error.message}`);
                    console.error('Cover letter generation error:', error);
                }
            } else {
                this.app.logAction(`ℹ️ AI Agent: Cover letter not required (requirements: "${requirements}")`);
            }
            
            this.app.logAction('🎉 AI Agent: Workflow completed! Check logs above for any individual failures.');
            
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

1. PROFESSIONAL SUMMARY: 
   - Create a compelling, impressive summary that drives and impresses recruiters
   - Lead with your strongest, most relevant achievements and skills
   - Use powerful action verbs and quantifiable results
   - Make it impossible for recruiters to ignore your candidacy
   - Emphasize skills and experiences that directly match the job requirements

2. SKILLS SECTION: 
   - Reorder and rephrase skills to highlight those mentioned in the job description
   - Include ALL relevant skills from your experience that match job requirements
   - Aim for 90% coverage of job requirements through your existing skills
   - Group skills by relevance to the job (most relevant first)
   - Use exact keywords and phrases from the job description

3. WORK EXPERIENCE: For each job experience:
   - Rephrase job descriptions to emphasize relevant skills and achievements
   - Expand bullet points to provide detailed, comprehensive descriptions
   - MINIMUM TWO LINES: Each project/achievement must have at least 2 lines of detailed content
   - Avoid one-liners - provide substantial, meaningful descriptions
   - Use keywords from the job description where appropriate
   - Maintain the same level of detail and content volume
   - Highlight experiences that demonstrate required skills and competencies

4. PROJECTS: Rephrase project descriptions to emphasize relevant technologies and outcomes
   - MINIMUM TWO LINES: Each project must have at least 2 lines of detailed content
   - Include technical details, challenges overcome, and measurable results
   - Emphasize projects that showcase skills mentioned in the job description

5. EDUCATION: Keep as-is unless directly relevant to job requirements

OPTIMIZATION EXAMPLES:
- Original: "Developed web applications using various technologies"
- Optimized: "Developed scalable web applications using React, Node.js, and MongoDB, focusing on user experience and performance optimization"

DETAILED CONTENT REQUIREMENTS:
- Each project/achievement must have MINIMUM 2 lines of detailed content
- Include specific technologies, methodologies, and tools used
- Mention challenges overcome and solutions implemented
- Add measurable results and impact where possible
- Avoid generic one-liner descriptions
- Structure and length remain the same, but content is optimized for relevance

SKILLS COVERAGE REQUIREMENTS:
- Analyze the job description to identify ALL required skills and technologies
- Aim for 90% coverage of job requirements through your existing experience
- Include ALL relevant skills from your background that match job requirements
- If a required skill is completely new and not close to your experience, exclude it
- Prioritize skills that you have actual experience with
- Use exact keywords and phrases from the job description
- Group skills by relevance (most relevant to the job first)

PROFESSIONAL SUMMARY REQUIREMENTS:
- Create a compelling, impressive summary that drives and impresses recruiters
- Lead with your strongest, most relevant achievements and skills
- Use powerful action verbs and quantifiable results
- Make it impossible for recruiters to ignore your candidacy
- Keep it concise but impactful (2-3 sentences maximum)
- Focus on what makes you uniquely qualified for this specific role

OUTPUT REQUIREMENTS:
- Return the COMPLETE optimized HTML document
- Maintain approximately the same character count as input
- Include ALL original content, just rephrased and optimized
- No additional text or explanations
- No truncation or content removal

CRITICAL OUTPUT REQUIREMENTS:
- Return ONLY the complete optimized HTML document
- Do NOT include any analysis, explanations, or additional text
- Do NOT mention skills coverage analysis in the output
- The output should be a clean, professional CV ready for download`;

        this.app.logAction('🤖 Sending CV template and job description to OpenAI GPT-3.5-turbo-16k...');
        this.app.logAction(`📊 Settings being used: maxTokens=${this.settings.maxTokens}, temperature=${this.settings.temperature}`);
        console.log('📊 DEBUG: AIAgent settings:', this.settings);
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
        
        // Generate skills coverage analysis for UI display
        await this.generateSkillsCoverageAnalysis(params.jobDescription, this.app.uploadedTemplates.cv.content);
        
        // Use LLM output directly without post-processing
        this.app.logAction('✅ Using LLM output directly without post-processing');
        
        // Show download button with raw LLM output
        this.app.showDocumentDownloads({ cv: result });
        return result;
    }

    async generateSkillsCoverageAnalysis(jobDescription, cvContent) {
        this.app.logAction('🔍 Generating skills coverage analysis...');
        
        const analysisPrompt = `Analyze the skills coverage between the job description and CV content.

JOB DESCRIPTION:
${jobDescription}

CV CONTENT:
${cvContent}

Please provide a brief analysis in the following format:

SKILLS COVERAGE ANALYSIS:
✅ COVERED SKILLS (90% target achieved):
- [List skills from job requirements that are covered in the CV]

⚠️ EXCLUDED SKILLS (completely new/not close to experience):
- [List job requirements that were excluded because they're not close to the candidate's experience]

📊 COVERAGE SUMMARY:
- Total job requirements: [number]
- Successfully covered: [number] ([percentage]%)
- Excluded: [number] ([percentage]%)

Keep the analysis concise and focused on actionable insights.`;

        try {
            const analysis = await this.app.callAI(analysisPrompt, 'gpt-3.5-turbo-16k', this.apiKey, this.settings);
            this.app.logAction('📊 Skills Coverage Analysis:');
            this.app.logAction(analysis);
        } catch (error) {
            this.app.logAction('❌ Failed to generate skills coverage analysis');
            console.error('Skills coverage analysis error:', error);
        }
    }

    // Tool 5: Generate Cover Letter Document
    async generateCoverLetterDocument(params) {
        this.app.logAction('📄 Tool: Generating personalized cover letter document...');
        
        if (!this.app.uploadedTemplates.coverLetter) {
            this.app.logAction('❌ Tool Error: Cover letter template not found');
            throw new Error('Cover letter template required! Please upload your cover letter template first.');
        }

        // Clean the cover letter template by removing base64 images that cause PDF issues
        let cleanedTemplate = this.app.uploadedTemplates.coverLetter.content;
        
        // Remove base64 images that cause PDF generation issues
        if (cleanedTemplate.includes('data:image') || cleanedTemplate.includes('base64')) {
            this.app.logAction('📄 Removing base64 images from cover letter template to fix PDF generation...');
            cleanedTemplate = cleanedTemplate.replace(/<img[^>]*src="data:image[^"]*"[^>]*>/gi, '');
            cleanedTemplate = cleanedTemplate.replace(/background-image:\s*url\(data:image[^)]*\)/gi, '');
            this.app.logAction(`📄 Template cleaned: ${this.app.uploadedTemplates.coverLetter.content.length} → ${cleanedTemplate.length} characters`);
        }
        
        // Log cover letter content being sent to LLM
        this.app.logAction(`📄 Cover Letter Template Content (${this.app.uploadedTemplates.coverLetter.name}):`);
        this.app.logAction(`📄 ${cleanedTemplate.substring(0, 200)}${cleanedTemplate.length > 200 ? '...' : ''}`);
        this.app.logAction(`📄 Cover Letter Template Length: ${cleanedTemplate.length} characters`);

        const prompt = `You are a professional resume writer. Your task is to create a personalized cover letter using the provided template and job description while maintaining the EXACT same structure and factual accuracy.

CONTEXT - COVER LETTER TEMPLATE:
${cleanedTemplate}

REFERENCE - JOB DESCRIPTION:
${params.jobDescription}

CRITICAL REQUIREMENTS:
1. OUTPUT LENGTH: Your output should be approximately the same length as the input template (${cleanedTemplate.length} characters)
2. EXACT STRUCTURE: Keep the EXACT same HTML structure, CSS classes, and formatting
3. FACTUAL ACCURACY: NEVER add, remove, or modify any factual information (personal details, contact info, etc.)
4. NO HALLUCINATION: NEVER invent any work experience, projects, skills, or accomplishments

COVER LETTER CONTENT GENERATION:
If the template only contains contact information or headers, CREATE A COMPLETE COVER LETTER by:

1. INTRODUCTION: Express interest in the position and mention how you learned about it
2. BODY PARAGRAPH 1: Highlight relevant experience and skills that match job requirements
3. BODY PARAGRAPH 2: Provide specific examples of achievements or projects
4. BODY PARAGRAPH 3: Show enthusiasm for the company/role and what you can contribute
5. CLOSING: Professional closing with call to action

CONTENT OPTIMIZATION:
- Use keywords and phrases from the job description where appropriate
- Adjust language and emphasis to better align with the job description
- Maintain professional tone and language
- Keep the letter concise but impactful (2-3 paragraphs minimum)

OUTPUT REQUIREMENTS:
- Return the COMPLETE optimized HTML document
- Maintain approximately the same character count as input
- Include ALL original content, just rephrased and optimized
- No additional text or explanations
- No truncation or content removal

CRITICAL OUTPUT REQUIREMENTS:
- Return ONLY the complete optimized HTML document
- Do NOT include any analysis, explanations, or additional text
- The output should be a clean, professional cover letter ready for download`;

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
        
        // Use LLM output directly without post-processing (same as CV)
        this.app.logAction('✅ Using LLM output directly without post-processing');
        
        // Show download button with raw LLM output (same as CV)
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