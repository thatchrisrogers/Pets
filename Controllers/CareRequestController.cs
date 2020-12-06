using System;
using System.Collections.Generic;
using System.Web.Http;
using Pets.Models;
using System.Configuration;
using System.Data.SqlClient;

namespace Pets.Controllers
{
    public class CareRequestController : ApiController
    {
        CareRequest careRequest;
        private CareRequest GetCareRequestFromReader(SqlDataReader reader)
        {
            careRequest = new CareRequest();
            careRequest.ID = ((int)reader["ID"]);
            careRequest.Customer = new Customer((int)reader["CustomerID"], (string)reader["CustomerName"]);
            careRequest.StartDate = (DateTime)reader["StartDate"];
            careRequest.EndDate = (DateTime)reader["EndDate"];          
            return careRequest;
        }
        // GET api/<controller>
        [HttpGet]
        public List<CareRequest> Get()
        {
            List<CareRequest> careRequests = new List<CareRequest>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.CareRequest Order By StartDate", connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {                            
                                careRequests.Add(GetCareRequestFromReader(reader));
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
            return careRequests;
        }

        public List<CareRequest> Get(int month, int year)
        {
            List<CareRequest> careRequests = new List<CareRequest>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.vwCareRequest Where Month(StartDate) = @month And Year(StartDate) = @year Order By StartDate", connection))
                    {
                        command.Parameters.AddWithValue("month", month);
                        command.Parameters.AddWithValue("year", year);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                careRequests.Add(GetCareRequestFromReader(reader));
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
            return careRequests;
        }

        // GET api/<controller>/5
        [HttpGet]
        public CareRequest Get(int id)
        {
            careRequest = new CareRequest();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.vwCareRequest Where ID = @id", connection))
                    {
                        command.Parameters.AddWithValue("id", id);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                reader.Read();
                                careRequest = GetCareRequestFromReader(reader);
                            }
                        }
                    }
                    careRequest.Customer = CustomerController.FindByID((int)careRequest.Customer.ID);
                }              
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
            return careRequest;
        }

        // POST api/<controller>
        [HttpPost]
        public CareRequest Post(CareRequest careRequest)
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
                        command.Parameters.AddWithValue("CustomerID", careRequest.Customer.ID);
                        command.Parameters.AddWithValue("StartDate", careRequest.StartDate);
                        command.Parameters.AddWithValue("EndDate", careRequest.EndDate);
                        if (careRequest.ID == null)
                        {
                            command.CommandText = "Insert Into dbo.CareRequest (CustomerID, StartDate, EndDate) OUTPUT Inserted.ID Values (@CustomerID, @StartDate, @EndDate);";
                            careRequest.ID = (int)command.ExecuteScalar();
                        }
                        else
                        {
                            command.CommandText = "Update dbo.CareRequest Set CustomerID = @CustomerID, StartDate = @StartDate, EndDate = @EndDate Where ID = @ID;";
                            command.Parameters.AddWithValue("ID", careRequest.ID);
                            command.ExecuteNonQuery();
                        }
                    }
                    transaction.Commit();
                    return Get((int)careRequest.ID); //return the newly created CareRequest so the caller has fresh IDs, etc.
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    throw new Exception(ex.Message);
                }
            }
        }
    }
}
