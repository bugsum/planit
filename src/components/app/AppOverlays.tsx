"use client";

import { SaveErrorBanner } from "@/components/app/SaveErrorBanner";
import { ShortcutsDialog } from "@/components/app/ShortcutsDialog";
import { ContextMenuHost } from "@/components/ui/ContextMenu";
import { SHORTCUTS } from "@/helpers/shortcuts";
import { useHotkeys } from "@/helpers/use-hotkeys";
import { useBoardsSync } from "@/store/boards";
import { openShortcuts } from "@/store/ui";

/** App-wide layers and listeners: context menu, shortcut guide, cross-tab sync, save errors. */
export function AppOverlays() {
  useHotkeys([{ keys: SHORTCUTS.help.keys, handler: openShortcuts }]);
  useBoardsSync();

  return (
    <>
      <ContextMenuHost />
      <ShortcutsDialog />
      <SaveErrorBanner />
    </>
  );
}
