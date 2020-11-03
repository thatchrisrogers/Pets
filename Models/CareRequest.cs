using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Pets.Models
{
    public class CareRequest
    {
        public int? ID { get; set; }
        public int CustomerID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string HouseholdName { get; set; }
    }
}