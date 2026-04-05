/**
 * ============================================================
 *  UI Component Library — single import source for all pages
 *
 *  Usage:  import { Button, Card, AppLayout, ... } from '@/lib/ui';
 *
 *  All pages MUST import components from this file only.
 *  To add a new component: export it here first, then use it.
 * ============================================================
 */

// ─── Shadcn / Radix Primitives ────────────────────────────────────────────────

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
export {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
export { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export { AspectRatio } from '@/components/ui/aspect-ratio';
export { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
export { Badge, badgeVariants } from '@/components/ui/badge';
export {
  Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
export { ButtonGroup } from '@/components/ui/button-group';
export { Button as ShadButton, buttonVariants } from '@/components/ui/button';
export { Calendar } from '@/components/ui/calendar';
export { Callout } from '@/components/ui/Callout';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
export { ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
export { Checkbox } from '@/components/ui/checkbox';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
export {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from '@/components/ui/command';
export {
  ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup,
  ContextMenuItem, ContextMenuLabel, ContextMenuPortal, ContextMenuRadioGroup,
  ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut,
  ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger,
} from '@/components/ui/context-menu';
export {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
export {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
export { Empty } from '@/components/ui/empty';
export { EnhancedCodeBlock } from '@/components/ui/enhanced-code-block';
export { Field } from '@/components/ui/field';
export {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
  useFormField,
} from '@/components/ui/form';
export { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
export { InputGroup } from '@/components/ui/input-group';
export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
export { Input } from '@/components/ui/input';
export { Item } from '@/components/ui/item';
export { Kbd } from '@/components/ui/kbd';
export { Label } from '@/components/ui/label';
export {
  Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem,
  MenubarLabel, MenubarMenu, MenubarPortal, MenubarRadioGroup, MenubarRadioItem,
  MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger,
} from '@/components/ui/menubar';
export {
  NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
export {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
export { Progress } from '@/components/ui/progress';
export { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
export { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
export { Separator } from '@/components/ui/separator';
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
export { SidebarProvider, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
export { Skeleton } from '@/components/ui/skeleton';
export { Slider } from '@/components/ui/slider';
export { Toaster as Sonner } from '@/components/ui/sonner';
export { Spinner } from '@/components/ui/spinner';
export { Switch } from '@/components/ui/switch';
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export { Textarea } from '@/components/ui/textarea';
export { Toaster } from '@/components/ui/toaster';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
export { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
export { Toggle, toggleVariants } from '@/components/ui/toggle';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ─── Layout ───────────────────────────────────────────────────────────────────

export { AppLayout } from '@/components/layout/AppLayout';
export { MobileHeader } from '@/components/layout/MobileHeader';
export { TopBar } from '@/components/layout/TopBar';
export { DesktopSidebarWrapper } from '@/components/layout/DesktopSidebarWrapper';

// ─── Unified Design-System Components ─────────────────────────────────────────

export {
  Card as UnifiedCard,
  CardHeader as UnifiedCardHeader,
  CardFooter as UnifiedCardFooter,
  CardSection, InteractiveCard, StatCard, EmptyCard,
  type CardVariant, type CardSize, type CardRounded,
} from '@/components/unified/Card';

export {
  Button, MotionButton, IconButton,
  type ButtonVariant, type ButtonSize, type ButtonRounded,
} from '@/components/unified/Button';

export {
  ProgressBar, SegmentedProgressBar,
  type ProgressBarSize, type ProgressBarVariant,
} from '@/components/unified/ProgressBar';

export {
  DifficultyBadge, DifficultyIndicator, DifficultyProgress,
  type DifficultyLevel, type DifficultyBadgeSize, type DifficultyBadgeVariant,
} from '@/components/unified/DifficultyBadge';

export {
  QuestionCard, CompactQuestionCard, MinimalQuestionCard,
  type QuestionCardVariant, type QuestionCardSize,
} from '@/components/unified/QuestionCard';

export {
  QuestionHistoryIcon,
  type QuestionType, type EventType, type EventSource, type HistoryRecord, type HistorySummary,
} from '@/components/unified/QuestionHistory';

export {
  MetricCard, CompactMetricCard, MetricGrid,
  type MetricCardVariant, type MetricCardSize,
} from '@/components/unified/MetricCard';

export {
  EmptyState, CompactEmptyState, EmptyStateCard,
  type EmptyStateVariant, type EmptyStateSize,
} from '@/components/unified/EmptyState';

export { AchievementCard, AchievementGrid } from '@/components/unified/AchievementCard';
export { LevelDisplay, LevelBadge } from '@/components/unified/LevelDisplay';
export { SkipLink } from '@/components/unified/SkipLink';
export { Box } from '@/components/unified/Box';

// Voice recording
export { RecordingPanel } from '@/components/unified/RecordingPanel';
export { RecordingControls } from '@/components/unified/RecordingControls';
export { RecordingTimer } from '@/components/unified/RecordingTimer';
export { TranscriptDisplay } from '@/components/unified/TranscriptDisplay';
export { WordCountProgress } from '@/components/unified/WordCountProgress';

// ─── Shared Components ────────────────────────────────────────────────────────

export { UnifiedAnswerPanel } from '@/components/shared/UnifiedAnswerPanel';
export { UnifiedMetadataBar } from '@/components/shared/UnifiedMetadataBar';
export { UnifiedProgressBar } from '@/components/shared/UnifiedProgressBar';
export { UnifiedQuestionPanel } from '@/components/shared/UnifiedQuestionPanel';
export { UnifiedQuestionView } from '@/components/shared/UnifiedQuestionView';
export { VirtualizedList } from '@/components/shared/VirtualizedList';

// ─── Skeletons ────────────────────────────────────────────────────────────────

export {
  GenericPageSkeleton,
  HomeSkeleton,
  QuestionViewerSkeleton,
  ReviewSkeleton,
  StatsSkeleton,
  VoiceSkeleton,
  CertificationsSkeleton,
  ChannelsSkeleton,
} from '@/components/skeletons/PageSkeletons';

// ─── Feature Components ───────────────────────────────────────────────────────

export { SEOHead } from '@/components/SEOHead';
export { CodeBlock, InlineCodeBlock, MinimalCodeBlock } from '@/components/CodeBlock';
export { CodeEditor } from '@/components/CodeEditor';
export { ComingSoon } from '@/components/ComingSoon';
export { CreditsDisplay } from '@/components/CreditsDisplay';
export { ListenButton, ListenIconButton } from '@/components/ListenButton';
export { UnifiedSearch } from '@/components/UnifiedSearch';
export { VoiceReminder } from '@/components/VoiceReminder';
export { AnswerPanel } from '@/components/AnswerPanel';
export { QuestionPanel } from '@/components/QuestionPanel';
export { ErrorBoundary, useErrorBoundary, PageErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundary';
export { MermaidDiagram } from '@/components/MermaidDiagram';
export { RichTextRenderer } from '@/components/RichTextRenderer';
export { SearchModal } from '@/components/SearchModal';
export { ThemeToggle } from '@/components/ThemeToggle';
export { mascotEvents } from '@/components/PixelMascot';
export { default as PixelMascot } from '@/components/PixelMascot';
export { Confetti } from '@/components/Confetti';
export { ProgressRing } from '@/components/ProgressRing';
export { BadgeRing, BadgeGrid, BadgeShowcase, NextBadgeProgress } from '@/components/BadgeDisplay';
export { BadgeWidget } from '@/components/BadgeWidget';

// ─── Coding Components ────────────────────────────────────────────────────────

export { ChallengeCard } from '@/components/coding/ChallengeCard';
export { DiffBadge, diffColor } from '@/components/coding/DiffBadge';
export { LiveTimer } from '@/components/coding/LiveTimer';
export { TestOutputPanel } from '@/components/coding/TestOutputPanel';

// ─── Gen Z Components ─────────────────────────────────────────────────────────

export { GenZCard, GenZButton, GenZProgress, GenZTimer } from '@/components/genz';
