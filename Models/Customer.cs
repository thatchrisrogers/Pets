using System;
using System.Collections.Generic;

namespace Pets.Models
{
    public class Customer
    {
        public int? ID { get; set; }
        public string HouseholdName { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public string PetNames { get; set; }
        public List<Pet> Pets { get; set; }
    }
}