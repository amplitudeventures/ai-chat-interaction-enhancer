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

import InternalHeader from '../components/internalheader/InternalHeader';
import LeftChatHistory from '../components/chathistory/ChatHistory';
import AIAgents from '../components/aiagents/AIAgents';
import { mockChatHistory } from '../data/mockChatHistory';
import { ChatHistory } from '../types/ChatHistory';
import { AIEntity, agents  } from '@/lib/data/ai-entities';
import { getChatConfig } from '@/lib/data/ai-entities';

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
    console.log("Selected Agent ID:", id);
    if (id === '') {
      setSelectedAgent(null); // Deselect when empty string is passed
    } else {
      const agent = agents.find(a => a.id === id);  
      if (agent) {
        setSelectedAgent(agent);
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
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showEventLog, setShowEventLog] = useState(true);

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
      const wavRecorder = wavRecorderRef.current;
      const wavStreamPlayer = wavStreamPlayerRef.current;

    // Set state variables
    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    setRealtimeEvents([]);
    setItems(client.conversation.getItems());

    // Connect to microphone
    await wavRecorder.begin();

      // Connect to audio output
      await wavStreamPlayer.connect();

      // Connect to realtime API
      await client.connect();

      // Configure AI based on selected agent/assistant
      if (selectedAgent) {
        try {
          const config = getChatConfig(selectedAgent.id);
          
          // Update session with entity-specific instructions
          await client.updateSession({ 
            instructions: config.initialPrompt
          });

          // Send dynamic initialization message
          const initializationMessage = `You are now ${config.name}. ${config.description} ${config.initialPrompt} Please introduce yourself and start helping according to your role.`;
          client.sendUserMessageContent([
            {
              type: 'input_text',
              text: initializationMessage
            }
          ]);
        } catch (error) {
          console.error('Error configuring AI:', error);
          // Fallback to default greeting
          client.sendUserMessageContent([
            {
              type: 'input_text',
              text: 'Hello! I am a general AI assistant. How can I help you today?'
            }
          ]);
        }
      } else {
        // No agent selected, use default greeting
        client.sendUserMessageContent([
          {
            type: 'input_text',
            text: 'Hello! I am a general AI assistant. How can I help you today?'
          }
        ]);
      }

      if (client.getTurnDetectionType() === 'server_vad') {
        await wavRecorder.record((data) => client.appendInputAudio(data.mono));
      }
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnected(false);
    }
  }, []);

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
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === 'completed' && item.formatted.audio?.length) {
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
  }, []);

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
        setSelectedAgent(agentData);

        // Update the AI's instructions with your specific format
        const client = clientRef.current;
        const agentInstructions = `${agentData.description} this means the user know you as you expert in this area therefore when you start the conversation start by saying i am ia agent and my profession is ${agentData.name}, how can i help you with my profession`;

        // Update the session with new instructions
        client.updateSession({ 
            instructions: agentInstructions 
        });

        // Send a message to introduce the agent with the new format
        const introductionMessage = `I am ia agent and my profession is ${agentData.name}, how can I help you with my profession?`;
        client.sendUserMessageContent([
            { 
                type: 'input_text', 
                text: introductionMessage 
            }
        ]);

        console.log('Agent persona activated:', agentData);
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

  /**
   * Render the application
   */
  //

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
              {selectedAgent && (
                <div 
                  className="p-3 bg-gray-50 border-b border-gray-200 cursor-move hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(selectedAgent));
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Selected Agent:</span>
                    <span className="text-blue-500 font-semibold">{selectedAgent.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">(Drag to remove)</span>
                  </div>
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
                    ? 'h-[200px]' // Original height when events are shown
                    : 'h-[500px]' // Increased height (200px + 340px) when events are hidden
                } border-t border-gray-200 dark:border-gray-700 flex flex-col`}
              >
                <div className="text-base pt-4 pb-1">conversation</div>
                <div className="flex-1 overflow-y-auto" data-conversation-content>
                  {!items.length && (
                    <div className="text-gray-500">awaiting connection...</div>
                  )}
                  {items.map((conversationItem) => (
                    <div key={conversationItem.id} className="relative flex gap-4 mb-4">
                      <div className={`text-left w-20 flex-shrink-0 mr-4 
                        ${conversationItem.role === 'user' ? 'text-blue-500' : 'text-green-600'}`}>
                        <div>
                          {(conversationItem.role || conversationItem.type).replaceAll('_', ' ')}
                        </div>
                        <div
                          className="absolute top-0 right-[-20px] bg-gray-400 text-white  rounded-full p-0.5 cursor-pointer hover:bg-gray-600 hidden group-hover:flex"
                          onClick={() => deleteConversationItem(conversationItem.id)}
                        >
                          <X className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                      <div className="text-zinc-900 dark:text-zinc-100 overflow-hidden break-words">
                        {conversationItem.type === 'function_call_output' && (
                          <div>{conversationItem.formatted.output}</div>
                        )}
                        {!!conversationItem.formatted.tool && (
                          <div>
                            {conversationItem.formatted.tool.name}(
                            {conversationItem.formatted.tool.arguments})
                          </div>
                        )}
                        {!conversationItem.formatted.tool && conversationItem.role === 'user' && (
                          <div>
                            {conversationItem.formatted.transcript ||
                              (conversationItem.formatted.audio?.length
                                ? '(awaiting transcript)'
                                : conversationItem.formatted.text ||
                                '(item sent)')}
                          </div>
                        )}
                        {!conversationItem.formatted.tool && conversationItem.role === 'assistant' && (
                          <div>
                            {conversationItem.formatted.transcript ||
                              conversationItem.formatted.text ||
                              '(truncated)'}
                          </div>
                        )}
                        {conversationItem.formatted.file && (
                          <audio
                            src={conversationItem.formatted.file.url}
                            controls
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 py-4">
                <ToggleButton
                  defaultValue={false}
                  labels={['manual', 'vad']}
                  values={['none', 'server_vad']}
                  onChange={(_, value) => changeTurnEndType(value)}
                />

                <div className="flex-grow" />

                {isConnected && canPushToTalk && (
                  <Button
                    label={isRecording ? 'release to send' : 'push to talk'}
                    buttonStyle={isRecording ? 'alert' : 'regular'}
                    disabled={!isConnected || !canPushToTalk}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                  />
                )}

                <div className="flex-grow" />

                <Button
                  label={isConnected ? 'disconnect' : 'connect'}
                  iconPosition={isConnected ? 'end' : 'start'}
                  icon={isConnected ? X : Zap}
                  buttonStyle={isConnected ? 'regular' : 'action'}
                  onClick={isConnected ? disconnectConversation : connectConversation}
                />
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
          selectedAgentId={selectedAgent?.id} 
        />
      </div>
    </div>
  </div>
);
}
