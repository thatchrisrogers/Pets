using System;
using System.Collections.Generic;
using System.Web.Http;
using Pets.Models;
using System.Configuration;
using System.Data.SqlClient;
using System.Data;

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
                    careRequest.Visits = CareVisitController.GetList((int)careRequest.ID);
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
                    CareVisitController.SaveList((int)careRequest.ID, careRequest.Visits, connection, transaction);
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
    public class CareVisitController : ApiController
    {
        [HttpGet]
        public List<CareVisit> Get()
        {
            List<CareVisit> visits = new List<CareVisit>();
            CareVisit visit;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.vwCareVisits Order By VisitDateTime, CustomerName", connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                visit = new CareVisit();
                                visit.ID = ((int)reader["ID"]);
                                visit.VisitDateTime = ((DateTime)reader["VisitDateTime"]);
                                visit.Customer = new Customer((string)reader["CustomerName"]);
                                visit.PetNames = ((string)reader["PetNames"]);
                                visit.CareProvider = new CareProvider((string)reader["CareProviderName"]);
                                visits.Add(visit);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
            return visits;
        }
        [HttpGet]
        public CareVisit Get(int id)
        {
            CareVisit visit = new CareVisit();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.vwCareVisit Where ID = @id", connection))
                    {
                        command.Parameters.AddWithValue("id", id);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                reader.Read();
                                visit.ID = ((int)reader["ID"]);
                                visit.VisitDateTime = ((DateTime)reader["VisitDateTime"]);
                                visit.Customer = new Customer((int)reader["CustomerID"], (string)reader["CustomerName"]);
                                visit.CareProvider = new CareProvider((int)reader["CareProviderID"], (string)reader["CareProviderName"]);
                            }
                        }
                    }
                    visit.Tasks = CareVisitTaskController.GetList(id);
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
            return visit;
        }
        internal static List<CareVisit> GetList(int careRequestID)
        {
            List<CareVisit> visits = new List<CareVisit>();
            CareVisit visit;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.CareVisit Where CareRequestID = @careRequestID Order By VisitDateTime;", connection))
                    {
                        command.Parameters.AddWithValue("careRequestID", careRequestID);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                visit = new CareVisit();
                                visit.ID = ((int)reader["ID"]);
                                visit.CareProvider = new CareProvider((int)reader["CareProviderID"]);
                                visit.VisitDateTime = ((DateTime)reader["VisitDateTime"]);
                                visit.Tasks = CareVisitTaskController.GetList((int)visit.ID);
                                visits.Add(visit);
                            }
                        }
                    }                 
                    return visits;
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
        }
        internal static void SaveList(int careRequestID, List<CareVisit> visits, SqlConnection connection, SqlTransaction transaction)
        {
            DataTable visitIDs = new DataTable();
            visitIDs.Columns.Add(new DataColumn("ID", typeof(int)));

            //Step 1 - Insert or Update Visit and collect IDs
            foreach (CareVisit visit in visits)
            {
                using (SqlCommand command = new SqlCommand())
                {
                    command.Connection = connection;
                    command.Transaction = transaction;
                    command.Parameters.AddWithValue("CareRequestID", careRequestID);
                    command.Parameters.AddWithValue("CareProviderID", visit.CareProvider.ID);
                    command.Parameters.AddWithValue("VisitDateTime", visit.VisitDateTime);
                    if (visit.ID == null)
                    {
                        command.CommandText = "Insert Into dbo.CareVisit (CareRequestID, CareProviderID, VisitDateTime) OUTPUT Inserted.ID Values (@CareRequestID, @CareProviderID, @VisitDateTime); ";
                        visit.ID = (int)command.ExecuteScalar();
                    }
                    else
                    {
                        command.Parameters.AddWithValue("ID", visit.ID);
                        command.CommandText = "Update dbo.CareVisit Set CareRequestID = @CareRequestID, CareProviderID = @CareProviderID, VisitDateTime = @VisitDateTime Where ID = @ID;";
                        command.ExecuteNonQuery();
                    }
                    visitIDs.Rows.Add(visit.ID);
                    CareVisitTaskController.SaveList((int)visit.ID, visit.Tasks, connection, transaction);
                }
            }
            //Step 2 - Delete Visits removed via UI
            using (SqlCommand command = new SqlCommand("Delete From dbo.CareVisit Where CareRequestID = @careRequestID And ID Not In (Select ID From @visitIDs);", connection, transaction))
            {
                command.Parameters.AddWithValue("careRequestID", careRequestID);
                SqlParameter tableTypeParameter = command.Parameters.AddWithValue("visitIDs", visitIDs);
                tableTypeParameter.SqlDbType = SqlDbType.Structured;
                tableTypeParameter.TypeName = "dbo.typeID";

                command.ExecuteNonQuery();
            }
        }
    }
    public class CareVisitTaskController
    {
        internal static List<CareVisitTask> GetList(int careVisitID)
        {
            List<CareVisitTask> tasks = new List<CareVisitTask>();
            CareVisitTask task;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.CareVisitTask Where CareVisitID = @careVisitID;", connection))
                    {
                        command.Parameters.AddWithValue("careVisitID", careVisitID);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                task = new CareVisitTask();
                                task.ID = ((int)reader["ID"]);
                                task.CareVisitID = ((int)reader["CareVisitID"]);
                                task.PetID = ((int)reader["PetID"]);
                                task.Description = ((string)reader["Description"]);
                                task.IsComplete = ((bool)reader["IsComplete"]);
                                task.CompletedByCareProviderID = reader["CompletedByCareProviderID"] == DBNull.Value ? (int?)null : (int?)reader["CompletedByCareProviderID"];
                                task.DateCompleted = reader["DateCompleted"] == DBNull.Value ? (DateTime?)null : (DateTime?)reader["DateCompleted"];
                                tasks.Add(task);
                            }
                        }
                    }
                    return tasks;
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
        }
        internal static void SaveList(int visitID, List<CareVisitTask> visitTasks, SqlConnection connection, SqlTransaction transaction)
        {
            try
            {
                DataTable visitTaskTable = new DataTable();
                visitTaskTable.Columns.Add("ID");
                visitTaskTable.Columns.Add("PetID");
                visitTaskTable.Columns.Add("Description");
                //Note - I do not think the following fields should be part of the Merge.  I think these will be updated differently after each Visit.
                //visitTaskTable.Columns.Add("IsComplete");
                //visitTaskTable.Columns.Add("CompletedByCareProviderID");
                //visitTaskTable.Columns.Add("DateCompleted");
                DataRow visitTaskRow;
                foreach (CareVisitTask visitTask in visitTasks)
                {
                    visitTaskRow = visitTaskTable.NewRow();
                    visitTaskRow["ID"] = visitTask.ID;
                    visitTaskRow["PetID"] = visitTask.PetID;
                    visitTaskRow["Description"] = visitTask.Description;
                    //visitTaskRow["IsComplete"] = visitTask.IsComplete;
                    //visitTaskRow["CompletedByCareProviderID"] = visitTask.CompletedByCareProviderID;
                    //visitTaskRow["DateCompleted"] = visitTask.DateCompleted;
                    visitTaskTable.Rows.Add(visitTaskRow);
                }
                using (SqlCommand command = new SqlCommand("dbo.MergeCareVisitTasks", connection, transaction))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("visitID", visitID);
                    SqlParameter tableParameter = command.Parameters.AddWithValue("visitTasks", visitTaskTable);
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
