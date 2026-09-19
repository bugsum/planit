"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { iconButtonClasses } from "@/components/ui/Button";
import { MoreIcon } from "@/components/ui/Icons";
import { cn } from "@/helpers/cn";
import { formatCombo } from "@/helpers/shortcuts";
import { useIsMac, wantsNativeMenu } from "@/helpers/use-hotkeys";
import { closeMenu, openMenu, useUiStore } from "@/store/ui";
import type { MenuEntry, OpenMenu } from "@/types/ui";

const EDGE = 8;

/**
 * Opens a menu at the cursor, or at the element for keyboard-triggered events.
 * Text fields and dialogs keep the native menu so copy and paste still work.
 */
export function openContextMenu(event: MouseEvent<Element>, entries: MenuEntry[]) {
  if (wantsNativeMenu(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
  if (event.clientX === 0 && event.clientY === 0) {
    openMenuAtElement(event.currentTarget, entries);
    return;
  }
  openMenu({ x: event.clientX, y: event.clientY, entries });
}

export function openMenuAtElement(element: Element, entries: MenuEntry[]) {
  const rect = element.getBoundingClientRect();
  openMenu({ x: rect.left + 16, y: rect.top + 24, flipY: rect.top, entries });
}

export function ContextMenuHost() {
  const menu = useUiStore((state) => state.menu);
  return menu ? <MenuPanel key={menu.id} menu={menu} /> : null;
}

function MenuPanel({ menu }: { menu: OpenMenu }) {
  const ref = useRef<HTMLDivElement>(null);
  const mac = useIsMac();
  const [active, setActive] = useState(-1);

  const enabled = menu.entries.flatMap((entry, index) =>
    entry.kind === "item" && !entry.disabled ? [index] : [],
  );

  useLayoutEffect(() => {
    const panel = ref.current;
    if (!panel) return;

    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    let left = menu.align === "end" ? menu.x - width : menu.x;
    let top = menu.y;
    if (top + height > window.innerHeight - EDGE) top = (menu.flipY ?? menu.y) - height;
    left = Math.min(Math.max(EDGE, left), window.innerWidth - width - EDGE);
    top = Math.min(Math.max(EDGE, top), window.innerHeight - height - EDGE);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;

    const previous = document.activeElement;
    panel.focus({ preventScroll: true });
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [menu]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target && ref.current?.contains(target)) return;
      const anchor = target?.closest("[data-menu-anchor]")?.getAttribute("data-menu-anchor");
      if (anchor && anchor === menu.anchor) return;
      closeMenu();
    };
    const onScroll = (event: Event) => {
      if (!(event.target instanceof Node && ref.current?.contains(event.target))) closeMenu();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("blur", closeMenu);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("blur", closeMenu);
    };
  }, [menu.anchor]);

  function move(step: number) {
    if (enabled.length === 0) return;
    const current = enabled.indexOf(active);
    const from = current === -1 ? (step > 0 ? -1 : 0) : current;
    setActive(enabled[(from + step + enabled.length) % enabled.length]);
  }

  function run(index: number) {
    const entry = menu.entries[index];
    if (entry?.kind !== "item" || entry.disabled) return;
    closeMenu();
    entry.onSelect();
  }

  return (
    <div
      ref={ref}
      role="menu"
      tabIndex={-1}
      aria-activedescendant={active >= 0 ? `menu-${menu.id}-${active}` : undefined}
      style={{ left: menu.x, top: menu.y }}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        // Keeps board shortcuts from firing while the menu owns the keyboard.
        event.stopPropagation();
        if (event.key === "ArrowDown") move(1);
        else if (event.key === "ArrowUp") move(-1);
        else if (event.key === "Home") setActive(enabled[0] ?? -1);
        else if (event.key === "End") setActive(enabled[enabled.length - 1] ?? -1);
        else if (event.key === "Enter" || event.key === " ") run(active);
        else if (event.key === "Escape" || event.key === "Tab") closeMenu();
        else return;
        event.preventDefault();
      }}
      className="fixed z-50 max-w-72 min-w-56 animate-pop-in rounded-xl border border-line-strong bg-raised/95 p-1 shadow-2xl shadow-black/60 backdrop-blur-md outline-none"
    >
      {menu.entries.map((entry, index) => {
        if (entry.kind === "separator") {
          return <div key={index} role="separator" className="mx-1 my-1 h-px bg-line" />;
        }
        if (entry.kind === "label") {
          return (
            <p
              key={index}
              className="px-2.5 pt-2 pb-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase"
            >
              {entry.label}
            </p>
          );
        }
        return (
          <button
            key={index}
            id={`menu-${menu.id}-${index}`}
            type="button"
            role="menuitem"
            tabIndex={-1}
            disabled={entry.disabled}
            onPointerEnter={() => setActive(index)}
            onPointerLeave={() => setActive(-1)}
            onClick={() => run(index)}
            className={cn(
              "flex w-full items-center justify-between gap-8 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors disabled:opacity-35",
              entry.danger ? "text-red-400" : "text-zinc-200",
              active === index && (entry.danger ? "bg-red-500/12" : "bg-white/[0.07]"),
            )}
          >
            <span className="truncate">{entry.label}</span>
            {entry.shortcut ? (
              <span className="font-mono text-[11px] text-zinc-500">
                {formatCombo(entry.shortcut, mac)}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function MenuButton({
  label,
  entries,
  className,
}: {
  label: string;
  entries: () => MenuEntry[];
  className?: string;
}) {
  const anchor = useId();
  const open = useUiStore((state) => state.menu?.anchor === anchor);

  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={open}
      data-menu-anchor={anchor}
      onClick={(event) => {
        event.stopPropagation();
        if (open) {
          closeMenu();
          return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        openMenu({
          x: rect.right,
          y: rect.bottom + 4,
          flipY: rect.top - 4,
          align: "end",
          entries: entries(),
          anchor,
        });
      }}
      className={cn(iconButtonClasses, open && "bg-white/5 text-zinc-100", className)}
    >
      <MoreIcon />
    </button>
  );
}
