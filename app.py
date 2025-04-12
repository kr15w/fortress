from flask import Flask, render_template
import mysql.connector

connection = mysql.connector.connect(host="localhost",
                                     port='3306',
                                     database='Fortress',
                                     user='root',
                                     password='',
                                     autocommit=True)
cursor = connection.cursor()

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/users")
def users():
    cursor.execute("SELECT * FROM `Account Information`")
    values = cursor.fetchall()
    return render_template("users.html", data=values, name='Users')

@app.route("/license")
def license():
    cursor.execute("SELECT * FROM `License Key`")
    values = cursor.fetchall()
    return render_template("license.html", data=values, name='License')

if __name__ == "__main__":
    app.run(debug=True)
