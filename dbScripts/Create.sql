Use Pets

Drop View If Exists dbo.vwCustomer
Drop View If Exists dbo.vwCareRequest
Drop Table If Exists dbo.CareRequest
Drop Table If Exists dbo.Pet
Drop Table If Exists dbo.Customer

Create Table dbo.Customer (
	ID Int Identity(1,1) Primary Key Not Null
	,HouseholdName VarChar(100) Null
	,Address VarChar(100) Null
	,Email VarChar(100) Null
)

Create Table dbo.Pet(
	ID Int Identity(1,1) Primary Key Not Null
	,CustomerID Int Not Null
	,Name VarChar(100) Not Null
	,Description VarChar(500) Not Null
)
Alter Table dbo.Pet Add Constraint FK_Pet_Customer Foreign Key(CustomerID) References dbo.Customer(ID)

Create Table dbo.CareRequest(
	ID Int Identity(1,1) Primary Key Not Null
	,CustomerID Int Not Null
	,StartDate DateTime Not Null
	,EndDate DateTime Not Null
)
Alter Table dbo.CareRequest Add Constraint FK_CareRequest_Customer Foreign Key(CustomerID) References dbo.Customer(ID)

Go
Create View dbo.vwCareRequest
As
Select request.*, customer.HouseholdName 
From dbo.CareRequest request
Inner Join dbo.Customer customer On request.CustomerID = customer.ID
Go

Create View dbo.vwCustomer
As
Select customer.ID, customer.HouseholdName, customer.Address, customer.Email, STRING_AGG(pet.Name, ', ') WITHIN GROUP (ORDER BY pet.Name ASC) AS PetNames
From dbo.Customer customer
Inner Join dbo.Pet pet On customer.ID = pet.CustomerID
Group By customer.ID, customer.HouseholdName, customer.Address, customer.Email
Go