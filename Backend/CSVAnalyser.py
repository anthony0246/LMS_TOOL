'''
Class for analysing CSV exported Canvas courses
with Ally suggestions
'''
class CSVAnalyser():
    def __init__(self, associated_file="", criteria_for_analysis={}):
        self.associated_file = associated_file
        self.criteria_for_analysis = criteria_for_analysis

    def change_associated_file(self, new_file):
        self.associated_file = new_file

    def run_analysis(self):
        pass
