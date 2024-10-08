from flask import Flask, request, jsonify
from CSVAnalyser import CSVAnalyser


app = Flask(__name__)

csv_analyser = CSVAnalyser()


@app.route("/api/analyse", methods=["GET"])
def analyse_csv():
    result = csv_analyser.run_analysis()
    return jsonify({"analysis_result": result})





if __name__ == "__main__":
    app.run(debug=True)

