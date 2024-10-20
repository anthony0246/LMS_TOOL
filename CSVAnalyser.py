import csv
import os
import copy
import time

'''
Class for analysing CSV exported Canvas courses
with Ally suggestions

#iterating through the rows
for row in csv_reader:
    current_row = row
    #do stuff
'''
class CSVAnalyser():

    description_of_analyzed_fields = {
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
    }

    def __init__(self, associated_file="") -> None:
        self.associated_file = associated_file
        self.accessibility_criteria = []
        self.analysis_content = {}
        self.priority_content = {}
        self.priority_accessibility_errors = {}
        
        #generate the list of the elements not part of the accessibility rating
        list_of_non_fields = ["Id", "Name", "Mime type", "Score", "Deleted at", "Library reference", "Url", "Checked on"]
        first_row = ""

        self.list_of_non_fields = list_of_non_fields

        #try to open the csv file
        try:
            self.csv_is_empty()
            with open(self.associated_file, encoding='utf-8') as file:
                csv_reader = csv.reader(file, delimiter="\n")
                first_row = next(csv_reader)
        #if an Exception occured, there needs to be a call to try_to_read_csv which handle it appropriately
        except FileNotFoundError:
            return "Error 404: CSV file could not be found"
        except Exception:
            return "Error 403: CSV file is empty."

        #generate a list of the individual element of the first row
        list_first_row = first_row[0].split(",")

        #iterate through the fields specified on the first row of the CSV export
        for i in range(len(list_first_row)):
            #if an accessibility criteria is found, set it's corresponding value
            if list_first_row[i] not in list_of_non_fields:
                self.accessibility_criteria.append(list_first_row[i])
        
        self.row_structure = self.list_of_non_fields + self.accessibility_criteria

    #allows us to change the file associate with the CSVAnalyzer if neccessary
    def change_associated_file(self, new_file) -> None:
        self.associated_file = new_file

    #error handling for unexpected behaviour when opening the CSV file provided
    def csv_is_empty(self) -> Exception:
        with open(self.associated_file, 'r') as file_obj:
            first_char = file_obj.read(1)
        
        if not first_char:
            return Exception("Error: csv file is empty")
        
    #returns a list of 2 elements for current row being analyzed that looks like: [id, url] | to delete
        #id is array[0] and url is array[1]
    # def identify_id_and_url(self, current_row) -> list:
    #     id = current_row[0]

    #     for i in current_row:
    #         if "https" in i:
    #             return [id, i]
            
    #     return [id, ""]
    
    # def analysis_for_row_without_url(self, row) -> dict:
    #     dict_to_return = {}
    #     count = 0

    #     for i in row:
    #         if "0." in i:
    #             break
    #         else:
    #             dict_to_return[self.list_of_non_fields[count]] = i
    #             count += 1

    #     return dict_to_return
    
    #analysis algorithm that will evaluate every component of the CSV file
    def generate_components(self) -> None:
        dict_of_course_components = {}

        #open the appropriate file (this will always work since errors have already been handled, hopefully)
        with open(self.associated_file, encoding='utf-8') as file:
            csv_reader = csv.reader(file, delimiter="\n")
            next(csv_reader) #skip the first line, since that isn't a component

            #iterate through the rows
            for row in csv_reader:
                #split each row at every comma and generate a list
                row = row[0].split(",")
                #id_and_row = self.identify_id_and_url(row) | to delete

                id = row[0] #the id of the component is the first element in the row

                # if id_and_row[1] == "":
                #     dict_of_course_components[id] = self.analysis_for_row_without_url(row)
                # else:
                #     url = id_and_row[1]
                #     dict_of_course_components[id] = {
                #         "url": url,
                #     }

                dict_of_course_components[id] = {} #init a dictionary for the components

                #account for a comma inside "Name" field of component
                actual_title = ""
                while len(row) + 1 > len(self.list_of_non_fields) + len(self.accessibility_criteria):
                    actual_title += row.pop(1)

                if len(actual_title) != 0:
                    if (actual_title[0] == '"'):
                        actual_title = actual_title[1: ]
                    elif (actual_title[-1] == '"'):
                        actual_title = actual_title[ :-1]
                    row.insert(1, actual_title)

                #generate the dictionary of components
                for i in range(len(row)):
                    dict_of_course_components[id][self.row_structure[i]] = row[i]

        #assign the generated components to the appropriate field of the object
        self.analysis_content = dict_of_course_components   
        print(len(self.analysis_content))

    def priority_components(self, high_bound_for_priority_value) -> None:
        dict_of_priority_components = {}

        #for every component, check if its score is < high_bound...
            #if so add to dictionary, else don't
        for key in self.analysis_content.keys():
            if float(self.analysis_content[key]["Score"]) <= high_bound_for_priority_value:
                dict_of_priority_components[key] = self.analysis_content[key]

        #assign the priority components to the appropriate field of the object
        self.priority_content = dict_of_priority_components
        print(len(self.priority_content))

    def add_description_to_priority_components(self) -> None:
        for component_key in self.priority_content.keys():
            severe_issues = {}
            major_issues = {}
            minor_issues = {}
            for accessibility_key in CSVAnalyser.description_of_analyzed_fields.keys():
                if int(self.priority_content[component_key][accessibility_key]) >= 1:
                    if accessibility_key[-1] == "1":
                        severe_issues[accessibility_key] = CSVAnalyser.description_of_analyzed_fields[accessibility_key]
                    elif accessibility_key[-1] == "2":
                        major_issues[accessibility_key] = CSVAnalyser.description_of_analyzed_fields[accessibility_key]
                    elif accessibility_key[-1] == "3":
                        minor_issues[accessibility_key] = CSVAnalyser.description_of_analyzed_fields[accessibility_key]
            
            self.priority_accessibility_errors[component_key] = {
                #might also want to include link here, but we will see if that's necessary
                "Url of Component": self.priority_content[component_key]["Url"],
                "severe issues": {},
                "major issues": {},
                "minor issues": {}
            }

            self.priority_accessibility_errors[component_key]["severe issues"] = severe_issues
            self.priority_accessibility_errors[component_key]["major issues"] = major_issues
            self.priority_accessibility_errors[component_key]["minor issues"] = minor_issues

    def process_csv(self) -> dict:
        self.generate_components()
        self.priority_components(1)
        self.add_description_to_priority_components()
        return self.priority_accessibility_errors

# csv_analyzer = CSVAnalyser()
# csv_analyzer.process_csv()
