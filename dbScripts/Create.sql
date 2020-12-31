Use PetsDB

Drop Function If Exists dbo.GetBusinessesForUserName
Drop View If Exists dbo.vwCareVisitTask
Drop View If Exists dbo.vwCareVisit
Drop View If Exists dbo.vwCareVisits
Drop View If Exists dbo.vwCareRequest

Drop Table If Exists dbo.CareVisitTask
Drop Table If Exists dbo.CareVisit
Drop Table If Exists dbo.CareRequest
Drop Table If Exists dbo.PetTask
Drop Table If Exists dbo.Pet
Drop Table If Exists dbo.PetType
Drop Table If Exists dbo.Customer
Drop Table If Exists dbo.BusinessPerson
Drop Table If Exists dbo.Business
Drop Table If Exists dbo.Person

Create Table dbo.Person (
	ID Int Identity(1,1) Primary Key Not Null
	,UserName VarChar(25) Not Null
	,Password Char(4) Not Null
	,FirstName VarChar(100) Not Null
	,LastName VarChar(100) Not Null	
)
Alter Table dbo.Person Add Constraint UNQ_Person_Name Unique (UserName)

Set Identity_Insert dbo.Person On
Insert Into dbo.Person (ID, UserName, Password, FirstName, LastName) Values (6, 'LucyR', '0628', 'Lucy', 'Rogers')
Insert Into dbo.Person (ID, UserName, Password, FirstName, LastName) Values (8, 'JamesR', '0821', 'James', 'Rogers')
Set Identity_Insert dbo.Person Off

Create Table dbo.Business (
	ID Int Identity(1,1) Primary Key Not Null
	,Name VarChar(25) Not Null UNIQUE
)
Set Identity_Insert dbo.Business On
Insert Into dbo.Business (ID, Name) Values (1, 'Lucy''s Pet Care')
Set Identity_Insert dbo.Business Off

Create Table dbo.BusinessPerson (
	BusinessID Int Not Null
	,PersonID Int Not Null
	,IsOwner Bit Not Null Default(0)
)
Alter Table dbo.BusinessPerson Add Constraint FK_BusinessPerson_Business Foreign Key(BusinessID) References dbo.Business(ID)
Alter Table dbo.BusinessPerson Add Constraint FK_BusinessPerson_Person Foreign Key(PersonID) References dbo.Person(ID)
Insert Into dbo.BusinessPerson Values (1, 6, 1) --Lucy
Insert Into dbo.BusinessPerson Values (1, 8, 0) --James

Create Table dbo.Customer (
	ID Int Identity(1,1) Primary Key Not Null
	,BusinessID Int Not Null
	,Name VarChar(100) Null
	,Address VarChar(100) Null
	,Email VarChar(100) Null
)
Alter Table dbo.Customer Add Constraint FK_Customer_Business Foreign Key(BusinessID) References dbo.Business(ID)

Create Table dbo.PetType(
	ID Int Identity(1,1) Primary Key Not Null
	,Name VarChar(100) Not Null
)
Insert Into dbo.PetType Values ('Dog')
Insert Into dbo.PetType Values ('Cat')
Insert Into dbo.PetType Values ('Rabbit')
Insert Into dbo.PetType Values ('Reptile')
Insert Into dbo.PetType Values ('Bird')
Insert Into dbo.PetType Values ('Hamster')
Insert Into dbo.PetType Values ('etc.')

Create Table dbo.Pet(
	ID Int Identity(1,1) Primary Key Not Null
	,CustomerID Int Not Null
	,TypeID Int Not Null
	,Name VarChar(100) Not Null
	,Description VarChar(500) Not Null
)
Alter Table dbo.Pet Add Constraint FK_Pet_Customer Foreign Key(CustomerID) References dbo.Customer(ID)
Alter Table dbo.Pet Add Constraint FK_Pet_PetType Foreign Key(TypeID) References dbo.PetType(ID)

Create Table dbo.PetTask(
	ID Int Identity(1,1) Primary Key Not Null
	,PetID Int Not Null
	,PreferredTime Time Not Null
	,Description VarChar(Max) Not Null
)
Alter Table dbo.PetTask Add Constraint FK_PetTask_Pet Foreign Key(PetID) References dbo.Pet(ID) On Delete Cascade

Create Table dbo.CareRequest(
	ID Int Identity(1,1) Primary Key Not Null
	,CustomerID Int Not Null
	,StartDate Date Not Null
	,EndDate Date Not Null
)
Alter Table dbo.CareRequest Add Constraint FK_CareRequest_Customer Foreign Key(CustomerID) References dbo.Customer(ID)

Create Table dbo.CareVisit(
	ID Int Identity(1,1) Primary Key Not Null
	,CareRequestID Int Not Null
	,CareProviderID Int Not Null
	,VisitDateTime DateTime Not Null
	,IsComplete Bit Not Null Default 0
	,CompletedByPersonID Int Null
	,DateCompleted DateTime Null
)
Alter Table dbo.CareVisit Add Constraint FK_CareVisit_CareRequest Foreign Key(CareRequestID) References dbo.CareRequest(ID) On Delete Cascade
Alter Table dbo.CareVisit Add Constraint FK_CareVisit_Person Foreign Key(CareProviderID) References dbo.Person(ID)

Create Table dbo.CareVisitTask(
	ID Int Identity(1,1) Primary Key Not Null
	,CareVisitID Int Not Null
	,PetID Int Not Null
	,Description VarChar(500) Not Null
	,IsComplete Bit Not Null Default 0
	,CompletedByPersonID Int Null
	,DateCompleted DateTime Null
)
Alter Table dbo.CareVisitTask Add Constraint FK_CareVisitTask_CareVisit Foreign Key(CareVisitID) References dbo.CareVisit(ID) On Delete Cascade
Alter Table dbo.CareVisitTask Add Constraint FK_CareVisitTask_Pet Foreign Key(PetID) References dbo.Pet(ID)

Go
Create View dbo.vwCareRequest
As
Select request.*, customer.Name As CustomerName 
From dbo.CareRequest request
Inner Join dbo.Customer customer On request.CustomerID = customer.ID
Go

Create Function dbo.GetBusinessesForUserName (@userName VarChar(25))
Returns Table As Return
--Find the business(es) associated with the Logged In User
	Select business.ID, business.Name
	From dbo.Person person
	Inner Join dbo.BusinessPerson businessPerson on person.ID = businessPerson.PersonID
	Inner Join dbo.Business business on businessPerson.BusinessID = business.ID
	Where person.UserName = @userName
Go

Drop Procedure If Exists dbo.GetCustomers
Go
Create Procedure dbo.GetCustomers (@userName VarChar(25))
As
Select customer.ID, customer.Name, customer.Address, customer.Email, STRING_AGG(pet.Name, ', ') WITHIN GROUP (ORDER BY pet.Name ASC) AS PetNames
From dbo.GetBusinessesForUserName(@userName) associatedBusiness
Inner Join dbo.Customer customer On associatedBusiness.ID = customer.BusinessID
Left Join dbo.Pet pet On customer.ID = pet.CustomerID
Group By customer.ID, customer.Name, customer.Address, customer.Email
Order By customer.Name
Go

Create View dbo.vwCareVisits
As
Select 
visit.ID
,visit.VisitDateTime 
,customer.Name As CustomerName
,STRING_AGG(pet.PetName, ', ') WITHIN GROUP (ORDER BY pet.PetName ASC) AS PetNames
,careProvider.FirstName + ' ' + careProvider.LastName As CareProviderName
From dbo.CareVisit visit
Inner Join dbo.CareRequest request On visit.CareRequestID = request.ID
Inner Join dbo.Customer customer On request.CustomerID = customer.ID
Inner Join (
	Select Distinct task.CareVisitID, pet.Name As PetName
	From dbo.Pet pet 
	Inner Join dbo.CareVisitTask task On pet.ID = task.PetID
) pet On visit.ID = pet.CareVisitID
Inner Join dbo.Person careProvider On visit.CareProviderID = careProvider.ID
Group By 
visit.ID
,visit.VisitDateTime
,customer.Name
,careProvider.FirstName
,careProvider.LastName
Go

Create View dbo.vwCareVisit
As
Select 
visit.ID
,visit.VisitDateTime 
,customer.ID As CustomerID
,customer.Name As CustomerName
,careProvider.ID As CareProviderID
,careProvider.FirstName + ' ' + careProvider.LastName As CareProviderName
From dbo.CareVisit visit
Inner Join dbo.CareRequest request On visit.CareRequestID = request.ID
Inner Join dbo.Customer customer On request.CustomerID = customer.ID
Inner Join dbo.Person careProvider On visit.CareProviderID = careProvider.ID
Go

Create View dbo.vwCareVisitTask
As
Select task.*, pet.Name As PetName From dbo.CareVisitTask task 
Inner Join dbo.Pet pet On task.PetID = pet.ID
Go


Drop Type If Exists dbo.typeID
Go
Create Type dbo.typeID As Table (
	ID Int Null
)
Go

Drop Procedure If Exists dbo.MergePetTasks
Drop Type If Exists dbo.typePetTasks
Go

Create Type dbo.typePetTasks As Table (
	ID Int Null
	,PreferredTime Time Not Null
	,Description VarChar(Max) Not Null
)
Go

Create Procedure dbo.MergePetTasks (@petID smallint, @petTasks dbo.typePetTasks ReadOnly)
As
Merge dbo.PetTask targetPetTasks
Using @petTasks sourcePetTasks
On targetPetTasks.ID = sourcePetTasks.ID
When Not Matched By Target
	Then Insert 
	(
		PetID
		,PreferredTime
		,Description
	) 
	Values
	(
		@petID
		,sourcePetTasks.PreferredTime
		,sourcePetTasks.Description
	)
When Matched
	Then Update Set
		PreferredTime = sourcePetTasks.PreferredTime
		,Description = sourcePetTasks.Description
When Not Matched By Source And PetID = @petID
	Then Delete;
Go

Drop Procedure If Exists dbo.MergeCareVisitTasks
Drop Type If Exists dbo.typeCareVisitTasks
Go

Create Type dbo.typeCareVisitTasks As Table (
	ID Int Null
	,PetID Int Not Null
	,Description VarChar(500) Not Null
)
Go

Create Procedure dbo.MergeCareVisitTasks (@visitID smallint, @visitTasks dbo.typeCareVisitTasks ReadOnly)
As
Merge dbo.CareVisitTask targetTasks
Using @visitTasks sourceTasks
On targetTasks.ID = sourceTasks.ID
When Not Matched By Target
	Then Insert 
	(
		CareVisitID
		,PetID
		,Description
	) 
	Values
	(
		@visitID
		,sourceTasks.PetID
		,sourceTasks.Description
	)
When Matched
	Then Update Set
		PetID = sourceTasks.PetID
		,Description = sourceTasks.Description
When Not Matched By Source And CareVisitID = @visitID
	Then Delete;
Go

Drop Procedure If Exists dbo.GetCareProviders
Go
Create Procedure dbo.GetCareProviders (@userName VarChar(25))
As
Select person.ID, person.FirstName + ' ' + person.LastName As Name
From dbo.GetBusinessesForUserName(@userName) associatedBusiness 
Inner Join dbo.BusinessPerson businessPerson On associatedBusiness.ID = businessPerson.BusinessID
Inner Join dbo.Person person On businessPerson.PersonID = person.ID
Order By person.FirstName, person.LastName
Go