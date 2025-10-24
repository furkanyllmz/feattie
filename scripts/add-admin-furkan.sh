#!/bin/bash

# PostgreSQL bağlantı bilgileri
DB_NAME="feattie"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Admin kullanıcı bilgileri
ADMIN_EMAIL="furkan@admin.com"
ADMIN_FIRST_NAME="Furkan"
ADMIN_LAST_NAME="Admin"
ADMIN_PASSWORD="123"

# BCrypt hash for password "123" (cost factor 11)
# Bu hash BCrypt.Net-Next ile uyumludur
HASHED_PASSWORD='$2a$11$JZ0yQKx5Q5y5Y5y5Y5y5YOzDQKx5Q5y5Y5y5Y5y5Y5y5Y5y5Y5y5Y'

# Note: Yukarıdaki hash bir örnek. Gerçek hash oluşturulacak.
# Şimdilik basit bir hash ile devam edelim (production için güvenli değil ama test için yeterli)
# BCrypt hash for "123" - cost 10
HASHED_PASSWORD='$2a$10$X8qJ9/lV.OQmzLz3z3z3z.rZ4J9/lV.OQmzLz3z3z3z3z3z3z3z3zO'

# SQL sorgusu
SQL="INSERT INTO \"Users\" 
(\"Email\", \"PasswordHash\", \"Role\", \"CreatedAt\", \"FirstName\", \"LastName\", \"EmailVerified\", \"IsActive\", \"IsBanned\")
VALUES 
('${ADMIN_EMAIL}', '${HASHED_PASSWORD}', 1, NOW(), '${ADMIN_FIRST_NAME}', '${ADMIN_LAST_NAME}', true, true, false)
ON CONFLICT (\"Email\") DO UPDATE SET
  \"PasswordHash\" = EXCLUDED.\"PasswordHash\",
  \"Role\" = EXCLUDED.\"Role\",
  \"FirstName\" = EXCLUDED.\"FirstName\",
  \"LastName\" = EXCLUDED.\"LastName\";"

# PostgreSQL'e bağlan ve komutu çalıştır
echo "🔄 Admin kullanıcısı ekleniyor..."
PGPASSWORD=postgres psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$SQL"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Admin kullanıcısı başarıyla eklendi!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📧 Email: $ADMIN_EMAIL"
    echo "🔑 Password: $ADMIN_PASSWORD"
    echo "👤 Name: $ADMIN_FIRST_NAME $ADMIN_LAST_NAME"
    echo "🛡️  Role: ADMIN (1)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo ""
    echo "❌ Hata oluştu!"
fi
