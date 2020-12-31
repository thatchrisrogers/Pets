using System;
using System.Web.Http;
using Pets.Models;
using System.Data.SqlClient;
using System.Configuration;
using System.Collections.Generic;

namespace Pets.Controllers
{
    public class PersonController : ApiController
    {
        [HttpPost]
        public Person Get(Person person)
        {
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.Person Where UserName = @userName And Password = @password", connection))
                    {
                        command.Parameters.AddWithValue("userName", person.UserName);
                        command.Parameters.AddWithValue("password", person.Password);
                        person = new Person();
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                reader.Read();
                                person.ID = ((int)reader["ID"]);
                                person.UserName = reader["UserName"] == DBNull.Value ? string.Empty : (string)reader["UserName"];
                                person.FirstName = reader["FirstName"] == DBNull.Value ? string.Empty : (string)reader["FirstName"];
                                person.LastName = reader["LastName"] == DBNull.Value ? string.Empty : (string)reader["LastName"];
                            }
                            else
                            {
                                throw new Exception("Login Error - User Name or Password was not found.");
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
            return person;
        }
    }
    public class CareProviderController : ApiController
    {
        [HttpGet]
        public List<CareProvider> Get(string userName)
        {
            List<CareProvider> careProviders = new List<CareProvider>();
            CareProvider careProvider;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("dbo.GetCareProviders", connection))
                    {
                        command.CommandType = System.Data.CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("userName", userName);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                careProvider = new CareProvider();
                                careProvider.ID = ((int)reader["ID"]);
                                careProvider.Name = ((string)reader["Name"]);
                                careProviders.Add(careProvider);
                            }
                        }
                    }
                    return careProviders;
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
        }
    }
}