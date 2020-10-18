Use Pets
Go

Drop Procedure If Exists dbo.MergePets
Drop Type If Exists dbo.type_Pet
Go

Create Type dbo.type_Pet As Table (
	ID SmallInt Null
	,Name VarChar(100) Not Null
	,Description VarChar(500) Not Null
	--,IsBeingDeleted bit Not Null
)
Go
Create Procedure dbo.MergePets (@customerID smallint, @pets dbo.type_Pet ReadOnly)
As
Merge dbo.Pet targetPets
Using @pets sourcePets
On targetPets.ID = sourcePets.ID
When Not Matched By Target
	Then Insert 
	(
		CustomerID
		,Name
		,Description
	) 
	Values
	(
		@customerID
		,sourcePets.Name
		,sourcePets.Description
	)
When Matched
	Then Update Set
		Name = sourcePets.Name
		,Description = sourcePets.Description
When Not Matched By Source And CustomerID = @customerID And ID Not In (Select ID From @pets)
	Then Delete;
Go