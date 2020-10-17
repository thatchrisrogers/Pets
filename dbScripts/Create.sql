Use Pets

Drop Table If Exists dbo.Customer

Create Table dbo.Customer (
	ID SmallInt Identity(1,1) Primary Key Not Null
	,HouseholdName VarChar(100) Null
	,Address VarChar(100) Null
	,Email VarChar(100) Null
)
