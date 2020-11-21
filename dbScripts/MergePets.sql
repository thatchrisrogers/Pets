Use Pets
Go

Drop Procedure If Exists dbo.MergePets
Drop Type If Exists dbo.type_Pet
Go

Create Type dbo.type_Pet As Table (
	ID Int Null
	,Name VarChar(100) Not Null
	,TypeID Int Not Null
	,Description VarChar(500) Not Null
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
		,TypeID
		,Description
	) 
	Values
	(
		@customerID
		,sourcePets.Name
		,sourcePets.TypeID
		,sourcePets.Description
	)
When Matched
	Then Update Set
		Name = sourcePets.Name
		,TypeID = sourcePets.TypeID
		,Description = sourcePets.Description
When Not Matched By Source And CustomerID = @customerID
	Then Delete;
Go

Drop Procedure If Exists dbo.MergePetTasks
Drop Type If Exists dbo.type_PetTasks
Go

Create Type dbo.type_PetTasks As Table (
	ID Int Null
	,PetID Int Not Null
	,Description VarChar(Max) Not Null
)
Go

Create Procedure dbo.MergePetTasks (@petID smallint, @petTasks dbo.type_PetTasks ReadOnly)
As
Merge dbo.PetTasks targetPetTasks
Using @petTasks sourcePetTasks
On targetPetTasks.ID = sourcePetTasks.ID
When Not Matched By Target
	Then Insert 
	(
		PetID		
		,Description
	) 
	Values
	(
		@petID
		,sourcePetTasks.Description
	)
When Matched
	Then Update Set
		Description = sourcePetTasks.Description
When Not Matched By Source And PetID = @petID
	Then Delete;
Go