#!/bin/bash

# SMS Flow Test Runner
echo "🧪 Running SMS Flow Tests..."

# Run SMS component tests
echo "📱 Testing SMS Component..."
npm run test:component

# Run SMS validation tests
echo "✅ Testing SMS Validation..."
npm run test:validation

# Run all SMS-related tests
echo "🔄 Running all SMS tests..."
npm run test:sms

echo "✨ SMS Flow Tests Complete!"
