'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TopicHeatmap } from '@/components/heatmap/TopicHeatmap';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  memberCount: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [isSlackConnected, setIsSlackConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      const response = await fetch('/api/slack/channels', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
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
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/slack/auth`;
    const scope = 'channels:history,channels:read,groups:history,groups:read';
    
    window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
  };

  useEffect(() => {
    if (session) {
      checkSlackConnection();
    }
  }, [session]);

  useEffect(() => {
    if (isSlackConnected) {
      fetchChannels();
    }
  }, [isSlackConnected]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Slack Topic Analyzer</h1>
          {!isSlackConnected ? (
            <Button onClick={connectSlack} disabled={isLoading}>
              Connect Slack
            </Button>
          ) : (
            <Select 
              value={selectedChannel} 
              onValueChange={setSelectedChannel}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    #{channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {isLoading && <div>Loading...</div>}
        {selectedChannel && !isLoading && <TopicHeatmap />}
      </div>
    </div>
  );
}