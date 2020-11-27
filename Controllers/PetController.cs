using System;
using System.Collections.Generic;
using System.Web.Http;
using Pets.Models;
using System.Data.SqlClient;
using System.Configuration;
using System.Data;

namespace Pets.Controllers
{
    public class PetController : ApiController
    {
        internal static List<Pet> GetList(int customerID)
        {
            List<Pet> pets = new List<Pet>();
            Pet pet;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.Pet Where CustomerID = @customerID;", connection))
                    {
                        command.Parameters.AddWithValue("customerID", customerID);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                pet = new Pet();
                                pet.ID = ((int)reader["ID"]);
                                pet.Name = ((string)reader["Name"]);
                                pet.Type = new PetType((int)reader["TypeID"]);
                                pet.Description = ((string)reader["Description"]);
                                pets.Add(pet);
                            }
                        }
                    }
                    foreach (Pet selectedPet in pets)
                    {
                        selectedPet.Tasks = PetTaskController.GetList((int)selectedPet.ID, connection);
                    }
                    return pets;
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
        }
        internal static void SaveList(int customerID, List<Pet> pets, SqlConnection connection, SqlTransaction transaction)
        {
            try
            {
                DataTable petIDs = new DataTable();
                petIDs.Columns.Add(new DataColumn("ID", typeof(int)));

                //Step 1 - Insert or Update Pets and collect IDs
                foreach (Pet pet in pets)
                {
                    using (SqlCommand command = new SqlCommand())
                    {
                        command.Connection = connection;
                        command.Transaction = transaction;
                        command.Parameters.AddWithValue("Name",pet.Name);
                        command.Parameters.AddWithValue("CustomerID", customerID);
                        command.Parameters.AddWithValue("TypeID",pet.Type.ID);
                        command.Parameters.AddWithValue("Description",pet.Description);
                        if (pet.ID == null)
                        {
                            command.CommandText = "Insert Into dbo.Pet (Name, CustomerID, TypeID, Description) OUTPUT Inserted.ID Values (@Name, @CustomerID, @TypeID, @Description); ";
                            pet.ID = (int)command.ExecuteScalar();
                        }
                        else
                        {
                            command.Parameters.AddWithValue("ID", pet.ID);
                            command.CommandText = "Update dbo.Pet Set Name = @Name, TypeID = @TypeID, Description = @Description Where ID = @ID;";
                            command.ExecuteNonQuery();
                        }
                        petIDs.Rows.Add(pet.ID);
                    }                
                }
                //Step 2 - Delete Pets removed via UI
                using (SqlCommand command = new SqlCommand("Delete From dbo.Pet Where CustomerID = @customerID And ID Not In (Select ID From @petIDs);", connection, transaction))
                {
                    command.Parameters.AddWithValue("customerID", customerID);
                    SqlParameter tableTypeParameter = command.Parameters.AddWithValue("petIDs", petIDs);
                    tableTypeParameter.SqlDbType = SqlDbType.Structured;
                    tableTypeParameter.TypeName = "dbo.typeID";

                    command.ExecuteNonQuery();
                }
                //Step 3 - Save Pet Tasks
                foreach (Pet pet in pets)
                {
                    PetTaskController.SaveList((int)pet.ID, pet.Tasks, connection, transaction);
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
    public class PetTaskController
    {
        internal static List<PetTask> GetList(int petID, SqlConnection connection)
        {
            List<PetTask> petTasks = new List<PetTask>();
            try
            {
                using (SqlCommand command = new SqlCommand("Select * From dbo.PetTask Where PetID = @petID Order By PreferredTime;", connection))
                {
                    command.Parameters.AddWithValue("petID", petID);
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            petTasks.Add(new PetTask(((int)reader["ID"]), (TimeSpan)reader["PreferredTime"], (string)reader["Description"]));
                        }
                    }
                }
                return petTasks;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        internal static void SaveList(int petID, List<PetTask> petTasks, SqlConnection connection, SqlTransaction transaction)
        {
            try
            {
                DataTable petTaskTable = new DataTable();
                petTaskTable.Columns.Add("ID");
                petTaskTable.Columns.Add("PreferredTime");
                petTaskTable.Columns.Add("Description");
                DataRow petTaskRow;
                foreach (PetTask petTask in petTasks)
                {
                    petTaskRow = petTaskTable.NewRow();
                    petTaskRow["ID"] = petTask.ID;
                    petTaskRow["PreferredTime"] = petTask.PreferredTime;
                    petTaskRow["Description"] = petTask.Description;
                    petTaskTable.Rows.Add(petTaskRow);
                }
                using (SqlCommand command = new SqlCommand("dbo.MergePetTasks", connection, transaction))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("petID", petID);
                    SqlParameter tableParameter = command.Parameters.AddWithValue("petTasks", petTaskTable);
                    tableParameter.SqlDbType = SqlDbType.Structured;
                    command.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
    public class PetTypeController : ApiController
    {
        [HttpGet]
        public List<PetType> Get()
        {
            List<PetType> petTypes = new List<PetType>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.PetType Order By Name;", connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                petTypes.Add(new PetType((int)reader["ID"], (string)reader["Name"]));
                            }
                        }
                    }
                    return petTypes;
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
        }
    }
}
