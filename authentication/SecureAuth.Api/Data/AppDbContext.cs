using Microsoft.EntityFrameworkCore;
using SecureAuth.Api.Models;

namespace SecureAuth.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>()
         .HasIndex(u => u.Email)
         .IsUnique();

        // Email'i lowercase saklamak iyi pratik
        b.Entity<User>()
         .Property(u => u.Email)
         .HasMaxLength(320);
    }
}
