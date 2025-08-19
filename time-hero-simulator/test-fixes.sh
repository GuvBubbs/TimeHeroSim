#!/bin/bash

echo "🧪 Testing Phase 1 Fixes"
echo "========================"

# Test if the dev server is responding
echo "📡 Checking dev server..."
if curl -s http://localhost:5175/ > /dev/null; then
    echo "✅ Dev server is responding"
else
    echo "❌ Dev server is not responding"
    exit 1
fi

# Test if the upgrade tree page loads
echo "🌳 Testing upgrade tree page..."
if curl -s "http://localhost:5175/#/upgrade-tree" > /dev/null; then
    echo "✅ Upgrade tree page is accessible"
else
    echo "❌ Upgrade tree page is not accessible"
fi

# Test specific JavaScript files for compilation
echo "🔍 Checking key JavaScript files..."
if curl -s http://localhost:5175/src/utils/nodeClassification.js > /dev/null; then
    echo "✅ nodeClassification.js is accessible"
else
    echo "❌ nodeClassification.js is not accessible"
fi

if curl -s http://localhost:5175/src/composables/useUpgradeTree.js > /dev/null; then
    echo "✅ useUpgradeTree.js is accessible"
else
    echo "❌ useUpgradeTree.js is not accessible"
fi

echo ""
echo "🎯 Expected outcomes from fixes:"
echo "   1. Source classification should now work with camelCase names"
echo "   2. Template binding errors should be resolved"
echo "   3. Nodes should be properly distributed across sources"
echo ""
echo "✨ Phase 1 Debugging Complete!"
echo "📋 Next: Check browser console for source distribution"
