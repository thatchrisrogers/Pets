using System;
using System.Web.Http;
using Pets.Models;
using System.Data.SqlClient;
using System.Configuration;
using System.Collections.Generic;

namespace Pets.Controllers
{
    public class BusinessController : ApiController
    {
        [HttpGet]
        public List<Business> Get(string userName)
        {
            List<Business> businesses = new List<Business>();
            Business business;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.GetBusinessesForUserName(@userName);", connection))
                    {
                        command.Parameters.AddWithValue("userName", userName);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                business = new Business();
                                business.ID = ((int)reader["ID"]);
                                business.Name = ((string)reader["Name"]);
                                businesses.Add(business);
                            }
                        }
                    }
                    return businesses;
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
        }
    }
}
