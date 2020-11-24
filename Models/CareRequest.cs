using System;

namespace Pets.Models
{
    public class CareRequest
    {
        public int? ID { get; set; }
        public Customer Customer { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}