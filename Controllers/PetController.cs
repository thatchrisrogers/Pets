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
                                pet.Tasks = PetTaskController.GetList((int)pet.ID, connection);
                                pets.Add(pet);
                            }
                        }
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
                DataTable petTable = new DataTable();
                petTable.Columns.Add("ID");
                petTable.Columns.Add("Name");
                petTable.Columns.Add("TypeID");
                petTable.Columns.Add("Description");
                DataRow petRow;
                foreach (Pet pet in pets)
                {
                    petRow = petTable.NewRow();
                    petRow["ID"] = pet.ID;
                    if (pet.ID != null)
                    {
                        PetTaskController.SaveList((int)pet.ID, pet.Tasks, connection, transaction);
                    }
                    petRow["Name"] = pet.Name;
                    petRow["TypeID"] = pet.Type.ID;
                    petRow["Description"] = pet.Description;
                    petTable.Rows.Add(petRow);
                }
                using (SqlCommand command = new SqlCommand("dbo.MergePets", connection, transaction))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("customerID", customerID);
                    SqlParameter tableParameter = command.Parameters.AddWithValue("pets", petTable);
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
    public class PetTaskController
    {
        internal static List<PetTask> GetList(int petID, SqlConnection connection)
        {
            List<PetTask> petTasks = new List<PetTask>();
            try
            {
                using (SqlCommand command = new SqlCommand("Select * From dbo.PetTask Where PetID = @petID;", connection))
                {
                    command.Parameters.AddWithValue("petID", petID);
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            petTasks.Add(new PetTask(((int)reader["ID"]), (string)reader["Description"]));
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
                petTaskTable.Columns.Add("Description");
                DataRow petTaskRow;
                foreach (PetTask petTask in petTasks)
                {
                    petTaskRow = petTaskTable.NewRow();
                    petTaskRow["ID"] = petTask.ID;
                    petTaskRow["Description"] = petTask.Description;
                    petTaskTable.Rows.Add(petTaskRow);
                }
                using (SqlCommand command = new SqlCommand("dbo.MergePetTasks", connection, transaction))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("petID", petID);
                    SqlParameter tableParameter = command.Parameters.AddWithValue("petTasks", petTasks);
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
