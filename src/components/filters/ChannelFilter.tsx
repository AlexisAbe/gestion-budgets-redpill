
import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { MediaChannel } from '@/types/campaign';

// All possible media channels from the type
const ALL_CHANNELS: MediaChannel[] = [
  "META", "GOOGLE", "LINKEDIN", "TWITTER", "DISPLAY", "EMAIL", "OTHER"
];

interface ChannelFilterProps {
  selectedChannels: MediaChannel[];
  onChange: (channels: MediaChannel[]) => void;
}

export function ChannelFilter({ selectedChannels, onChange }: ChannelFilterProps) {
  const isAllSelected = selectedChannels.length === ALL_CHANNELS.length;
  
  // Toggle a single channel
  const toggleChannel = (channel: MediaChannel) => {
    if (selectedChannels.includes(channel)) {
      onChange(selectedChannels.filter(c => c !== channel));
    } else {
      onChange([...selectedChannels, channel]);
    }
  };

  // Toggle all channels
  const toggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...ALL_CHANNELS]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Filter className="h-4 w-4" />
          <span>Channels</span>
          {selectedChannels.length > 0 && selectedChannels.length < ALL_CHANNELS.length && (
            <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[10px] flex items-center justify-center text-primary-foreground">
              {selectedChannels.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuCheckboxItem
          checked={isAllSelected}
          onSelect={(event) => {
            event.preventDefault();
            toggleAll();
          }}
        >
          All Channels
        </DropdownMenuCheckboxItem>
        
        {ALL_CHANNELS.map(channel => (
          <DropdownMenuCheckboxItem
            key={channel}
            checked={selectedChannels.includes(channel)}
            onSelect={(event) => {
              event.preventDefault();
              toggleChannel(channel);
            }}
          >
            {channel}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
