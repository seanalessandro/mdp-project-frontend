"use client";

import * as React from "react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { MoonStarIcon } from "@/components/tiptap-icons/moon-star-icon";
import { SunIcon } from "@/components/tiptap-icons/sun-icon";

export function ThemeToggle() {
  // 1. Atur state default ke 'false' (artinya tidak dark mode / light mode).
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false);

  // 2. Gunakan useEffect untuk menambahkan/menghapus class '.dark'
  //    setiap kali state 'isDarkMode' berubah.
  React.useEffect(() => {
    const editorContainer = document.querySelector('.tiptap-editor-container');
    if (editorContainer) {
      // Jika isDarkMode true, tambahkan class 'dark'. Jika false, hapus class 'dark'.
      editorContainer.classList.toggle("dark", isDarkMode);
    }
  }, [isDarkMode]);

  // 3. Fungsi toggle hanya perlu mengubah state.
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <Button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      data-style="ghost"
    >
      {isDarkMode ? (
        <MoonStarIcon className="tiptap-button-icon" />
      ) : (
        <SunIcon className="tiptap-button-icon" />
      )}
    </Button>
  );
}