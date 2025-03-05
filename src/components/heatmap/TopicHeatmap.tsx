'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowUp, ArrowDown, MessageCircle, GitPullRequest, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { Message, SuggestedTicket, CellData, TopicAnalysisResult } from '@/types';

interface TopicHeatmapProps {
  channelId?: string;
  startDate?: string;
  endDate?: string;
  teamFilter?: string;
}

const TopicHeatmap: React.FC<TopicHeatmapProps> = ({ 
  channelId, 
  startDate, 
  endDate, 
  teamFilter = 'all' 
}) => {
  // State for visualization data
  const [topics, setTopics] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [values, setValues] = useState<number[][]>([]);
  const [trends, setTrends] = useState<number[][]>([]);
  
  // State for tickets and messages
  const [tickets, setTickets] = useState<string[][]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [suggestedTickets, setSuggestedTickets] = useState<SuggestedTicket[]>([]);
  
  // UI state
  const [selectedTeam, setSelectedTeam] = useState(teamFilter);
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Load data when channel or date changes
  useEffect(() => {
    if (channelId) {
      fetchHeatmapData();
    } else {
      // Use sample data when no channel is selected
      loadSampleData();
    }
  }, [channelId, startDate, endDate]);

  // Fetch real data from the API
  const fetchHeatmapData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch messages from the selected channel and date range
      const messagesResponse = await fetch('/api/slack/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          channelId, 
          startDate: startDate || undefined, 
          endDate: endDate || undefined 
        }),
      });
      
      if (!messagesResponse.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const messagesData = await messagesResponse.json();
      
      if (messagesData.messages.length === 0) {
        setError('No messages found for the selected time period.');
        setIsLoading(false);
        return;
      }
      
      // Extract topics from messages
      const topicsResponse = await fetch('/api/topics/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesData.messages }),
      });
      
      if (!topicsResponse.ok) {
        throw new Error('Failed to extract topics');
      }
      
      const topicsData = await topicsResponse.json();
      
      // Process the data
      // This would call our analyzeMessageVolume function from the topic-extractor.ts
      // For now, we'll simulate the response
      
      // Set state with the processed data
      setTopics(topicsData.topics);
      setDays(messagesData.days);
      // ... additional processing to generate values and trends
      
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample data for demonstration
  const loadSampleData = () => {
    const sampleData = {
      topics: ['Product Roadmap', 'Bug Fixes', 'Feature A', 'UI Updates', 'Performance', 'Customer Feedback'],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      values: [
        [80, 45, 30, 25, 60],
        [20, 70, 85, 40, 30],
        [50, 60, 70, 80, 40],
        [30, 20, 45, 70, 80],
        [40, 50, 20, 30, 45],
        [60, 30, 40, 50, 20],
      ],
      trends: [
        [5, -2, -5, 10, 15],
        [-3, 15, -8, -5, 2],
        [8, 5, 12, -10, -5],
        [2, 10, 15, 8, -3],
        [-5, 2, 5, 8, 10],
        [10, -5, 8, -2, -8],
      ],
      tickets: [
        ['PROJ-123', 'PROJ-124'],
        ['PROJ-125', 'PROJ-126'],
        ['PROJ-127'],
        ['PROJ-128', 'PROJ-129', 'PROJ-130'],
        ['PROJ-131'],
        ['PROJ-132', 'PROJ-133'],
      ],
      suggestedTickets: [
        {
          topic: 'Performance',
          day: 3,
          suggestion: 'Create performance monitoring dashboard',
          reason: 'High discussion volume about performance metrics without associated ticket',
          relevantMessages: [
            { user: 'Alex', text: 'We need better visibility into API performance' },
            { user: 'Maria', text: 'Response times are increasing, we should track this' }
          ]
        },
        {
          topic: 'Customer Feedback',
          day: 4,
          suggestion: 'Implement feedback collection system',
          reason: 'Multiple discussions about customer pain points without tracking',
          relevantMessages: [
            { user: 'Tom', text: 'Customers keep asking for better reporting' },
            { user: 'Sarah', text: 'We should centralize feedback collection' }
          ]
        }
      ]
    };
    
    setTopics(sampleData.topics);
    setDays(sampleData.days);
    setValues(sampleData.values);
    setTrends(sampleData.trends);
    setTickets(sampleData.tickets);
    setSuggestedTickets(sampleData.suggestedTickets);
  };

  // Generate a summary for the selected topic
  const generateSummary = async (topicIdx: number, dayIdx: number) => {
    try {
      setIsSummarizing(true);
      
      // Get relevant messages for this topic and day
      const topicName = topics[topicIdx];
      const relevantMessages = getSuggestedTicket(topicIdx, dayIdx)?.relevantMessages || [];
      
      if (relevantMessages.length === 0) {
        setSummary('No messages found for this topic and day.');
        return;
      }
      
      // Call the summarize API
      const response = await fetch('/api/topics/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: relevantMessages,
          channelName: 'selected channel', // This would be dynamic in production
          dateRange: days[dayIdx]
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }
      
      const data = await response.json();
      setSummary(data.summary);
      
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Failed to generate summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Create a ticket from a suggestion
  const createTicket = async (suggestion: SuggestedTicket) => {
    // This would integrate with Linear or other ticket systems in production
    console.log('Creating ticket:', suggestion);
    alert(`Ticket would be created: ${suggestion.suggestion}`);
    // After ticket creation, you would update the tickets state
  };

  // Helper functions
  const getColor = (value: number): string => {
    const intensity = Math.floor((value / 100) * 255);
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
  };

  const getTextColor = (value: number): string => {
    return value > 50 ? 'text-white' : 'text-black';
  };

  const getTrendIcon = (trend: number): React.ReactElement | null => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getSuggestedTicket = (topicIdx: number, dayIdx: number): SuggestedTicket | undefined => {
    return suggestedTickets.find(
      st => topics[topicIdx] === st.topic && dayIdx === st.day
    );
  };

  const handleCellClick = (topicIdx: number, dayIdx: number): void => {
    setSelectedCell({ topicIdx, dayIdx });
    setDetailsOpen(true);
    // Generate summary when a cell is clicked
    generateSummary(topicIdx, dayIdx);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading topic data...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Discussion Topic Heatmap</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 flex space-x-4">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              <SelectItem value="frontend">Frontend</SelectItem>
              <SelectItem value="backend">Backend</SelectItem>
              <SelectItem value="design">Design</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border text-left">Topic</th>
                {days.map(day => (
                  <th key={day} className="p-2 border text-center w-24">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topics.map((topic, topicIdx) => (
                <tr key={topic}>
                  <td className="p-2 border font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{topic}</span>
                      {tickets[topicIdx]?.length > 0 && (
                        <GitPullRequest className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </td>
                  {values[topicIdx]?.map((value, dayIdx) => (
                    <td
                      key={`${topic}-${dayIdx}`}
                      className={`p-2 border text-center ${getTextColor(value)} cursor-pointer hover:opacity-80 relative`}
                      style={{
                        backgroundColor: getColor(value),
                      }}
                      onClick={() => handleCellClick(topicIdx, dayIdx)}
                    >
                      <div className="flex flex-col items-center">
                        <span>{value}%</span>
                        {getTrendIcon(trends[topicIdx][dayIdx])}
                        {getSuggestedTicket(topicIdx, dayIdx) && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 absolute top-0 right-0" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end space-x-2">
          <span className="text-sm">Discussion Intensity:</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-100"></div>
            <span className="text-sm">Low</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-400"></div>
            <span className="text-sm">Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-800"></div>
            <span className="text-sm">High</span>
          </div>
        </div>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            {selectedCell && (
              <>
                <DialogHeader>
                  <DialogTitle>
                    {`${topics[selectedCell.topicIdx]} - ${days[selectedCell.dayIdx]}`}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {getSuggestedTicket(selectedCell.topicIdx, selectedCell.dayIdx) && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <AlertTitle>Suggested Linear Ticket</AlertTitle>
                      <AlertDescription className="mt-2">
                        <div className="space-y-2">
                          <p className="font-medium">
                            {getSuggestedTicket(selectedCell.topicIdx, selectedCell.dayIdx)?.suggestion}
                          </p>
                          <p className="text-sm text-gray-600">
                            Reason: {getSuggestedTicket(selectedCell.topicIdx, selectedCell.dayIdx)?.reason}
                          </p>
                          <div className="mt-2">
                            <Button 
                              size="sm"
                              onClick={() => {
                                const ticket = getSuggestedTicket(selectedCell.topicIdx, selectedCell.dayIdx);
                                if (ticket) createTicket(ticket);
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create Ticket
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Summary section */}
                  <div className="border rounded p-4">
                    <h3 className="font-semibold mb-2">
                      Discussion Summary
                      {isSummarizing && <Loader2 className="ml-2 h-4 w-4 inline animate-spin" />}
                    </h3>
                    <div className="prose max-w-none">
                      {summary ? (
                        <div className="space-y-2 text-sm">
                          {summary.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          {isSummarizing ? 'Generating summary...' : 'No summary available'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border rounded p-4">
                    <h3 className="font-semibold mb-2">Related Tickets</h3>
                    <div className="space-y-2">
                      {tickets[selectedCell.topicIdx]?.length > 0 ? (
                        tickets[selectedCell.topicIdx].map(ticket => (
                          <div key={ticket} className="flex items-center space-x-2">
                            <GitPullRequest className="w-4 h-4" />
                            <span>{ticket}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No related tickets found</p>
                      )}
                    </div>
                  </div>

                  <div className="border rounded p-4">
                    <h3 className="font-semibold mb-2">Recent Messages</h3>
                    <div className="space-y-2">
                      {getSuggestedTicket(selectedCell.topicIdx, selectedCell.dayIdx)?.relevantMessages.map((msg, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <MessageCircle className="w-4 h-4 mt-1" />
                          <div>
                            <span className="font-medium">{msg.user}: </span>
                            <span>{msg.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TopicHeatmap;