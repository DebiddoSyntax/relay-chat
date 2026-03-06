"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

type DarkModeContextType = {
	isDarkMode: boolean;
	theme: ThemeMode;
	setTheme: (mode: ThemeMode) => void;
	toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

// Detect system preference
const getSystemTheme = () =>
	typeof window !== "undefined" &&
	window.matchMedia("(prefers-color-scheme: dark)").matches;

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme") as ThemeMode | null;
  return saved ?? "system";
};

export const DarkModeProvider = ({ children }: { children: React.ReactNode }) => {
	const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
	const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

	// Sync theme logic
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		
		const applyTheme = () => {
			const dark = theme === "dark" || (theme === "system" && mediaQuery.matches);
			setIsDarkMode(dark);
			document.documentElement.classList.toggle("dark", dark);
		};

		applyTheme();

		if (theme === "system") {
			mediaQuery.addEventListener("change", applyTheme);
			return () => mediaQuery.removeEventListener("change", applyTheme);
		}
	}, [theme]);

	// Persist user choice
	useEffect(() => {
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleDarkMode = () => {
		setTheme(isDarkMode ? "light" : "dark");
	};

	return (
		<DarkModeContext.Provider value={{ isDarkMode, theme, setTheme, toggleDarkMode }}>
			{children}
		</DarkModeContext.Provider>
	);
};

export const useDarkMode = () => {
	const context = useContext(DarkModeContext);
	if (!context) throw new Error("useDarkMode must be used inside a DarkModeProvider");
	return context;
};