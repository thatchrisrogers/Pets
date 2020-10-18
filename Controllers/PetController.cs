using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Pets.Models;
using System.Data.SqlClient;
using System.Configuration;
using System.Data;

namespace Pets.Controllers
{
    public class PetController : ApiController
    {      
        internal static List<Pet> GetList(Int16 customerID)
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
                                pet.ID = ((Int16)reader["ID"]);
                                pet.Name = ((string)reader["Name"]);
                                pet.Description = ((string)reader["Description"]);
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
        internal static void SaveList(Int16 customerID, List<Pet> pets, SqlConnection connection, SqlTransaction transaction)
        {
            try
            {
                DataTable petTable = new DataTable();
                petTable.Columns.Add("ID");
                petTable.Columns.Add("Name");
                petTable.Columns.Add("Description");
                DataRow petRow;
                foreach (Pet pet in pets)
                {
                    petRow = petTable.NewRow();
                    petRow["ID"] = pet.ID;
                    petRow["Name"] = pet.Name;
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
}
