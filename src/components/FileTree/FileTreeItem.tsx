import clsx from 'clsx';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import type { FileNode } from '../../types';
import { getFileBadge } from '../Editor/languages';

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  activePath: string | null;
  expandedPaths: string[];
  onToggleFolder: (path: string) => void;
  onOpenFile: (path: string) => void;
  onLongPressStart: (event: React.PointerEvent, node: FileNode) => void;
  onLongPressEnd: () => void;
}

export function FileTreeItem({
  node,
  depth,
  activePath,
  expandedPaths,
  onToggleFolder,
  onOpenFile,
  onLongPressStart,
  onLongPressEnd,
}: FileTreeItemProps) {
  const isDirectory = node.type === 'directory';
  const isExpanded = expandedPaths.includes(node.path);
  const isActive = activePath === node.path;
  const badge = getFileBadge(node.path);

  return (
    <div>
      <button
        type="button"
        className={clsx(
          'flex h-7 w-full items-center gap-1.5 px-2 text-left text-[12px] text-codex-text transition-colors',
          isActive && 'bg-codex-selected text-white',
          !isActive && 'active:bg-codex-hover',
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={() => (isDirectory ? onToggleFolder(node.path) : onOpenFile(node.path))}
        onPointerDown={(event) => onLongPressStart(event, node)}
        onPointerUp={onLongPressEnd}
        onPointerLeave={onLongPressEnd}
        onPointerCancel={onLongPressEnd}
      >
        {isDirectory ? (
          <>
            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            <Folder size={13} className="text-codex-muted" />
          </>
        ) : (
          <>
            <span className="w-[13px]" />
            <File size={13} className="text-codex-muted" />
          </>
        )}
        {!isDirectory && (
          <span
            className="grid h-4 min-w-5 place-items-center rounded-[3px] px-1 text-[8px] font-semibold leading-none text-black"
            style={{ backgroundColor: badge.color }}
          >
            {badge.label}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        {node.modified && <span className="h-1.5 w-1.5 rounded-full bg-codex-accent" />}
      </button>

      {isDirectory && isExpanded && node.children?.map((child) => (
        <FileTreeItem
          key={child.id}
          node={child}
          depth={depth + 1}
          activePath={activePath}
          expandedPaths={expandedPaths}
          onToggleFolder={onToggleFolder}
          onOpenFile={onOpenFile}
          onLongPressStart={onLongPressStart}
          onLongPressEnd={onLongPressEnd}
        />
      ))}
    </div>
  );
}
