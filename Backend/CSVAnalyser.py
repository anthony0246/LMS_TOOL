import csv
import pandas as pd
'''
Class for analysing CSV exported Canvas courses
with Ally suggestions

#iterating through the rows
for row in csv_reader:
    current_row = row
    #do stuff

'''
class CSVAnalyser():
    def __init__(self, associated_file=""):
        self.associated_file = associated_file
        self.issues = []
        first_row = ""

        #open the csv file
        try:
            with open('canvas_export_1.csv', mode = 'r') as file:
                csv_reader = csv.read(file)
                first_row = next(csv_reader)
        except Exception:
            self.try_to_read_csv(False)

        #generate a list of the individual element of the first row
        list_first_row = first_row.split(",")

        #generate the list of the elements not part of the accessibility rating
        list_of_non_fields = ["name", "mime type", "score", "deleted at", "library reference", "url", "checked on"]

        #make the size of the issues list equal to the amount of accessibility criteria
        self.issues = [""] * (len(list_first_row) - len(list_of_non_fields))

        count = 0
        for i in range(len(list_first_row)):
            #if an accessibility criteria is found, set it's corresponding value
            if list_first_row[i] is not in list_of_non_fields:
                self.issues[count] = ""
                count += 1

    def change_associated_file(self, new_file):
        self.associated_file = new_file

    def try_to_read_csv(self, constructor_worked):
        if (not constructor_worked):
            return "Error: could not open csv file."

        try:
           # Attempt to read the CSV file
            file_reader = pd.read_csv(self.associated_file)
            return file_reader
        
        except FileNotFoundError:
            # Handle the case where the file does not exist
            return "Error: CSV file doesn't exist"
    
        except pd.errors.EmptyDataError:
            # Handle the case where the file is empty
            return "Error: CSV file is empty"
        
        except pd.errors.ParserError:
            # Handle parsing errors if the file is not in CSV format
            return "Error: File given is not a CSV file"
        
        except Exception as e:
            # Catch any other unexpected errors
            return "Error: Unexpected error occurred"
        

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

