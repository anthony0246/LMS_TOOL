from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import os
from werkzeug.utils import secure_filename

from CSVAnalyser import CSVAnalyser

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return render_template('mainpage.html')

@app.route('/community')
def community():
    return render_template('community.html')

@app.route('/examples')
def examples():
    return render_template('examples.html')

@app.route('/docs')
def docs():
    return render_template('docs.html')

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/uploads', methods=['POST'])
def upload_file():
    print("here")
    # Check if the file is part of the request
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)

    file = request.files['file']

    # If no file is selected
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)

    # If the file is allowed (CSV), save it and process it
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Call the CSV processing function and get the result
        csv_analyser = CSVAnalyser(file_path)
        result = csv_analyser.process_csv()

        # Return the result as JSON or directly into the webpage
        return jsonify({'result': result})

    flash('Invalid file type, only CSVs are allowed')
    return redirect(request.url)

if __name__ == "__main__":
    app.run(debug=True)


# csv_analyser = CSVAnalyser()


# @app.route("/api/analyse", methods=["GET"])
# def analyse_csv():
#     result = csv_analyser.run_analysis()
#     return jsonify({"analysis_result": result})

# if __name__ == "__main__":
#     app.run(debug=True)

