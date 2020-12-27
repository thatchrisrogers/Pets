using System;
using System.Collections.Generic;
namespace Pets.Models
{
    public class CareRequest
    {
        public int? ID { get; set; }
        public Customer Customer { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<CareVisit> Visits { get; set; }
    }
    public class CareVisit
    {
        public int? ID { get; set; }
        public int CareRequestID { get; set; }
        public CareProvider CareProvider { get; set; }
        public DateTime VisitDateTime { get; set; }
        public List<CareVisitTask> Tasks { get; set; }
        public Customer Customer { get; set; }
        public string PetNames { get; set; }      
    }
    public class CareVisitTask
    {
        public int? ID { get; set; }
        public Pet Pet { get; set; }
        public string Description { get; set; }
        public bool IsComplete { get; set; }
        public int? CompletedByCareProviderID { get; set; }
        public DateTime? DateCompleted { get; set; }
    }    
}