import pypyodbc as odbc

def get_connection():
    """
    Creates and returns a database connection object.
    """
    DRIVER_NAME = 'SQL Server'
    SERVER_NAME = 'DESKTOP-RTQKU4O'
    DATABASE_NAME = 'StaffDB'

    # Create the connection string
    connection_string = f"""
        DRIVER={{{DRIVER_NAME}}};
        SERVER={SERVER_NAME};
        DATABASE={DATABASE_NAME};
        Trust_Connection=yes;
    """

    # Establish the connection
    try:
        connection = odbc.connect(connection_string)
        print("Connection successful.")
        return connection
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None


class DBHelper:
    def __init__(self):
        self.conn = get_connection()
        self.cursor = self.conn.cursor()

    def get_all_staff(self):
        self.cursor.execute("SELECT * FROM StaffInformation")
        staff_data = self.cursor.fetchall()
        staff_list = []
        for row in staff_data:
            staff = {
                'id': row[3],  # EmployeeID
                'name': row[0],  # FullName
                'birthdate': row[1],  # Birthdate
                'sin': row[2],  # SocialInsuranceNumber
                'phone_number': row[4],  # PhoneNumber
                'address': row[5],  # Address
                'city': row[6],  # City
                'postal_code': row[7], # PostalCode
                'latitude': row[8],  # Latitude
                'longitude': row[9]  # Longitude
            }
            staff_list.append(staff)
        return staff_list

    def add_staff(self, full_name, birthdate, sin, employee_id, phone_number, address, city, postal_code, latitude, longitude):
        sql = "INSERT INTO StaffInformation (FullName, Birthdate, SocialInsuranceNumber, EmployeeID, PhoneNumber, Address, City, PostalCode, Latitude, Longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        val = (full_name, birthdate, sin, employee_id, phone_number, address, city, postal_code, latitude, longitude)
        self.cursor.execute(sql, val)
        self.conn.commit()

    def delete_staff(self, employee_id):
        sql = "DELETE FROM StaffInformation WHERE EmployeeID = ?"
        val = (employee_id,)
        self.cursor.execute(sql, val)
        self.conn.commit()




    def update_staff(self, employee_id, full_name, birthdate, social_insurance_number, phone_number, address, city, postal_code, latitude, longitude):
        try:
            sql = "UPDATE StaffInformation SET FullName = ?, Birthdate = ?, SocialInsuranceNumber = ?, PhoneNumber = ?, Address = ?, City = ?, PostalCode = ?, Latitude = ?, Longitude = ? WHERE EmployeeID = ?"
            val = (full_name, birthdate, social_insurance_number, phone_number, address, city, postal_code, latitude, longitude, employee_id)
            self.cursor.execute(sql, val)
            self.conn.commit()
        except Exception as e:
            # Log the error
            print(f"Error updating staff: {e}")




    def get_staff_by_city(self, city):
        sql = "SELECT * FROM StaffInformation WHERE City = ?"
        val = (city,)
        self.cursor.execute(sql, val)
        staff_data = self.cursor.fetchall()
        staff_list = []
        for row in staff_data:
            staff = {
                'id': row[3],  # EmployeeID
                'name': row[0],  # FullName
                'birthdate': row[1],  # Birthdate
                'sin': row[2],  # SocialInsuranceNumber
                'phone_number': row[4],  # PhoneNumber
                'address': row[5],  # Address
                'city': row[6],  # City
                'postal_code': row[7],  # PostalCode
                'latitude': row[8],  # Latitude
                'longitude': row[9]  # Longitude
            }
            staff_list.append(staff)
        return staff_list


    def get_staff_by_id(self, employee_id):
        sql = "SELECT * FROM StaffInformation WHERE EmployeeID = ?"
        val = (employee_id,)
        self.cursor.execute(sql, val)
        staff_data = self.cursor.fetchall()
        staff_list = []
        for row in staff_data:
            staff = {
                'id': row[3],  # EmployeeID
                'name': row[0],  # FullName
                'birthdate': row[1],  # Birthdate
                'sin': row[2],  # SocialInsuranceNumber
                'phone_number': row[4],  # PhoneNumber
                'address': row[5],  # Address
                'city': row[6],  # City
                'postal_code': row[7],  # PostalCode
                'latitude': row[8],  # Latitude
                'longitude': row[9]  # Longitude
            }
            staff_list.append(staff)
        return staff_list 