namespace Pets.Models
{
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