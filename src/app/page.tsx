'use client';

import { useState } from 'react';
import TopicHeatmap from '@/components/heatmap/TopicHeatmap';

export default function Home() {
  const [messages] = useState<string[]>([
    "We need to fix the login bug in production",
    "The new dashboard feature is coming along nicely",
    "Can someone review my PR for the API changes?"
  ]);
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testTopicExtraction = async () => {
    try {
      const response = await fetch('/api/topics/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (Array.isArray(data.topics)) {
        setTopics(data.topics);
      } else {
        setError('Invalid response format');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to extract topics');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Slack Topic Analyzer</h1>
            </div>
            <a 
              href="https://github.com/stephenenke/chatter?tab=readme-ov-file" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Prototype Description */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">About This Prototype</h2>
            <p className="text-gray-600">
              This is a work-in-progress prototype for analyzing Slack conversations and visualizing topic patterns.
              Currently demonstrating topic extraction and heatmap visualization capabilities.
            </p>
          </div>

          {/* Topic Extraction Test */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Topic Extraction Test</h2>
            <button
              onClick={testTopicExtraction}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Extract Topics
            </button>
            {error && (
              <div className="mt-4 text-red-500">
                Error: {error}
              </div>
            )}
            {topics && topics.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-medium">Extracted Topics:</h3>
                <ul className="list-disc pl-4 mt-2">
                  {topics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Heatmap Visualization */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Topic Heatmap Visualization</h2>
            <TopicHeatmap />
          </div>
        </div>
      </main>
    </div>
  );
}