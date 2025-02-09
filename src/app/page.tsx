'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<string[]>([
    "We need to fix the login bug in production",
    "The new dashboard feature is coming along nicely",
    "Can someone review my PR for the API changes?"
  ]);
  const [topics, setTopics] = useState<string[]>([]);

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
      setTopics(data.topics);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Topic Extraction Test</h1>
      <button
        onClick={testTopicExtraction}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Extract Topics
      </button>
      {topics.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Extracted Topics:</h2>
          <ul className="list-disc pl-4">
            {topics.map((topic, index) => (
              <li key={index}>{topic}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}