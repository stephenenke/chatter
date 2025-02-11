# Slack Topic Analyzer

A tool that analyzes Slack conversations and visualizes discussion patterns using topic extraction and heatmap visualization.

## Live Demo
[Slack Topic Analyzer](https://chatter-two-jet.vercel.app/)

## Features

### Topic Extraction
- Uses OpenAI's GPT models to extract discussion topics from Slack messages
- Automatically categorizes conversations into relevant themes
- Real-time topic analysis of sample messages

### Interactive Heatmap
- Visual representation of discussion intensity across topics and time
- Color-coded indicators for discussion volume
- Trend indicators showing topic momentum
- Suggested ticket creation based on discussion patterns
- Integration with Linear (coming soon)

## Tech Stack
- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui components
- OpenAI API
- React with Server Components

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm
- OpenAI API key

### Installation
```bash
# Clone the repository
git clone https://github.com/stephenenke/chatter.git

# Install dependencies
cd chatter
npm install

# Set up environment variables
cp .env.example .env.local
# Add your OpenAI API key to .env.local

# Run the development server
npm run dev
