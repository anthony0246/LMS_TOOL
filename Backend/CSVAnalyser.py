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
        
        #generate the list of the elements not part of the accessibility rating
        list_of_non_fields = ["Id", "Name", "Mime type", "Score", "Deleted at", "Library reference", "Url", "Checked on"]
        first_row = ""

        self.list_of_non_fields = list_of_non_fields

        #open the csv file
        try:
            with open("Backend/" + self.associated_file, encoding='utf-8') as file:
                csv_reader = csv.reader(file, delimiter="\n")
                first_row = next(csv_reader)
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
        

    #analysis algorithm that will evaluate every component of the CSV file
    def run_analysis(self):
        file_reader = self.try_to_read_csv()
        if (type(file_reader) == str):
            return file_reader
        else:
            if file_reader != None:
                for index, row in file_reader.iterrows(): #needs to change
                    #Skip the first row (because it 
                    #displays the fields and not course components)
                    '''
                    Go through the component and try to identify what is it,
                    then give it's respective fields accessibility values
                    '''

csv_analyzer = CSVAnalyser('canvas_export_1.csv')