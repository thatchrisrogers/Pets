using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Pets.Models
{
    public class Person
    {
        public int? ID { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Password { get; set; }
    }

    public class CareProvider
    {
        public int? ID { get; set; }
        public string Name { get; set; }

        public CareProvider() { }
        public CareProvider(int? id)
        {
            ID = id;
        }
        public CareProvider(int id, string name)
        {
            ID = id;
            Name = name;
        }
        public CareProvider(string name)
        {
            Name = name;
        }
    }
}