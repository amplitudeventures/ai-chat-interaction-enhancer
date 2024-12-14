'use client'
/**
 * DONT FORGET TO ADD THESE FOR HISTORY AND AGENTS
 * 
 * const handleSendMessage = (message: string) => {
    setHistory([...history, { id: Date.now().toString(), text: message }]);
  };

  const handleSelectAgent = (id: string) => {
    console.log("Selected Agent ID:", id);
  };
  const [history, setHistory] = React.useState<{ id: string; text: string }[]>([]);
  const [agents, setAgents] = React.useState([{ id: "1", name: "Agent A" }, { id: "2", name: "Agent B" }]); 

  */ 
 

/**
 * Running a local relay server will allow you to hide your API key
 * and run custom logic on the server
 *
 *
 * This will also require you to set OPENAI_API_KEY= in a `.env` file
 * You can run it with `npm run relay`, in parallel with `npm start`
 */
const LOCAL_RELAY_SERVER_URL: string =
  process.env.REACT_APP_LOCAL_RELAY_SERVER_URL || '';

import React, { useEffect, useRef, useCallback, useState } from 'react';

import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import { instructions } from '../utils/conversation_config.js';
import { WavRenderer } from '../utils/wav_renderer';

import { X, Zap, ArrowUp, ArrowDown } from 'react-feather';
import { Button } from '@/components/button/Button';
import { Toggle as ToggleButton } from '@/components/toggle/Toggle';

import {Toggle as Toggle} from "@/components/ui/toggle"
import { ToggleLeft, ToggleRight } from "lucide-react"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Mic, MessageSquare } from 'lucide-react'

import InternalHeader from '../components/internalheader/InternalHeader';
import LeftChatHistory from '../components/chathistory/ChatHistory';
import AIAgents from '../components/aiagents/AIAgents';
import { mockChatHistory } from '../data/mockChatHistory';
import { ChatHistory } from '../types/ChatHistory';
import { AIEntity, agents  } from '@/lib/data/ai-entities';
import { getChatConfig } from '@/lib/data/ai-entities';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button  as ButtonComponent} from "@/components/ui/button"
import { TextInput } from "@/components/TextInput"
import { Message } from "@/components/Message"

/**
 * Type for result from get_weather() function call
 */
interface Coordinates {
  lat: number;
  lng: number;
  location?: string;
  temperature?: {
    value: number;
    units: string;
  };
  wind_speed?: {
    value: number;
    units: string; 
  };
}


/**
 * Type for all event logs
 */
interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

interface Agent {
  id: string;
  name: string;
}

export default function ConsolePage() {
  /**
   * Ask user for API Key
   * If we're using the local relay server, we don't need this
   */
  const apiKey = LOCAL_RELAY_SERVER_URL
    ? ''
    : localStorage.getItem('tmp::voice_api_key') ||
      prompt('OpenAI API Key') ||
      '';

  // Ensure API key is saved immediately if provided
  useEffect(() => {
    if (apiKey && !LOCAL_RELAY_SERVER_URL) {
      localStorage.setItem('tmp::voice_api_key', apiKey);
    }
  }, [apiKey]);

  // Update client reference when API key changes
  useEffect(() => {
    clientRef.current = new RealtimeClient(
      LOCAL_RELAY_SERVER_URL 
        ? { url: LOCAL_RELAY_SERVER_URL } 
        : {
          apiKey: apiKey,
          dangerouslyAllowAPIKeyInBrowser: true,
        }
    );
  }, [apiKey]);

  const [history, setHistory] = React.useState<ChatHistory[]>(mockChatHistory);


  // Handle agent selection
  const onSelectAgent = (id: string) => {
    if (id === '') {
      setSelectedAgents([]); // Clear all agents
    } else {
      const agent = agents.find(a => a.id === id);
      if (agent) {
        // Check if agent is already selected
        if (selectedAgents.some(a => a.id === id)) {
          // Remove agent if already selected
          setSelectedAgents(selectedAgents.filter(a => a.id !== id));
        } else {
          // Add new agent to selected agents
          setSelectedAgents([...selectedAgents, agent]);
        }
      }
    }
  };
  /**
   * Instantiate:
   * - WavRecorder (speech input)
   * - WavStreamPlayer (speech output)
   * - RealtimeClient (API client)
   */
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      LOCAL_RELAY_SERVER_URL 
        ? { url: LOCAL_RELAY_SERVER_URL } 
        : {
          apiKey: apiKey,
          dangerouslyAllowAPIKeyInBrowser: true,
        }
    )
  );

  /**
   * References for
   * - Rendering audio visualization (canvas)
   * - Autoscrolling event logs
   * - Timing delta for event log displays
   */
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);
  const eventsScrollHeightRef = useRef(0);
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<string>(new Date().toISOString());

  /**
   * All of our variables for displaying application state
   * - items are all conversation items (dialog)
   * - realtimeEvents are event logs, which can be expanded
   * - memoryKv is for set_memory() function
   * - coords, marker are for get_weather() function
   */

  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [memoryKv, setMemoryKv] = useState<{ [key: string]: any }>({});
  const [coords, setCoords] = useState<Coordinates | null>({
    lat: 37.775593,
    lng: -122.418137,
  });
  const [marker, setMarker] = useState<Coordinates | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('theme');
      return savedMode === 'dark';
    }
    return false;
  });
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [showEventLog, setShowEventLog] = useState(true);
  const [communicationMode, setCommunicationMode] = useState<'text' | 'voice'>('text');

  /**
   * Utility for formatting the timing of logs
   */
  const formatTime = useCallback((timestamp: string) => {
    const startTime = startTimeRef.current;
    const t0 = new Date(startTime).valueOf();
    const t1 = new Date(timestamp).valueOf();
    const delta = t1 - t0;
    const hs = Math.floor(delta / 10) % 100;
    const s = Math.floor(delta / 1000) % 60;
    const m = Math.floor(delta / 60_000) % 60;
    const pad = (n: number) => {
      let s = n + '';
      while (s.length < 2) {
        s = '0' + s;
      }
      return s;
    };
    return `${pad(m)}:${pad(s)}.${pad(hs)}`;
  }, []);

  /**
   * When you click the API key
   */
  const resetAPIKey = useCallback(() => {
    const apiKey = prompt('OpenAI API Key');
    if (apiKey !== null) {
      localStorage.clear();
      localStorage.setItem('tmp::voice_api_key', apiKey);
      window.location.reload();
    }
  }, []);

  /**
   * Connect to conversation:
   * WavRecorder taks speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {
    try {
      const client = clientRef.current;
      
      // Set basic state variables
      startTimeRef.current = new Date().toISOString();
      setIsConnected(true);
      setRealtimeEvents([]);
      setItems(client.conversation.getItems());

      // Connect to realtime API
      await client.connect();

      // Update session based on mode
      await client.updateSession({ 
        input_audio_transcription: communicationMode === 'voice' ? { model: 'whisper-1' } : null,
        output_audio_encoding: communicationMode === 'voice' ? { model: 'tts-1' } : null
      });

      // Only initialize audio components in voice mode
      if (communicationMode === 'voice') {
        const wavRecorder = wavRecorderRef.current;
        const wavStreamPlayer = wavStreamPlayerRef.current;
        await wavRecorder.begin();
        await wavStreamPlayer.connect();
      }

      // Send initial message based on mode and agents
      const initialMessage = selectedAgents.length > 0
        ? `You are a multi-agent system consisting of: ${selectedAgents.map(agent => agent.name).join(', ')}. Combine your knowledge to answer the user's question.`
        : 'Hello! i want who you are?';

      await client.sendUserMessageContent([{
        type: 'input_text',
        text: initialMessage
      }]);

      // Only setup voice recording if in voice mode
      if (communicationMode === 'voice' && client.getTurnDetectionType() === 'server_vad') {
        const wavRecorder = wavRecorderRef.current;
        await wavRecorder.record((data) => client.appendInputAudio(data.mono));
      }

    } catch (error) {
      console.error('Connection error:', error);
      setIsConnected(false);
    }
  }, [selectedAgents, communicationMode]);

  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);
    setRealtimeEvents([]);
    setItems([]);
    setMemoryKv({});
    setCoords({
      lat: 37.775593,
      lng: -122.418137,
    });
    setMarker(null);

    const client = clientRef.current;
    client.disconnect();

    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.end();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  }, []);

  const deleteConversationItem = useCallback(async (id: string) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  /**
   * In push-to-talk mode, start recording
   * .appendInputAudio() for each sample
   */
  const startRecording = async () => {
    setIsRecording(true);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  };

  /**
   * In push-to-talk mode, stop recording
   */
  const stopRecording = async () => {
    setIsRecording(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    client.createResponse();
  };

  /**
   * Switch between Manual <> VAD mode for communication
   */
  const changeTurnEndType = async (value: string) => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    
    if (value === 'none' && wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }
    
    client.updateSession({
      turn_detection: value === 'none' ? null : { type: 'server_vad' },
    });
    
    if (value === 'server_vad' && client.isConnected()) {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
    
    setCanPushToTalk(value === 'none');
  };

  /**
   * Auto-scroll the event logs
   */
  useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      // Only scroll if height has just changed
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [realtimeEvents]);

  /**
   * Auto-scroll the conversation logs
   */
  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);

  /**
   * Set up render loops for the visualization canvas
   */
  useEffect(() => {
    let isLoaded = true;

    const wavRecorder = wavRecorderRef.current;
    const clientCanvas = clientCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;

    const wavStreamPlayer = wavStreamPlayerRef.current;
    const serverCanvas = serverCanvasRef.current;
    let serverCtx: CanvasRenderingContext2D | null = null;

    const render = () => {
      if (isLoaded) {
        if (clientCanvas) {
          if (!clientCanvas.width || !clientCanvas.height) {
            clientCanvas.width = clientCanvas.offsetWidth;
            clientCanvas.height = clientCanvas.offsetHeight;
          }
          clientCtx = clientCtx || clientCanvas.getContext('2d');
          if (clientCtx) {
            clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
            const result = wavRecorder.recording
              ? wavRecorder.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              clientCanvas,
              clientCtx,
              result.values,
              '#0099ff',
              10,
              0,
              8
            );
          }
        }
        if (serverCanvas) {
          if (!serverCanvas.width || !serverCanvas.height) {
            serverCanvas.width = serverCanvas.offsetWidth;
            serverCanvas.height = serverCanvas.offsetHeight;
          }
          serverCtx = serverCtx || serverCanvas.getContext('2d');
          if (serverCtx) {
            serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
            const result = wavStreamPlayer.analyser
              ? wavStreamPlayer.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              serverCanvas,
              serverCtx,
              result.values,
              '#009900',
              10,
              0,
              8
            );
          }
        }
        window.requestAnimationFrame(render);
      }
    };
    render();

    return () => {
      isLoaded = false;
    };
  }, []);

  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // Set instructions
    client.updateSession({ instructions: instructions });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    // Add tools
    client.addTool(
      {
        name: 'set_memory',
        description: 'Saves important data about the user into memory.',
        parameters: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description:
                'The key of the memory value. Always use lowercase and underscores, no other characters.',
            },
            value: {
              type: 'string',
              description: 'Value can be anything represented as a string',
            },
          },
          required: ['key', 'value'],
        },
      },
      async ({ key, value }: { [key: string]: any }) => {
        setMemoryKv((memoryKv) => {
          const newKv = { ...memoryKv };
          newKv[key] = value;
          return newKv;
        });
        return { ok: true };
      }
    );

    // handle realtime events from client + server for event logging

    client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents((realtimeEvents) => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          // if we receive multiple events in a row, aggregate them for display purposes
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });
    });
    client.on('error', (event: any) => console.error(event));
    client.on('conversation.interrupted', async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });
    client.on('conversation.updated', async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      if (communicationMode === 'voice' && delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === 'completed' && item.formatted.audio?.length && communicationMode === 'voice') {
        const wavFile = await WavRecorder.decode(
          item.formatted.audio,
          24000,
          24000
        );
        item.formatted.file = wavFile;
      }
      setItems(items);
    });

    setItems(client.conversation.getItems());

    return () => {
      // cleanup; resets to defaults
      client.reset();
    };
  }, [communicationMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleDragStart = (e: React.DragEvent, agentId: string) => {
    e.dataTransfer.setData('agentId', agentId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    try {
      const agentData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // Check if agent is already selected
      if (!selectedAgents.some(agent => agent.id === agentData.id)) {
        setSelectedAgents([...selectedAgents, agentData]);
        
        // Update conversation with new agent if already connected
        if (clientRef.current.isConnected()) {
          const newAgentConfig = getChatConfig(agentData.id);
          const combinedInstructions = selectedAgents.map(agent => {
            const config = getChatConfig(agent.id);
            return `${config.name}: ${config.description} ${config.initialPrompt}`;
          }).join('\n\n');
          
          clientRef.current.updateSession({
            instructions: `${combinedInstructions}\n\n${newAgentConfig.name}: ${newAgentConfig.description} ${newAgentConfig.initialPrompt}`
          });
        }
      }
    } catch (error) {
      console.error('Error parsing dropped agent data:', error);
    }
  };

  useEffect(() => {
    const client = clientRef.current;
    
    client.on('disconnect', async () => {
      console.log('Disconnected, attempting to reconnect...');
      setIsConnected(false);
      
      try {
        await client.connect();
        setIsConnected(true);
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    });
  }, []);

  const EventLogToggle = () => (
    <button
      onClick={() => setShowEventLog(prev => !prev)}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
    >
      {showEventLog ? (
        <>
          <ChevronUp className="h-4 w-4" />
          <span className="font-medium">Hide Events</span>
        </>
      ) : (
        <>
          <ChevronDown className="h-4 w-4" />
          <span className="font-medium">Show Events</span>
        </>
      )}
    </button>
  );

  const sendTextMessage = async (message: string) => {
    if (!clientRef.current.isConnected()) {
      console.error('Client not connected');
      return;
    }

    try {
      await clientRef.current.sendUserMessageContent([
        {
          type: 'input_text',
          text: message
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  /**
   * Render the application
   */
  //

  // Add connection state check
  const ensureConnection = async () => {
    if (!clientRef.current.isConnected()) {
      try {
        await clientRef.current.connect();
        setIsConnected(true);
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }
  };

return (
  <div className="h-full flex  flex-col overflow-hidden mx-2 bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 font-sans text-base">
    <div className="flex min-h-[60vh] justify-between ">
      {/* History */}
      <div className="min-h-[80vh] bg-gray-100">
        <LeftChatHistory history={history} />
      </div>

      {/* Content */}
      <div className="flex max-h-screen relative  w-full max-w-[740px]">
        <div className="flex flex-col flex-grow">
          <div className="max-h-20 pt-4">
            <InternalHeader 
              apiKey={apiKey}
              resetAPIKey={resetAPIKey}
              isLocalRelay={!!LOCAL_RELAY_SERVER_URL}
            /> 
          </div>

          <div 
            className="flex-grow flex overflow-hidden mx-4 mb-6 transition-all duration-200"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col flex-grow overflow-hidden ">
              {selectedAgents.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  {selectedAgents.map((agent) => (
                    <div 
                      key={agent.id}
                      className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify(agent));
                      }}
                    >
                      <span className="text-blue-500 font-semibold">{agent.name}</span>
                      <button 
                        onClick={() => onSelectAgent(agent.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative flex flex-col flex-1 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center py-4">
                  <div className="text-base font-medium">Events</div>
                  <EventLogToggle />
                </div>

                <div 
                  ref={eventsScrollRef} 
                  className={`flex-1 overflow-y-auto transition-all duration-300 ${
                    showEventLog ? 'max-h-[320px]' : 'max-h-[0px] overflow-hidden'
                  }`}
                >
                  {!realtimeEvents.length && (
                    <div className="text-gray-500">awaiting connection...</div>
                  )}
                  {realtimeEvents.map((realtimeEvent, i) => {
                    const count = realtimeEvent.count;
                    const event = { ...realtimeEvent.event };
                    if (event.type === 'input_audio_buffer.append') {
                      event.audio = `[trimmed: ${event.audio.length} bytes]`;
                    } else if (event.type === 'response.audio.delta') {
                      event.delta = `[trimmed: ${event.delta.length} bytes]`;
                    }
                    return (
                      <div key={event.event_id} className="whitespace-pre flex gap-4 p-0">
                        <div className="text-left gap-2 py-1 w-20 flex-shrink-0 mr-4">
                          {formatTime(realtimeEvent.time)}
                        </div>
                        <div className="flex flex-col text-zinc-900 dark:text-zinc-100 gap-2">
                          <div
                            className="p-1 -mx-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
                            onClick={() => {
                              const id = event.event_id;
                              const expanded = { ...expandedEvents };
                              expanded[id] = !expanded[id];
                              setExpandedEvents(expanded);
                            }}
                          >
                            <div className={`flex-shrink-0 flex items-center gap-2 
                              ${event.type === 'error' 
                                ? 'text-red-600' 
                                : realtimeEvent.source === 'client'
                                ? 'text-blue-500'
                                : 'text-green-600'}`}
                            >
                              {realtimeEvent.source === 'client' ? <ArrowUp className="w-3 h-3 stroke-[3]" /> : <ArrowDown className="w-3 h-3 stroke-[3]" />}
                              <span>
                                {event.type === 'error' ? 'error!' : realtimeEvent.source}
                              </span>
                            </div>
                            <div className="event-type">
                              {event.type}
                              {count && ` (${count})`}
                            </div>
                          </div>
                          {!!expandedEvents[event.event_id] && (
                            <div className="text-gray-500 dark:text-gray-400">
                              {JSON.stringify(event, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`flex-shrink-0 transition-all duration-300 ${
                  showEventLog 
                    ? 'h-[180px]' // Original height when events are shown
                    : 'h-[500px]' // Increased height (200px + 340px) when events are hidden
                } border-t border-gray-200 dark:border-gray-700 flex flex-col`}
              >
                <div className="text-base pt-4 pb-1">conversation</div>
                <ScrollArea className="flex-1">
                  <div className="flex flex-col gap-2 p-4">
                    {!items.length && (
                      <div className="text-center text-gray-500">
                        Start a conversation...
                      </div>
                    )}
                    {items.map((item) => (
                      <Message
                        key={item.id}
                        role={item.role || 'assistant'}
                        content={
                          item.formatted.transcript ||
                          item.formatted.text ||
                          (item.formatted.audio?.length ? '(processing audio...)' : '')
                        }
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col gap-4 p-2 border-t border-gray-200 dark:border-gray-700 mb-20">
                <div className="flex items-center justify-between mb-4">
                  <Toggle 
                    pressed={communicationMode === 'voice'}
                    onPressedChange={async (pressed) => {
                      setCommunicationMode(pressed ? 'voice' : 'text');
                      
                      try {
                        // Ensure connection is maintained
                        await ensureConnection();

                        // Update session config
                        await clientRef.current.updateSession({ 
                          input_audio_transcription: pressed ? { model: 'whisper-1' } : null,
                          output_audio_encoding: pressed ? { model: 'tts-1' } : null
                        });

                        // Handle audio components
                        if (pressed) {
                          await wavRecorderRef.current.begin();
                          await wavStreamPlayerRef.current.connect();
                        } else {
                          await wavRecorderRef.current.end();
                          await wavStreamPlayerRef.current.interrupt();
                        }
                      } catch (error) {
                        console.error('Error switching modes:', error);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 ${
                      communicationMode === 'voice' 
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {communicationMode === 'voice' ? (
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        <span>Voice Mode Active</span>
                        <ToggleRight className="h-4 w-4 ml-2" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Text Mode Active</span>
                        <ToggleLeft className="h-4 w-4 ml-2" />
                      </div>
                    )}
                  </Toggle>

                  <ButtonComponent
                    className="rounded-full"
                    variant={isConnected ? "outline" : "default"}
                    onClick={isConnected ? disconnectConversation : connectConversation}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                    {isConnected ? <X className="ml-2 h-4 w-4" /> : <Zap className="ml-2 h-4 w-4" />}
                  </ButtonComponent>
                </div>

                {/* Controls with fixed bottom margin */}
                {communicationMode === 'voice' ? (
                  <div className="flex items-center justify-center gap-4">
                    <ToggleButton
                      defaultValue={false}
                      labels={['manual', 'vad']}
                      values={['none', 'server_vad']}
                      onChange={(_, value) => changeTurnEndType(value)}
                      
                    />

                    {isConnected && canPushToTalk && (
                      <ButtonComponent
                        variant={isRecording ? "destructive" : "secondary"}
                        disabled={!isConnected || !canPushToTalk}
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        className="rounded-full"
                      >
                        {isRecording ? 'Release to send' : 'Push to talk'}
                      </ButtonComponent>
                    )}
                  </div>
                ) : (
                  <div className="fixed bottom-4 left-0 right-0 px-4 max-w-[740px] mx-auto">
                    <TextInput 
                      onSendMessage={sendTextMessage}
                      disabled={!isConnected}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agents */}
      <div className="flex-grow bg-gray-100  pl-2 right-0 max-w-[300px]">
        <AIAgents 
          agents={agents} 
          onSelectAgent={onSelectAgent}
          selectedAgentIds={selectedAgents.map(agent => agent.id)} 
        />
      </div>
    </div>
  </div>
);
}
