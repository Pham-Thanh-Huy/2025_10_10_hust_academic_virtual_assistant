import mysql.connector

def init_mysql_db(host, port, user, password, database):
    mydb = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database
    )

    return mydb