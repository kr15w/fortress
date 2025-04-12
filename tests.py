import mysql.connector

connection = mysql.connector.connect(host="localhost",
                                               port='3306',
                                               database='Fortress',
                                               user='root',
                                               password='')
cursor = connection.cursor()

selectquery="select * from `Account Information`"
cursor.execute(selectquery)
records = cursor.fetchall()
print("Number of records: ", cursor.rowcount)

for record in records:
    print(record)

cursor.close()
connection.close()