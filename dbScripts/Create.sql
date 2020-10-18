Use Pets

Drop Table If Exists dbo.Pet
Drop Table If Exists dbo.Customer

Create Table dbo.Customer (
	ID SmallInt Identity(1,1) Primary Key Not Null
	,HouseholdName VarChar(100) Null
	,Address VarChar(100) Null
	,Email VarChar(100) Null
)

Create Table dbo.Pet(
	ID SmallInt Identity(1,1) Primary Key Not Null
	,CustomerID SmallInt Not Null
	,Name VarChar(100) Not Null
	,Description VarChar(500) Not Null
)
Alter Table dbo.Pet Add Constraint FK_Pet_Customer Foreign Key(CustomerID) References dbo.Customer(ID)
