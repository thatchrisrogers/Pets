using System;
using System.Web.Http;
using Pets.Models;
using System.Data.SqlClient;
using System.Configuration;

namespace Pets.Controllers
{
    public class UserController : ApiController
    {
        [HttpPost]
        public User Get(User user)
        {
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.[User] Where Name = @name And Password = @password", connection))
                    {
                        command.Parameters.AddWithValue("name", user.Name);
                        command.Parameters.AddWithValue("password", user.Password);
                        user = new User();
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                reader.Read();                               
                                user.ID = ((int)reader["ID"]);
                                user.Name = reader["Name"] == DBNull.Value ? string.Empty : (string)reader["Name"];
                                user.FirstName = reader["FirstName"] == DBNull.Value ? string.Empty : (string)reader["FirstName"];
                                user.LastName = reader["LastName"] == DBNull.Value ? string.Empty : (string)reader["LastName"];
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
            return user;
        }
    }
}