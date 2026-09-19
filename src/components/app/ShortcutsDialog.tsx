"use client";

import { Fragment } from "react";
import { Combo, Kbd } from "@/components/ui/Kbd";
import { Modal } from "@/components/ui/Modal";
import { SHORTCUT_GROUPS, shortcutsIn } from "@/helpers/shortcuts";
import { useUiStore } from "@/store/ui";

export function ShortcutsDialog() {
  const open = useUiStore((state) => state.shortcutsOpen);
  const setOpen = useUiStore((state) => state.setShortcutsOpen);

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Keyboard shortcuts" size="lg">
      <p className="text-sm text-zinc-400">
        Right-click anything on a board — a card, a column, or empty space — for its actions.
        Shortcuts pause while you are typing.
      </p>

      <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {SHORTCUT_GROUPS.map((group) => (
          <section key={group}>
            <h3 className="text-[11px] font-bold tracking-wider text-accent-light uppercase">
              {group}
            </h3>
            <ul className="mt-2 divide-y divide-line">
              {shortcutsIn(group).map((shortcut) => (
                <li
                  key={shortcut.label}
                  className="flex items-center justify-between gap-4 py-2.5 text-sm"
                >
                  <span className="font-medium text-zinc-300">{shortcut.label}</span>
                  <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-zinc-600">
                    {shortcut.display
                      ? shortcut.display.map((text) => <Kbd key={text}>{text}</Kbd>)
                      : shortcut.keys.map((combo, index) => (
                          <Fragment key={combo}>
                            {index > 0 ? <span>or</span> : null}
                            <Combo combo={combo} />
                          </Fragment>
                        ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  );
}
