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
    public class BusinessUnavailableDateController : ApiController
    {
        [HttpGet]
        public List<BusinessUnavailableDate> Get(BusinessUnavailableDate unavailableDate)
        {
            List<BusinessUnavailableDate> unavailableDates = new List<BusinessUnavailableDate>();
            //ToDo
            return unavailableDates;
        }
        [HttpPost]
        public void Post(BusinessUnavailableDate unavailableDate)
        {
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                connection.Open();
                try
                {
                    using (SqlCommand selectCommand = new SqlCommand("Select BusinessID,UnavailableDate From dbo.BusinessUnavailableDate Where BusinessID = @BusinessID And UnavailableDate = @UnavailableDate;", connection))
                    {
                        selectCommand.Parameters.AddWithValue("BusinessID", unavailableDate.BusinessID);
                        selectCommand.Parameters.AddWithValue("UnavailableDate", unavailableDate.UnavailableDate);
                        SqlDataReader reader = selectCommand.ExecuteReader();
                        if (reader.HasRows)
                        {
                            using (SqlCommand deleteCommand = new SqlCommand("Delete From dbo.BusinessUnavailableDate Where BusinessID = @BusinessID And UnavailableDate = @UnavailableDate;", connection))
                            {
                                deleteCommand.Parameters.AddWithValue("BusinessID", unavailableDate.BusinessID);
                                deleteCommand.Parameters.AddWithValue("UnavailableDate", unavailableDate.UnavailableDate);
                                deleteCommand.ExecuteNonQuery();
                            }
                        }
                        else
                        {
                            using (SqlCommand insertCommand = new SqlCommand("Insert Into dbo.BusinessUnavailableDate Values(BusinessID = @BusinessID, UnavailableDate = @UnavailableDate);", connection))
                            {
                                insertCommand.Parameters.AddWithValue("BusinessID", unavailableDate.BusinessID);
                                insertCommand.Parameters.AddWithValue("UnavailableDate", unavailableDate.UnavailableDate);
                                insertCommand.ExecuteNonQuery();
                            }
                        }

                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
        }
    }
}
