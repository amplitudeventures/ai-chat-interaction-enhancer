'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AIEntity, assistants, agents } from '@/lib/data/ai-entities';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const FormSchema = z.object({
  assistant: z.string({
    required_error: "Please select an assistant.",
  }),
})

interface Configuration {
  id: string;
  userId: string;
  entityId: string;
  entity: AIEntity;
}

export function ConfigureSettings() {
  const [configuredEntities, setConfiguredEntities] = useState<AIEntity[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  // Fetch configurations from database
  useEffect(() => {
    if (initRef.current) return;
    
    const abortController = new AbortController();
    
    const fetchUserConfigurations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/configurations', {
          signal: abortController.signal,
          cache: 'no-store'
        });
        
        if (!response.ok) throw new Error('Failed to fetch configurations');
        const { configurations } = await response.json();
        
        // Use the entities directly from the database response
        const userEntities = configurations.map((config: Configuration) => config.entity);
        
        setConfiguredEntities(userEntities.sort((a: AIEntity, b: AIEntity) => (a.order || 0) - (b.order || 0)));
        initRef.current = true;
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Error loading configurations:', error);
        setError('Failed to load configurations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserConfigurations();

    return () => {
      abortController.abort();
    };
  }, []);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await fetch('/api/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entities: [{ id: data.assistant }] // Match the expected format in the API
        }),
      });

      if (!response.ok) throw new Error('Failed to save configuration');
      const result = await response.json();

      // Refresh the configurations list
      initRef.current = false;
      const newEntity = result.configurations[0].entity;
      if (newEntity) {
        setConfiguredEntities(prev => [...prev, newEntity]);
      }
      setIsPopoverOpen(false);
    } catch (err) {
      console.error('Error saving configuration:', err);
      setError('Failed to save configuration');
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8 px-16 py-8">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          <Image src="/images/image.png" alt="Avatar" width={56} height={56} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Your Workspace</h1>
          <div className="flex gap-2 py-2">
            <span className="px-3 py-1 bg-gray-100 rounded-md text-sm">Configurable</span>
            <span className="px-3 py-1 bg-gray-100 rounded-md text-sm">Dynamic</span>
          </div>
          <p className="text-gray-800">Add, activate or deactivate assistants as needed</p>
        </div>
      </div>

      <div className="bg-[#8B1F2F] text-white p-8 rounded-2xl">
        <h2 className="text-3xl font-semibold text-center mb-2">Configure Assistant Settings</h2>
        <p className="text-center mb-12">Customize assistant features</p>
        
        <div className="max-w-3xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex gap-8 mb-8">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="assistant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Assistant Name</FormLabel>
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between bg-[#FFF8DC] text-black hover:bg-[#FFF8DC]/90",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? [...agents, ...assistants].find(
                                      (entity) => entity.id === field.value
                                    )?.name
                                  : "Select assistant..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search assistant..." />
                              <CommandList>
                                {isLoading ? (
                                  <div className="p-4 text-center text-sm text-gray-500">
                                    Loading configurations...
                                  </div>
                                ) : error ? (
                                  <div className="p-4 text-center text-sm text-red-500">
                                    {error}
                                  </div>
                                ) : (
                                  <>
                                    <CommandEmpty>No assistant found.</CommandEmpty>
                                    <CommandGroup>
                                      {[...agents, ...assistants]
                                        .filter(entity => !configuredEntities.some(configured => configured.id === entity.id))
                                        .map((entity) => (
                                          <CommandItem
                                            value={entity.name}
                                            key={entity.id}
                                            onSelect={() => {
                                              form.setValue("assistant", entity.id);
                                              setIsPopoverOpen(false);
                                            }}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-xl">{entity.icon}</span>
                                              <span>{entity.name}</span>
                                            </div>
                                            <Check
                                              className={cn(
                                                "ml-auto",
                                                entity.id === field.value
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                          </CommandItem>
                                        ))}
                                    </CommandGroup>
                                  </>
                                )}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {error && (
                          <div className="text-red-500 text-sm mt-1">{error}</div>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block mb-4">Settings</label>
                  <div className="flex gap-4">
                    <button className="flex-1 bg-[#F4A460] text-white py-3 rounded-lg">
                      Activate
                    </button>
                    <button className="flex-1 bg-[#8B1F2F] text-white py-3 rounded-lg border border-white">
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  className="w-1/3 bg-[#1A1A1A]"
                  disabled={isLoading}
                >
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
} 