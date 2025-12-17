#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  File Uploader - Local Development  ${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo -e "${YELLOW}Please create a .env file based on .env.example${NC}"
    echo ""
    echo "To create .env file:"
    echo "  cp .env.example .env"
    echo ""
    echo "Then edit .env and add your configuration"
    exit 1
fi

# Check if node_modules exists in root
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
    echo ""
fi

# Check if node_modules exists in client
if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd client
    npm install
    cd ..
    echo ""
fi

echo -e "${GREEN}Starting application...${NC}"
echo ""
echo -e "${BLUE}Backend:${NC}  http://localhost:3000"
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend server
npm run server &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend server
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for both processes
wait
