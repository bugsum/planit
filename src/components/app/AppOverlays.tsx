"use client";

import { ShortcutsDialog } from "@/components/app/ShortcutsDialog";
import { ContextMenuHost } from "@/components/ui/ContextMenu";
import { SHORTCUTS } from "@/helpers/shortcuts";
import { useHotkeys } from "@/helpers/use-hotkeys";
import { openShortcuts } from "@/store/ui";

/** App-wide layers: the shared context menu, the shortcut guide and its hotkey. */
export function AppOverlays() {
  useHotkeys([{ keys: SHORTCUTS.help.keys, handler: openShortcuts }]);

  return (
    <>
      <ContextMenuHost />
      <ShortcutsDialog />
    </>
  );
}
