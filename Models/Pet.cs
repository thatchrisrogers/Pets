using System;
using System.Collections.Generic;

namespace Pets.Models
{
    public class Pet
    {
        public int? ID { get; set; }
        public PetType Type { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<PetTask> Tasks { get; set; }
    }
    public class PetType
    {
        public int? ID { get; set; }
        public string Name { get; set; }

        public PetType() { }
        public PetType(int? id)
        {
            ID = id;
        }
        public PetType(int id, string name)
        {
            ID = id;
            Name = name;
        }
    }
    public class PetTask
    {
        public int? ID { get; set; }
        public TimeSpan PreferredTime { get; set;}
        public string Description { get; set; }

        public PetTask() { }
        public PetTask(int? id)
        {
            ID = id;
        }
        public PetTask(int id, TimeSpan preferredTime, string description)
        {
            ID = id;
            PreferredTime = preferredTime;
            Description = description;
        }
    }
}