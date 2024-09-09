
import * as React from 'react'
import { cn } from "@/lib/utils"

import { Check, X, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge";


export type OptionType = {
  label: string;
  id: number;
}

interface MultiSelectProps {
  options: OptionType[];
  selected: number[];
  onChange: (selected: number[]) => void;
  className?: string;
}
function MultiSelect({ options = [], selected = [], onChange, className, ...props }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: number) => {
    onChange(selected.filter((i) => i !== item))
  }

  console.log('options ', options)
  const validOptions = Array.isArray(options) ? options : [];

  return (
      <Popover open={open} onOpenChange={setOpen} {...props}>
          <PopoverTrigger asChild>
              <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={`w-full justify-between ${selected.length > 1 ? "h-full" : "h-10"}`}
                  onClick={() => setOpen(!open)}
              >
                  <div className="flex gap-1 flex-wrap">
                      {selected.map((item) => (
                          <Badge
                              variant="secondary"
                              key={item}
                              className="mr-1 mb-1"
                              onClick={() => handleUnselect(item)}
                          >
                              {item}
                              <button
                                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                          handleUnselect(item);
                                      }
                                  }}
                                  onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                  }}
                                  onClick={() => handleUnselect(item)}
                              >
                                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </button>
                          </Badge>
                      ))}
                  </div>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
              <Command className={className}>
                  <CommandInput placeholder="Search ..." />
                  <CommandEmpty>No item found.</CommandEmpty>
                  <CommandGroup>
                    {validOptions.map((o: OptionType) => (
                      <CommandItem
                        key={o.id}
                        value={o.label}
                        onSelect={(currentValue) => {
                          setOpen(false);
                        }}
                      >
                        {o.label}
                        <Check
                          className={cn(
                            "h-4 w-4 ml-auto",
                            selected.includes(o.id) ? "text-accent-foreground" : "text-transparent"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
              </Command>
          </PopoverContent>
      </Popover>
  )
}

export { MultiSelect }
