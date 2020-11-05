using System;

namespace Pets.Models
{
    public class CareRequest
    {
        public int? ID { get; set; }
        public int CustomerID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string CustomerName { get; set; }
    }
}