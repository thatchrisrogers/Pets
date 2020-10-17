using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Pets.Models;
using System.Data.SqlClient;
using System.Configuration;

namespace Pets.Controllers
{
    public class CustomerController : ApiController
    {
        // GET api/<controller>
        [HttpGet]
        public List<Customer> Get()
        {
            List<Customer> customers = new List<Customer>();
            Customer customer;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.Customer Order By HouseholdName", connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                customer = new Customer();
                                customer.ID = ((Int16)reader["ID"]);
                                customer.HouseholdName = reader["HouseholdName"] == DBNull.Value ? string.Empty : (string)reader["HouseholdName"];
                                customer.Address = reader["Address"] == DBNull.Value ? string.Empty : (string)reader["Address"];
                                customer.Email = reader["Email"] == DBNull.Value ? string.Empty : (string)reader["Email"];
                                customers.Add(customer);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
            return customers;
        }

        // GET api/<controller>/5
        [HttpGet]
        public Customer Get(int id)
        {
            Customer customer = new Customer();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.Customer Where ID = @id", connection))
                    {
                        command.Parameters.AddWithValue("id",id);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                reader.Read();
                                customer.ID = ((Int16)reader["ID"]);
                                customer.HouseholdName = reader["HouseholdName"] == DBNull.Value ? string.Empty : (string)reader["HouseholdName"];
                                customer.Address = reader["Address"] == DBNull.Value ? string.Empty : (string)reader["Address"];
                                customer.Email = reader["Email"] == DBNull.Value ? string.Empty : (string)reader["Email"];
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
            return customer;
        }

        // POST api/<controller>
        [HttpPost]
        public void Post(Customer customer)
        {
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                connection.Open();
                try
                {
                    using (SqlCommand command = new SqlCommand())
                    {
                        command.Connection = connection;
                        if (customer.ID == null)
                        {
                            command.CommandText = "Insert Into dbo.Customer (HouseholdName, Address, Email) Values (@HouseholdName, @Address, @Email);";
                        }
                        else
                        {
                            command.CommandText = "Update dbo.Customer Set HouseholdName = @HouseholdName, Address = @Address, Email = @Email Where ID = @ID;";
                            command.Parameters.AddWithValue("ID", customer.ID);
                        }
                        command.Parameters.AddWithValue("HouseholdName", customer.HouseholdName);
                        command.Parameters.AddWithValue("Address", customer.Address);
                        command.Parameters.AddWithValue("Email", customer.Email);
                        command.ExecuteNonQuery();
                    }                 
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}