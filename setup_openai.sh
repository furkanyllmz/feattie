#!/bin/bash

# OpenAI API Key Setup Script for Feattie
echo "🔧 Setting up OpenAI API Key for Feattie..."

# Check if OPENAI_API_KEY is already set
if [ -n "$OPENAI_API_KEY" ]; then
    echo "✅ OPENAI_API_KEY is already set"
    echo "Current key: ${OPENAI_API_KEY:0:10}..."
else
    echo "❌ OPENAI_API_KEY is not set"
    echo ""
    echo "Please set your OpenAI API key:"
    echo "export OPENAI_API_KEY='your-api-key-here'"
    echo ""
    echo "Or add it to your ~/.zshrc or ~/.bashrc file:"
    echo "echo 'export OPENAI_API_KEY=\"your-api-key-here\"' >> ~/.zshrc"
    echo "source ~/.zshrc"
    echo ""
    echo "You can get your API key from: https://platform.openai.com/api-keys"
fi

echo ""
echo "🚀 To start the services:"
echo "1. Start the Python RAG service: cd feattie && python -m src.api.tenant_server"
echo "2. Start the .NET API: cd feattie/authentication/SecureAuth.Api && dotnet run"
echo ""
echo "📝 Test the setup:"
echo "curl -X GET http://localhost:5078/api/tenants/1/settings"

