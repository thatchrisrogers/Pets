using System;
using System.Collections.Generic;
using System.Web.Http;
using System.Data.SqlClient;
using Pets.Models;
using System.Configuration;

namespace Pets.Controllers
{
    public class CareProviderController : ApiController
    {
        [HttpGet]
        public List<CareProvider> Get()
        {
            List<CareProvider> careProviders = new List<CareProvider>();
            CareProvider careProvider;
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["Pets"].ConnectionString))
            {
                try
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand("Select * From dbo.CareProvider Order By Name;", connection))
                    {
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
