﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Pets.Models
{
    public class Business
    {
        public int? ID { get; set; }
        public string Name { get; set; }
        public List<Person> Owners { get; set; }

        public Business() { }
        public Business(int? id)
        {
            ID = id;
        }
        public Business(int id, string name)
        {
            ID = id;
            Name = name;
        }
    }
}