Use Pets

Drop View If Exists dbo.vwVisit
Drop View If Exists dbo.vwCustomer
Drop View If Exists dbo.vwCareRequest
Drop Table If Exists dbo.CareVisitTask
Drop Table If Exists dbo.CareVisit
Drop Table If Exists dbo.CareRequest
Drop Table If Exists dbo.CareProvider
Drop Table If Exists dbo.PetTask
Drop Table If Exists dbo.Pet
Drop Table If Exists dbo.PetType
Drop Table If Exists dbo.Customer

Create Table dbo.Customer (
	ID Int Identity(1,1) Primary Key Not Null
	,Name VarChar(100) Null
	,Address VarChar(100) Null
	,Email VarChar(100) Null
)

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
Alter Table dbo.CareVisit Add Constraint FK_CareVisit_CareRequest Foreign Key(CareRequestID) References dbo.CareRequest(ID) On Delete Cascade
Alter Table dbo.CareVisit Add Constraint FK_CareVisit_CareProvider Foreign Key(CareProviderID) References dbo.CareProvider(ID)

Create Table dbo.CareVisitTask(
	ID Int Identity(1,1) Primary Key Not Null
	,CareVisitID Int Not Null
	,PetID Int Not Null
	,Description VarChar(500) Not Null
	,IsComplete Bit Not Null Default 0
	,CompletedByCareProviderID Int Null
	,DateCompleted DateTime Null
)
Alter Table dbo.CareVisitTask Add Constraint FK_CareVisitTask_CareVisit Foreign Key(CareVisitID) References dbo.CareVisit(ID) On Delete Cascade
Alter Table dbo.CareVisitTask Add Constraint FK_CareVisitTask_Pet Foreign Key(PetID) References dbo.Pet(ID)
Alter Table dbo.CareVisitTask Add Constraint FK_CareVisitTask_CareProvider Foreign Key(CompletedByCareProviderID) References dbo.CareProvider(ID)

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
Left Join dbo.Pet pet On customer.ID = pet.CustomerID
Group By customer.ID, customer.Name, customer.Address, customer.Email
Go

Create View dbo.vwVisit
As
Select 
visit.ID
,visit.VisitDate 
,customer.Name As CustomerName
,STRING_AGG(pet.PetName, ', ') WITHIN GROUP (ORDER BY pet.PetName ASC) AS PetNames
,provider.Name As CareProviderName
From dbo.CareVisit visit
Inner Join dbo.CareRequest request On visit.CareRequestID = request.ID
Inner Join dbo.Customer customer On request.CustomerID = customer.ID
Inner Join (
	Select Distinct task.CareVisitID, pet.Name As PetName
	From dbo.Pet pet 
	Inner Join dbo.CareVisitTask task On pet.ID = task.PetID
) pet On visit.ID = pet.CareVisitID
Inner Join dbo.CareProvider provider On visit.CareProviderID = provider.ID
Group By 
visit.ID
,visit.VisitDate 
,customer.Name
,provider.Name
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