import { Tab } from './Tab';
import { useEditorStore } from '../../store/editorStore';

export function TabBar() {
  const openFiles = useEditorStore((state) => state.openFiles);
  const currentFileId = useEditorStore((state) => state.currentFileId);
  const switchTab = useEditorStore((state) => state.switchTab);
  const closeTab = useEditorStore((state) => state.closeTab);

  return (
    <div className="scrollbar-none flex h-[42px] min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
      {openFiles.map((file) => (
        <Tab
          key={file.id}
          file={file}
          active={file.id === currentFileId}
          onSelect={switchTab}
          onClose={closeTab}
        />
      ))}
    </div>
  );
}
