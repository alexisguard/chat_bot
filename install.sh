#!/bin/bash

echo "🚀 Starting installation process..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew already installed"
fi

# Make sure Homebrew is in the PATH
eval "$(/opt/homebrew/bin/brew shellenv)"

# Check and install Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
else
    echo "✅ Node.js already installed"
fi

# Check and install Python
if ! command -v python3 &> /dev/null; then
    echo "📦 Installing Python..."
    brew install python
else
    echo "✅ Python already installed"
fi

# npm comes with Node.js, but let's make sure it's working
if ! command -v npm &> /dev/null; then
    echo "❌ npm installation failed. Please install npm manually"
    exit 1
else
    echo "✅ npm is installed"
fi

# pip should come with Python, but let's make sure it's working
if ! command -v pip3 &> /dev/null; then
    echo "📦 Installing pip..."
    python3 -m ensurepip --upgrade
else
    echo "✅ pip is installed"
fi

echo "✅ All required tools are installed"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd alphaguard_api
pip3 install fastapi uvicorn

echo "✅ Installation complete!"
echo ""
echo "To start the application:"
echo "1. In this terminal, run: npm start"
echo "2. In another terminal, go to alphaguard_api and run: uvicorn app.main:app --reload"
echo ""
echo "Then visit http://localhost:3000 in your browser" 
