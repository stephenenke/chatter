'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowUp, ArrowDown, MessageCircle, GitPullRequest, Plus, AlertTriangle } from 'lucide-react';

type Message = {
  user: string;
  text: string;
};

type SuggestedTicket = {
  topic: string;
  day: number;
  suggestion: string;
  reason: string;
  relevantMessages: Message[];
};

interface CellData {
  topicIdx: number;
  dayIdx: number;
}

// Sample data with proper types
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
  messages: [
    [
      { user: 'John', text: 'We need to prioritize the Q2 roadmap' },
      { user: 'Sarah', text: 'Agreed, lets schedule a planning session' },
    ],
    [
      { user: 'Mike', text: 'Critical bug in production needs attention' },
      { user: 'Lisa', text: 'Im looking into it now' },
    ],
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

const TopicHeatmap = () => {
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
    return sampleData.suggestedTickets.find(
      st => sampleData.topics[topicIdx] === st.topic && dayIdx === st.day
    );
  };

  const handleCellClick = (topicIdx: number, dayIdx: number): void => {
    setSelectedCell({ topicIdx, dayIdx });
    setDetailsOpen(true);
  };

  const createTicket = (suggestion: SuggestedTicket): void => {
    console.log('Creating ticket:', suggestion);
  };

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
                {sampleData.days.map(day => (
                  <th key={day} className="p-2 border text-center w-24">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleData.topics.map((topic, topicIdx) => (
                <tr key={topic}>
                  <td className="p-2 border font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{topic}</span>
                      {sampleData.tickets[topicIdx].length > 0 && (
                        <GitPullRequest className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </td>
                  {sampleData.values[topicIdx].map((value, dayIdx) => (
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
                        {getTrendIcon(sampleData.trends[topicIdx][dayIdx])}
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
                    {`${sampleData.topics[selectedCell.topicIdx]} - ${sampleData.days[selectedCell.dayIdx]}`}
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

                  <div className="border rounded p-4">
                    <h3 className="font-semibold mb-2">Related Tickets</h3>
                    <div className="space-y-2">
                      {sampleData.tickets[selectedCell.topicIdx].map(ticket => (
                        <div key={ticket} className="flex items-center space-x-2">
                          <GitPullRequest className="w-4 h-4" />
                          <span>{ticket}</span>
                        </div>
                      ))}
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