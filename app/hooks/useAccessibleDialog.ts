"use client";

import { useEffect, useRef } from "react";

export interface UseAccessibleDialogOptions {
  isOpen: boolean;
  onClose: () => void;
  dialogRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useAccessibleDialog({
  isOpen,
  onClose,
  dialogRef,
  initialFocusRef
}: UseAccessibleDialogOptions): void {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (typeof document !== "undefined") {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    }

    const container = dialogRef.current;
    if (container) {
      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        container.focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const dialogEl = dialogRef.current;
        if (!dialogEl) return;

        const focusable = Array.from(
          dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true");

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !dialogEl.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !dialogEl.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === "function") {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, onClose, dialogRef, initialFocusRef]);
}

export default useAccessibleDialog;
