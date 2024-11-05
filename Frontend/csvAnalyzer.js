class CSVAnalyzer {
    constructor(associatedFile = "") {
        this.associatedFile = associatedFile;
        this.accessibilityCriteria = [];
        this.analysisContent = {};
        this.priorityContent = {};
        this.priorityAccessibilityErrors = {};
        this.descriptionOfAnalyzedFields = {
            "AlternativeText:2": "Shows if the PDF, document, or presentation has at least one image without alternative text. This is a major issue.",
            "Contrast:2": "Total number of presentation, document, and PDF files that have contrast issues. This is a major issue.",
            "HeadingsHigherLevel:3": "Total number of PDFs. presentations, and documents that exceed the recommended H6 level of headings. This is a minor issue.",
            "HeadingsPresence:2": "Total number of PDFs, presentations, and documents that don’t have headings. This is a major issue.",
            "HeadingsSequential:3": "Total number of PDFs and documents that don’t have headings in a logical sequence. This is a minor issue.",
            "HeadingsStartAtOne:3": "Total number of PDFs and documents that don’t have an H1 heading as the first heading. This is a minor issue.",
            "HtmlBrokenLink:2": "Total number of pages that have broken links in a domain. This is a major issue.",
            "HtmlCaption:2": "Total number of HTML content and files that have YouTubeTM videos without captions. This is a major issue.",
            "HtmlColorContrast:2": "Total number of HTML and WYSIWYG content that have poor color contrast. This is a major issue.",
            "HtmlDefinitionList:3": "Total number of HTML content and files that are not properly defined. For example, every form element has a label and that p elements are not used to style headings. This is a minor issue.",
            "HtmlEmptyHeading:2": "Total number of HTML content and files that have empty headings. This is a major issue.",
            "HtmlEmptyTableHeader:2": "Total number of HTML tables that have empty headings. This is a major issue.",
            "HtmlHasLang:3": "Total number of HTML content and files that don’t have language presence identified. This is a minor issue.",
            "HtmlHeadingOrder:3": "Total number of HTML content and files that don’t have headings in a logical sequence. This is a minor issue.",
            "HtmlHeadingsPresence:2": "Total number of HTML content and files that don’t have headings. This is a major issue.",
            "HtmlHeadingsStart:2": "Total number of HTML content and files that don’t have the appropriate H heading as the first heading. This is a major issue.",        
            "HtmlImageAlt:2": "Total number of HTML content and files that have at least one image without alternative text. This is a major issue.",
            "HtmlImageRedundantAlt:3": "Total number of HTML content and files that have images with the same alternative text as other images. This is a minor issue.",
            "HtmlLabel:2": "Total number of HTML content and files that have form elements without labels. This is a major issue.",
            "HtmlLinkName:3": "Total number of HTML content and files that have links that are not descriptive. This is a minor issue.",
            "HtmlList:3": "Total number of HTML content and files that don’t have properly formed lists. This is a minor issue.",
            "HtmlObjectAlt:2": "Total number of HTML content and files that have object tags without alternative text. This is a major issue.",
            "HtmlTdHasHeader:2": "Total number of HTML content and files that have table columns without proper a proper header. This is a major issue.",
            "HtmlTitle:3": "Total number of HTML content and files that don’t have a title. This is a minor issue.",
            "ImageContrast:2": "Total number of images that have poor contrast. This is a major issue.",
            "ImageDecorative:2": "Total number of images that have not been marked as decorative. This is a major issue.",
            "ImageDescription:2": "Total number of images that don't have an alternative description. This is a major issue.",
            "ImageOcr:3": "Total number of images that images that contain text. This is a minor issue.",
            "ImageSeizure:1": "Total number of images that can cause seizures. This is a severe issue.",
            "LanguageCorrect:3": "Total number of items that have an incorrect language set. This is a minor issue.",
            "LanguagePresence:3": "Total number of items that don’t have a language specified. This is a minor issue.",
            "Ocred:2": "Total number of PDFs that are scanned and have been OCRed. This is a major issue.",
            "Parsable:1": "Total number of items that are malformed or corrupted and students may not be able to open. This is a severe issue.",
            "Scanned:1": "Total number of PDFs that are scanned but have not been OCRed. This is a severe issue.",
            "Security:1": "Total number of items that require a password. This is a severe issue.",
            "TableHeaders:2": "Total number of items that have tables without headers. This is a major issue.",
            "Tagged:2": "Total number of PDFs that are not tagged. This is a major issue.",
            "Title:3": "Total number of items without a title. This is a minor issue."
        };
    }

    async readCSVFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = () => reject("Error reading the file");
            reader.readAsText(file);
        });
    }

    async processCSV(file) {
        const csvContent = await this.readCSVFile(file);
        const rows = csvContent.split('\n');
        const firstRow = rows.shift();
        
        if (!firstRow) {
            throw new Error("Error 403: CSV file is empty.");
        }

        this.extractHeaders(firstRow);
        this.parseRows(rows);
        this.findPriorityComponents(1);
        this.addDescriptionToPriorityComponents();

        return this.priorityAccessibilityErrors;
    }

    extractHeaders(firstRow) {
        const headers = firstRow.split(",");
        console.log(headers)
        let listOfNonFields = [];
        let listOfAnalyzedFields = [];

        for(let i = 0; i < headers.length; i++) {
            let currentString = headers[i];
            currentString = currentString.replace('\r', '');

            if (headers[i] in this.descriptionOfAnalyzedFields) {
                this.accessibilityCriteria.push(headers[i]);
            }
            else {
                listOfNonFields.push(headers[i]);
            }
        }
        console.log(listOfNonFields);
        console.log(listOfAnalyzedFields);
        this.rowStructure = [...listOfNonFields, ...this.accessibilityCriteria];
    }

    parseRows(rows) {
        rows.forEach(rowText => {
            const row = rowText.split(",");
            const id = row[0];
            const componentData = {};

            let actualTitle = "";
            while (row.length + 1 > this.rowStructure.length) {
                actualTitle += row.splice(1, 1)[0];
            }

            if (actualTitle) {
                actualTitle = actualTitle.replace(/^"|"$/g, "");
                row.splice(1, 0, actualTitle);
            }

            row.forEach((value, index) => {
                componentData[this.rowStructure[index]] = value;
            });

            this.analysisContent[id] = componentData;
        });
    }

    findPriorityComponents(highBound) {
        Object.keys(this.analysisContent).forEach(key => {
            const component = this.analysisContent[key];
            if (parseFloat(component["Score"]) <= highBound) {
                this.priorityContent[key] = component;
            }
        });
    }

    addDescriptionToPriorityComponents() {
        Object.keys(this.priorityContent).forEach(componentKey => {
            const component = this.priorityContent[componentKey];
            const severeIssues = {};
            const majorIssues = {};
            const minorIssues = {};

            Object.keys(this.descriptionOfAnalyzedFields).forEach(accessibilityKey => {
                const value = component[accessibilityKey];
                if (value && parseInt(value) >= 1) {
                    const level = accessibilityKey.slice(-1);
                    const issue = this.descriptionOfAnalyzedFields[accessibilityKey];
                    if (level === "1") severeIssues[accessibilityKey] = issue;
                    if (level === "2") majorIssues[accessibilityKey] = issue;
                    if (level === "3") minorIssues[accessibilityKey] = issue;
                }
            });

            this.priorityAccessibilityErrors[componentKey] = {
                "Url of Component": component["Url"],
                "severe issues": severeIssues,
                "major issues": majorIssues,
                "minor issues": minorIssues
            };
        });
    }
}

// HTML part for handling file upload and processing
document.getElementById("csvFileInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("here!");
    const csvAnalyzer = new CSVAnalyzer();
    try {
        const result = await csvAnalyzer.processCSV(file);
        console.log(result);  // Output the result or display it on the webpage as needed
    } catch (error) {
        console.error(error);
    }
});
