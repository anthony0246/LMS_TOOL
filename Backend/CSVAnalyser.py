import csv
import pandas as pd
import os

'''
Class for analysing CSV exported Canvas courses
with Ally suggestions

#iterating through the rows
for row in csv_reader:
    current_row = row
    #do stuff
'''
class CSVAnalyser():
    def __init__(self, associated_file="") -> None:
        self.associated_file = associated_file
        self.accessibility_criteria = []
        self.analysis_content = {}
        self.priority_content = {}
        
        #generate the list of the elements not part of the accessibility rating
        list_of_non_fields = ["Id", "Name", "Mime type", "Score", "Deleted at", "Library reference", "Url", "Checked on"]
        first_row = ""

        self.list_of_non_fields = list_of_non_fields

        #open the csv file
        try:
            with open("Backend/" + self.associated_file, encoding='utf-8') as file:
                csv_reader = csv.reader(file, delimiter="\n")
                first_row = next(csv_reader)
        #if an Exception occured, there needs to be a call to try_to_read_csv which handle it appropriately
        except FileNotFoundError:
            return self.try_to_read_csv(False)
        except Exception:
            return self.try_to_read_csv(True)

        #generate a list of the individual element of the first row
        list_first_row = first_row[0].split(",")

        #iterate through the fields specified on the first row of the CSV export
        for i in range(len(list_first_row)):
            #if an accessibility criteria is found, set it's corresponding value
            if list_first_row[i] not in list_of_non_fields:
                self.accessibility_criteria.append(list_first_row[i])

    #allows us to change the file associate with the CSVAnalyzer if neccessary
    def change_associated_file(self, new_file) -> None:
        self.associated_file = new_file

    #error handling for unexpected behaviour when opening the CSV file provided
    def try_to_read_csv(self, constructor_worked) -> Exception:
        if (not constructor_worked):
            return Exception("Error: could not find csv file.")

        try:
           # Attempt to read the CSV file
            file_reader = pd.read_csv(self.associated_file)
            return file_reader
    
        except pd.errors.EmptyDataError:
            # Handle the case where the file is empty
            return "Error: CSV file is empty"
        
        except pd.errors.ParserError:
            # Handle parsing errors if the file is not in CSV format
            return "Error: File given is not a CSV file"
        
        except Exception as e:
            # Catch any other unexpected errors
            return "Error: Unexpected error occurred"
        
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
        with open("Backend/" + self.associated_file, encoding='utf-8') as file:
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

                count1 = 0 #init two counts to decide when to switch between accessibility and non-accessibility criteria
                count2 = 0

                #account for a comma inside "Name" field of component
                if (":" in id):
                    first_half = row[1]
                    second_half = row[2]

                    if (first_half[0] == '"' and second_half[-1] == '"'):
                        combined = first_half + second_half
                        row.pop(2)
                        row.pop(2)
                        row.insert(2, combined)

                #generate the dictionary of components
                for i in range(len(row)):
                    if i >= 0 and i < len(self.list_of_non_fields):
                        dict_of_course_components[id][self.list_of_non_fields[count1]] = row[i]
                        count1 += 1
                    else:
                        dict_of_course_components[id][self.accessibility_criteria[count2]] = row[i]
                        count2 += 1

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

csv_analyzer = CSVAnalyser('canvas_export_1.csv')
csv_analyzer.generate_components()
csv_analyzer.priority_components(0.24)