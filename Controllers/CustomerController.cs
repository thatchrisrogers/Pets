using System;
using System.Collections.Generic;
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
                    using (SqlCommand command = new SqlCommand("Select * From dbo.vwCustomer Order By Name", connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                customer = new Customer();
                                customer.ID = ((int)reader["ID"]);
                                customer.Name = reader["Name"] == DBNull.Value ? string.Empty : (string)reader["Name"];
                                customer.Address = reader["Address"] == DBNull.Value ? string.Empty : (string)reader["Address"];
                                customer.Email = reader["Email"] == DBNull.Value ? string.Empty : (string)reader["Email"];
                                customer.PetNames = reader["PetNames"] == DBNull.Value ? string.Empty : (string)reader["PetNames"];
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
            return FindByID(id);
        }   
        internal static Customer FindByID(int id)
        {
            Customer customer = new Customer();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.Customer Where ID = @id", connection))
                    {
                        command.Parameters.AddWithValue("id", id);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                reader.Read();
                                customer.ID = ((int)reader["ID"]);
                                customer.Name = reader["Name"] == DBNull.Value ? string.Empty : (string)reader["Name"];
                                customer.Address = reader["Address"] == DBNull.Value ? string.Empty : (string)reader["Address"];
                                customer.Email = reader["Email"] == DBNull.Value ? string.Empty : (string)reader["Email"];
                            }
                        }
                    }
                    customer.Pets = PetController.GetList((int)customer.ID);
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
        public Customer Post(Customer customer)
        {
            SqlTransaction transaction;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                connection.Open();
                transaction = connection.BeginTransaction();
                try
                {
                    using (SqlCommand command = new SqlCommand())
                    {
                        command.Connection = connection;
                        command.Transaction = transaction;
                        command.Parameters.AddWithValue("Name", customer.Name);
                        command.Parameters.AddWithValue("Address", customer.Address);
                        command.Parameters.AddWithValue("Email", customer.Email);
                        if (customer.ID == null)
                        {
                            command.CommandText = "Insert Into dbo.Customer (Name, Address, Email) OUTPUT Inserted.ID Values (@Name, @Address, @Email);";
                            customer.ID = (int)command.ExecuteScalar();
                        }
                        else
                        {
                            command.CommandText = "Update dbo.Customer Set Name = @Name, Address = @Address, Email = @Email Where ID = @ID;";
                            command.Parameters.AddWithValue("ID", customer.ID);
                            command.ExecuteNonQuery();
                        }                                            
                    }
                    PetController.SaveList((int)customer.ID, customer.Pets, connection, transaction);
                    transaction.Commit();
                    return Get((int)customer.ID); //return the newly created Customer so the caller has fresh IDs, etc.
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
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