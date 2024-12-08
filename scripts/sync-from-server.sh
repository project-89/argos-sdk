#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Define paths
SERVER_SDK_PATH="/Users/jakobgrant/Workspaces/Oneirocom/argos-server/src/lib/argos-sdk"
STANDALONE_SDK_PATH="/Users/jakobgrant/Workspaces/Oneirocom/argos-sdk/src/lib/argos-sdk"

# Function to print with color
print() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if server SDK path exists
if [ ! -d "$SERVER_SDK_PATH" ]; then
    print $RED "Error: Server SDK path not found at $SERVER_SDK_PATH"
    exit 1
fi

# Create backup of current standalone SDK
BACKUP_PATH="/Users/jakobgrant/Workspaces/Oneirocom/argos-sdk/src/lib/argos-sdk.bak"
if [ -d "$STANDALONE_SDK_PATH" ]; then
    print $BLUE "Creating backup of current standalone SDK..."
    rm -rf "$BACKUP_PATH"
    mv "$STANDALONE_SDK_PATH" "$BACKUP_PATH"
fi

# Create standalone SDK directory if it doesn't exist
mkdir -p "$STANDALONE_SDK_PATH"

# Copy SDK files from server to standalone
print $BLUE "Copying SDK files from server to standalone repo..."
cp -R "$SERVER_SDK_PATH"/* "$STANDALONE_SDK_PATH/"

# Update imports if necessary
print $BLUE "Updating import paths..."
find "$STANDALONE_SDK_PATH" -type f -name "*.ts" -exec sed -i '' 's|@/lib/argos-sdk|@/lib/argos-sdk|g' {} +

# Verify copy
if [ $? -eq 0 ]; then
    print $GREEN "✅ SDK successfully synced from server to standalone repo"
    print $BLUE "Server SDK: $SERVER_SDK_PATH"
    print $BLUE "Standalone SDK: $STANDALONE_SDK_PATH"
    print $BLUE "Backup created at: $BACKUP_PATH"
else
    print $RED "❌ Error occurred during sync"
    # Restore from backup if it exists
    if [ -d "$BACKUP_PATH" ]; then
        print $BLUE "Restoring from backup..."
        rm -rf "$STANDALONE_SDK_PATH"
        mv "$BACKUP_PATH" "$STANDALONE_SDK_PATH"
    fi
    exit 1
fi 