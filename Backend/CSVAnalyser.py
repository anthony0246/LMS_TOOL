import pandas as pd
'''
Class for analysing CSV exported Canvas courses
with Ally suggestions
'''
class CSVAnalyser():
    def __init__(self, associated_file=""):
        self.associated_file = associated_file
        self.issues = {}
        #todo
        '''
        Iterate through the first row of the CSV file and
        fill in all the analyzed fields for the export
        '''


    def change_associated_file(self, new_file):
        self.associated_file = new_file

    def try_to_read_csv(self):
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
            return "Error: Unexpected error occured"
        

    def run_analysis(self):
        file_reader = self.try_to_read_csv()
        if (type(file_reader) == str):
            return file_reader
        else:
            if file_reader != None:
                for index, row in file_reader.iterrows():
                    #Skip the first row (because it 
                    #displays the fields and not course components)
                    '''
                    Go through the component and try to identify what is it,
                    then give it's respective fields accessibility values
                    '''

