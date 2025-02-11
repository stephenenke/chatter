# Chatter: The Slack Topic Analyzer

Ever wish you could keep track of all of that dev chatter? What about tracking and classifying your support chatbot convos? Introducing Chatter: a tool that analyzes Slack conversations and visualizes discussion patterns using topic extraction and heatmap visualization.

After the initial MVP, I will begin adding Linear ticket suggestions if we do not find likely corresponding tickets. That way, when you start talking about a new bug in the dev channel, you can easily create a corresponding ticket.

## Live Demo
[Slack Topic Analyzer](https://chatter-two-jet.vercel.app/)
*This is primarily a UI prototype. Currently working on OpenAI topic extraction.
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
