using System;
using System.Collections.Generic;
using System.Web.Http;
using System.Data.SqlClient;
using Pets.Models;
using System.Data;

namespace Pets.Controllers
{
    public class CareVisitController : ApiController
    {
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
                    command.Parameters.AddWithValue("CareProviderID", visit.CareProviderID);
                    command.Parameters.AddWithValue("VisitDate", visit.VisitDate);
                    if (visit.ID == null)
                    {
                        command.CommandText = "Insert Into dbo.CareVisit (CareRequestID, CareProviderID, VisitDate) OUTPUT Inserted.ID Values (@CareRequestID, @CareProviderID, @VisitDate); ";
                        visit.ID = (int)command.ExecuteScalar();
                    }
                    else
                    {
                        command.Parameters.AddWithValue("ID", visit.ID);
                        command.CommandText = "Update dbo.CareVisit Set CareRequestID = @CareRequestID, CareProviderID = @CareProviderID, VisitDate = @VisitDate Where ID = @ID;";
                        command.ExecuteNonQuery();
                    }
                    visitIDs.Rows.Add(visit.ID);
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
        internal static void SaveList(int visitID, List<CareVisitTask> visitTasks, SqlConnection connection, SqlTransaction transaction)
        {
            try
            {
                DataTable visitTaskTable = new DataTable();
                visitTaskTable.Columns.Add("ID");
                visitTaskTable.Columns.Add("PetID");
                visitTaskTable.Columns.Add("Description");
                visitTaskTable.Columns.Add("IsComplete");
                visitTaskTable.Columns.Add("CompletedByCareProviderID");
                visitTaskTable.Columns.Add("DateCompleted");
                DataRow visitTaskRow;
                foreach (CareVisitTask visitTask in visitTasks)
                {
                    visitTaskRow = visitTaskTable.NewRow();
                    visitTaskRow["ID"] = visitTask.ID;
                    visitTaskRow["PetID"] = visitTask.PetID;
                    visitTaskRow["Description"] = visitTask.Description;
                    visitTaskRow["IsComplete"] = visitTask.IsComplete;
                    visitTaskRow["CompletedByCareProviderID"] = visitTask.CompletedByCareProviderID;
                    visitTaskRow["DateCompleted"] = visitTask.DateCompleted;
                    visitTaskTable.Rows.Add(visitTaskRow);
                }
                using (SqlCommand command = new SqlCommand("dbo.MergeCareVisitTasks", connection, transaction))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("visitID", visitID);
                    SqlParameter tableParameter = command.Parameters.AddWithValue("petTasks", visitTaskTable);
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

