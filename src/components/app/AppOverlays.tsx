"use client";

import { CommandPalette } from "@/components/app/CommandPalette";
import { SaveErrorBanner } from "@/components/app/SaveErrorBanner";
import { ShortcutsDialog } from "@/components/app/ShortcutsDialog";
import { ContextMenuHost } from "@/components/ui/ContextMenu";
import { SHORTCUTS } from "@/helpers/shortcuts";
import { useHotkeys } from "@/helpers/use-hotkeys";
import { useBoardsSync } from "@/store/boards";
import { openPalette, openShortcuts } from "@/store/ui";

/** App-wide layers and listeners: palette, context menu, shortcut guide, cross-tab sync, save errors. */
export function AppOverlays() {
  useHotkeys([
    { keys: SHORTCUTS.palette.keys, handler: openPalette, inFields: true },
    { keys: SHORTCUTS.help.keys, handler: openShortcuts },
  ]);
  useBoardsSync();

  return (
    <>
      <ContextMenuHost />
      <CommandPalette />
      <ShortcutsDialog />
      <SaveErrorBanner />
    </>
  );
}
