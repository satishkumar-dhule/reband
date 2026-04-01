import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm border-collapse", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "[&_tr]:border-b border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)]", 
      className
    )} 
    {...props} 
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-[var(--gh-border)] transition-colors hover:bg-[var(--gh-canvas-subtle)] data-[state=selected]:bg-[var(--gh-accent-subtle)]",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-4 py-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-[var(--gh-fg-muted)] [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-3 align-middle text-sm text-[var(--gh-fg)] [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-[var(--gh-fg-muted)]", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// Sortable column header with indicator
export interface TableHeadSortableProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  direction?: 'asc' | 'desc' | null;
  sortable?: boolean;
}

const TableHeadSortable = React.forwardRef<HTMLTableCellElement, TableHeadSortableProps>(
  ({ className, direction, sortable, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-10 px-4 py-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-[var(--gh-fg-muted)] cursor-pointer select-none transition-colors hover:text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-overlay)] [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <span className="inline-flex flex-col opacity-50">
            <svg 
              className={cn("h-2 w-2", direction === 'asc' && "text-[var(--gh-accent-fg)] opacity-100")} 
              viewBox="0 0 8 8" 
              fill="currentColor"
            >
              <path d="M4 2L7 6H1L4 2Z" />
            </svg>
            <svg 
              className={cn("h-2 w-2 -mt-0.5", direction === 'desc' && "text-[var(--gh-accent-fg)] opacity-100")} 
              viewBox="0 0 8 8" 
              fill="currentColor"
            >
              <path d="M4 6L1 2H7L4 6Z" />
            </svg>
          </span>
        )}
      </span>
    </th>
  )
)
TableHeadSortable.displayName = "TableHeadSortable"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableHeadSortable,
}
