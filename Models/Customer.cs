using System;
using System.Collections.Generic;

namespace Pets.Models
{
    public class Customer
    {
        public int? ID { get; set; }
        public Business Business { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public string PetNames { get; set; }
        public List<Pet> Pets { get; set; }

        public Customer() { }
        public Customer(int? id)
        {
            ID = id;
        }
        public Customer(int id, string name)
        {
            ID = id;
            Name = name;
        }
        public Customer(string name)
        {
            Name = name;
        }
    }
}