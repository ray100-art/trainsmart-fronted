import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex h-10 items-center justify-start gap-1 rounded-lg bg-gray-100 p-1',
        'w-full overflow-x-auto',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium',
        'text-gray-600 transition-all data-[state=active]:bg-white data-[state=active]:text-brand-700 data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: TabsPrimitive.TabsContentProps) {
  return <TabsPrimitive.Content className={cn('mt-4 focus-visible:outline-none', className)} {...props} />
}
