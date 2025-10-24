#!/usr/bin/env python3
"""
Test script to verify OpenAI API key setup and RAG configuration
"""
import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_openai_key():
    """Test if OpenAI API key is properly set"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY environment variable not set")
        return False
    
    if not api_key.startswith('sk-'):
        print("❌ Invalid OpenAI API key format (should start with 'sk-')")
        return False
    
    print(f"✅ OpenAI API key found: {api_key[:10]}...")
    return True

def test_python_rag_service():
    """Test if Python RAG service is running"""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Python RAG service is running")
            return True
        else:
            print(f"❌ Python RAG service returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Python RAG service is not running")
        return False

def test_dotnet_api():
    """Test if .NET API is running"""
    try:
        response = requests.get("http://localhost:5000/api/tenants", timeout=5)
        if response.status_code == 200:
            print("✅ .NET API is running")
            return True
        else:
            print(f"❌ .NET API returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ .NET API is not running")
        return False

def test_rag_configuration():
    """Test RAG configuration endpoint"""
    try:
        # First, get tenants
        response = requests.get("http://localhost:5000/api/tenants")
        if response.status_code != 200:
            print("❌ Could not fetch tenants")
            return False
        
        tenants = response.json()
        if not tenants:
            print("❌ No tenants found")
            return False
        
        tenant_id = tenants[0]['id']
        print(f"✅ Found tenant: {tenant_id}")
        
        # Test RAG configuration
        response = requests.get(f"http://localhost:5000/api/tenants/{tenant_id}/rag-config")
        if response.status_code == 404:
            print("ℹ️  RAG configuration not found for tenant (this is normal for new setup)")
            return True
        elif response.status_code == 200:
            print("✅ RAG configuration found")
            return True
        else:
            print(f"❌ RAG configuration test failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing RAG configuration: {e}")
        return False

def main():
    print("🔧 Testing Feattie OpenAI Setup...")
    print("=" * 50)
    
    tests = [
        ("OpenAI API Key", test_openai_key),
        ("Python RAG Service", test_python_rag_service),
        (".NET API", test_dotnet_api),
        ("RAG Configuration", test_rag_configuration),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🧪 Testing {test_name}...")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {test_name}: {status}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All tests passed! Your setup is ready.")
    else:
        print("\n⚠️  Some tests failed. Please check the setup.")
        print("\n📝 Next steps:")
        print("1. Set your OpenAI API key: export OPENAI_API_KEY='your-key-here'")
        print("2. Start Python RAG service: python -m src.api.tenant_server")
        print("3. Start .NET API: cd authentication/SecureAuth.Api && dotnet run")

if __name__ == "__main__":
    main()

