namespace Pets.Models
{
    public class Pet
    {
        public int? ID { get; set; }
        public PetType Type { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
    public class PetType
    {
        public int? ID { get; set; }
        public string Name { get; set; }

        public PetType(int id)
        {
            ID = id;
        }
        public PetType (int id, string name)
        {
            ID = id;
            Name = name;
        }
    }
}