namespace Assignment.Models
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class Health : DbContext
    {
        public Health()
            : base("name=Health")
        {
        }

        public virtual DbSet<C__MigrationHistory> C__MigrationHistory { get; set; }
        public virtual DbSet<AspNetRole> AspNetRoles { get; set; }
        public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; }
        public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; }
        public virtual DbSet<AspNetUser> AspNetUsers { get; set; }
        public virtual DbSet<location> locations { get; set; }
        public virtual DbSet<Point> Points { get; set; }
        public virtual DbSet<reservation> reservations { get; set; }
        public virtual DbSet<route> routes { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AspNetRole>()
                .HasMany(e => e.AspNetUsers)
                .WithMany(e => e.AspNetRoles)
                .Map(m => m.ToTable("AspNetUserRoles").MapLeftKey("RoleId").MapRightKey("UserId"));

            modelBuilder.Entity<AspNetUser>()
                .HasMany(e => e.AspNetUserClaims)
                .WithRequired(e => e.AspNetUser)
                .HasForeignKey(e => e.UserId);

            modelBuilder.Entity<AspNetUser>()
                .HasMany(e => e.AspNetUserLogins)
                .WithRequired(e => e.AspNetUser)
                .HasForeignKey(e => e.UserId);

            modelBuilder.Entity<AspNetUser>()
                .HasMany(e => e.reservations)
                .WithRequired(e => e.AspNetUser)
                .HasForeignKey(e => e.user_id)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<location>()
                .Property(e => e.name)
                .IsUnicode(false);

            modelBuilder.Entity<location>()
                .HasMany(e => e.reservations)
                .WithRequired(e => e.location)
                .HasForeignKey(e => e.location_id)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<route>()
                .HasMany(e => e.Points)
                .WithRequired(e => e.route)
                .HasForeignKey(e => e.route_id)
                .WillCascadeOnDelete(false);
        }
    }
}
