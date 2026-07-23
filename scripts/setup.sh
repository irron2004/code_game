#!/bin/bash

# Setup script for WSL development environment
set -e

echo "🚀 Setting up WSL development environment..."

# Check if we're in WSL
if [[ ! -f /proc/version ]] || ! grep -q Microsoft /proc/version; then
    echo "⚠️  This script is designed for WSL. Please run it in WSL."
    exit 1
fi

# Check if we're in the project directory
if [[ ! -f "pyproject.toml" ]]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

echo "📦 Installing system dependencies..."
sudo apt update
sudo apt install -y build-essential python3-venv python3-pip git openssh-client \
    pkg-config libffi-dev libssl-dev curl

echo "🐍 Setting up Python virtual environment..."
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel

echo "📋 Installing Python dependencies..."
pip install -e ".[dev]"

echo "🔧 Setting up pre-commit hooks..."
pre-commit install

echo "🔑 Setting up Git configuration..."
if [[ -z "$(git config --global user.name)" ]]; then
    echo "Please set your Git username:"
    read -p "Git username: " git_username
    git config --global user.name "$git_username"
fi

if [[ -z "$(git config --global user.email)" ]]; then
    echo "Please set your Git email:"
    read -p "Git email: " git_email
    git config --global user.email "$git_email"
fi

echo "🧪 Running initial tests..."
python -m pytest tests/ -v

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'make dev' to start the development server"
echo "2. Run 'make test' to run tests"
echo "3. Run 'make lint' to check code quality"
echo "4. Run 'make fmt' to format code"
echo ""
echo "Happy coding! 🎉"
