namespace Assignment.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Point")]
    public partial class Point
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int id { get; set; }

        [Required]
        public double latitude { get; set; }

        [Required]
        public double longitude { get; set; }

        [Required]
        public int route_id { get; set; }

        public virtual route route { get; set; }
    }
}
