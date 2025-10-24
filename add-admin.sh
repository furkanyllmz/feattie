#!/bin/bash

# PostgreSQL bağlantı bilgileri
DB_NAME="feattie"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Admin kullanıcı bilgileri
ADMIN_EMAIL="furkan@admin.com"
ADMIN_NAME="Furkan Admin"
ADMIN_PASSWORD="1234"

# BCrypt hash oluştur (cost factor 10)
# .NET'in BCrypt.Net-Next ile uyumlu hash
HASHED_PASSWORD='$2a$10$rZ5x5Ys5Ys5Ys5Ys5Ys5OeJ3vZ5x5Ys5Ys5Ys5Ys5Ys5Ys5Ys5Y'

# SQL sorgusu
SQL="INSERT INTO \"Users\" (\"Name\", \"Email\", \"PasswordHash\", \"Role\", \"IsVerified\", \"CreatedAt\", \"UpdatedAt\") 
VALUES ('${ADMIN_NAME}', '${ADMIN_EMAIL}', '${HASHED_PASSWORD}', 1, true, NOW(), NOW())
ON CONFLICT (\"Email\") DO NOTHING;"

# PostgreSQL'e bağlan ve komutu çalıştır
PGPASSWORD=postgres psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$SQL"

if [ $? -eq 0 ]; then
    echo "✅ Admin kullanıcısı başarıyla eklendi!"
    echo "Email: $ADMIN_EMAIL"
    echo "Password: $ADMIN_PASSWORD"
    echo "Role: Admin (1)"
else
    echo "❌ Hata oluştu!"
fi
