'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TopicHeatmap from '@/components/heatmap/TopicHeatmap';
import { SlackChannel, Message } from '@/types';
import { GitPullRequest, MessageCircle, Calendar as CalendarIcon, LogOut, User } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const { data: session } = useSession();
  
  // State for Slack connection
  const [isSlackConnected, setIsSlackConnected] = useState(false);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  
  // State for date range selection
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // State for demo messages and API testing
  const [messages, setMessages] = useState<Message[]>([
    { user: "John", text: "We need to fix the login bug in production" },
    { user: "Sarah", text: "The new dashboard feature is coming along nicely" },
    { user: "Mike", text: "Can someone review my PR for the API changes?" }
  ]);
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check Slack connection on mount
  useEffect(() => {
    if (session) {
      checkSlackConnection();
    }
  }, [session]);

  // Fetch channels when Slack is connected
  useEffect(() => {
    if (isSlackConnected) {
      fetchChannels();
    }
  }, [isSlackConnected]);

  const checkSlackConnection = async () => {
    try {
      const response = await fetch('/api/slack/status');
      const data = await response.json();
      setIsSlackConnected(data.isConnected);
    } catch (error) {
      console.error('Error checking Slack connection:', error);
      setError('Failed to check Slack connection status');
    }
  };

  const fetchChannels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/slack/channels');
      
      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }

      const data = await response.json();
      setChannels(data.channels);
    } catch (error) {
      console.error('Error fetching channels:', error);
      setError('Failed to fetch channels');
    } finally {
      setIsLoading(false);
    }
  };

  const connectSlack = () => {
    // In a real app, this would redirect to Slack OAuth
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/slack/auth`;
    const scope = 'channels:history,channels:read,groups:history,groups:read';
    
    // For demo purposes, we'll just simulate a successful connection
    setTimeout(() => {
      setIsSlackConnected(true);
    }, 1000);
    
    // In production:
    // window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
  };

  const testTopicExtraction = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/topics/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Slack Topic Analyzer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com/stephenenke/chatter" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700"
              >
                GitHub
              </a>
              
              {session && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      {session.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt={session.user.name || 'User'} 
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      {session.user?.name || session.user?.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
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

          {/* Slack Connection */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Slack Connection</h2>
            
            {!isSlackConnected ? (
              <div>
                <p className="mb-4 text-gray-600">Connect your Slack workspace to analyze conversations.</p>
                <Button 
                  onClick={connectSlack} 
                  disabled={isLoading}
                  className="bg-[#4A154B] hover:bg-[#611f64]"
                >
                  Connect to Slack
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <p className="text-gray-600">Connected to Slack</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Channel</label>
                    <Select
                      value={selectedChannel || ''}
                      onValueChange={setSelectedChannel}
                      disabled={isLoading || channels.length === 0}
                    >
                      <SelectTrigger className="w-full md:w-64">
                        <SelectValue placeholder="Select a channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {channels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id}>
                            {channel.is_private ? '🔒' : '#'} {channel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="w-full md:w-64 justify-start text-left font-normal"
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate && endDate ? (
                          <>
                            {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
                          </>
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </div>
                    
                    {isDatePickerOpen && (
                      <div className="mt-2 bg-white border rounded-md shadow-md p-2">
                        <div className="flex space-x-4">
                          <div>
                            <p className="text-sm mb-1">Start Date</p>
                            <Calendar
                              mode="single"
                              selected={startDate || undefined}
                              onSelect={(date: Date | undefined) => setStartDate(date || null)}
                              initialFocus
                              required={false}
                            />
                          </div>
                          <div>
                            <p className="text-sm mb-1">End Date</p>
                            <Calendar
                              mode="single"
                              selected={endDate || undefined}
                              onSelect={(date: Date | undefined) => setEndDate(date || null)}
                              initialFocus
                              required={false}
                              disabled={(date) => startDate ? date < startDate : false}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button 
                            size="sm" 
                            onClick={() => setIsDatePickerOpen(false)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Topic Extraction Test */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Topic Extraction Test</h2>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Test messages:</p>
              <div className="border rounded-md p-3 space-y-2 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex items-start">
                    <MessageCircle className="w-4 h-4 mt-1 mr-2" />
                    <div>
                      <span className="font-medium">{msg.user}: </span>
                      <span>{msg.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Button
              onClick={testTopicExtraction}
              className="mb-4"
              disabled={isLoading}
            >
              {isLoading ? 'Extracting...' : 'Extract Topics'}
            </Button>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {topics && topics.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-medium">Extracted Topics:</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {topics.map((topic, index) => (
                    <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Heatmap Visualization */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Topic Heatmap Visualization</h2>
            <TopicHeatmap 
              channelId={selectedChannel || undefined}
              startDate={startDate ? format(startDate, "yyyy-MM-dd") : undefined}
              endDate={endDate ? format(endDate, "yyyy-MM-dd") : undefined}
            />
          </div>
        </div>
      </main>
    </div>
  );
}