Use Pets

Drop View If Exists dbo.vwCustomer
Drop View If Exists dbo.vwCareRequest
Drop Table If Exists dbo.CareTask
Drop Table If Exists dbo.CareVisit
Drop Table If Exists dbo.CareRequest
Drop Table If Exists dbo.CareProvider
Drop Table If Exists dbo.Pet
Drop Table If Exists dbo.Customer

Create Table dbo.Customer (
	ID Int Identity(1,1) Primary Key Not Null
	,Name VarChar(100) Null
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

Create Table dbo.CareProvider(
	ID Int Identity(1,1) Primary Key Not Null
	,Name VarChar(100) Not Null
)
Insert Into dbo.CareProvider Values ('Lucy')
Insert Into dbo.CareProvider Values ('James')
Insert Into dbo.CareProvider Values ('Parker')


Create Table dbo.CareVisit(
	ID Int Identity(1,1) Primary Key Not Null
	,CareRequestID Int Not Null
	,CareProviderID Int Not Null
	,VisitDate DateTime Not Null
)
Alter Table dbo.CareVisit Add Constraint FK_CareVisit_CareRequest Foreign Key(CareRequestID) References dbo.CareRequest(ID)
Alter Table dbo.CareVisit Add Constraint FK_CareVisit_CareProvider Foreign Key(CareProviderID) References dbo.CareProvider(ID)

Create Table dbo.CareTask(
	ID Int Identity(1,1) Primary Key Not Null
	,CareVisitID Int Not Null
	,Description VarChar(500) Not Null
	,IsComplete Bit Not Null Default 0
	,CompletedByCareProviderID Int Null
	,DateCompleted DateTime Null
)
Alter Table dbo.CareTask Add Constraint FK_CareTask_CareVisit Foreign Key(CareVisitID) References dbo.CareVisit(ID)
Alter Table dbo.CareTask Add Constraint FK_CareTask_CareProvider Foreign Key(CompletedByCareProviderID) References dbo.CareProvider(ID)

Go
Create View dbo.vwCareRequest
As
Select request.*, customer.Name As CustomerName 
From dbo.CareRequest request
Inner Join dbo.Customer customer On request.CustomerID = customer.ID
Go

Create View dbo.vwCustomer
As
Select customer.ID, customer.Name, customer.Address, customer.Email, STRING_AGG(pet.Name, ', ') WITHIN GROUP (ORDER BY pet.Name ASC) AS PetNames
From dbo.Customer customer
Inner Join dbo.Pet pet On customer.ID = pet.CustomerID
Group By customer.ID, customer.Name, customer.Address, customer.Email
Go