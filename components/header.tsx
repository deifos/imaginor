"use client";
import { Sparkles } from "lucide-react";
import { GitHubCorner } from "./github-corner";
import { useState, useEffect } from "react";
import { useApiKey } from "@/context/ApiKeyContext";

export function Header() {
  const { apiKey, setApiKey } = useApiKey();
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (apiKey) {
      setInputValue(apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    const savedKey = localStorage.getItem("fal_api_key");
    if (savedKey) {
      setIsSaved(true);
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (inputValue) {
      localStorage.setItem("fal_api_key", inputValue);
      setApiKey(inputValue);
      setIsSaved(true);
      setShowInput(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem("fal_api_key");
    setApiKey(null);
    setIsSaved(false);
    setInputValue("");
  };

  return (
    <header className="border-b relative overflow-hidden">
      <div className="container mx-auto px-4 h-16 flex items-center gap-2">
        <div className="flex justify-between w-full">
          <div className="flex gap-2 ">
            <Sparkles className="h-5 w-5" />
            <h1 className="font-bold">Imaginor</h1>
          </div>
          <div className="flex gap-2 items-center">
            {!showInput && !isSaved && (
              <button
                onClick={() => setShowInput(true)}
                className="bg-black text-white px-4 py-2 rounded-md text-sm"
              >
                Enter your fal.ai API key
              </button>
            )}
            {showInput && (
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey as string}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="border rounded-md px-2 py-1"
                  placeholder="Enter API key"
                />
                <button
                  onClick={handleSave}
                  className="bg-black text-white px-4 py-1 rounded-md text-sm"
                >
                  Save
                </button>
              </div>
            )}
            {isSaved && (
              <div className="flex gap-2 items-center">
                <span className="text-green-600 text-sm">
                  API key saved locally
                </span>
                <button
                  onClick={handleClear}
                  className="bg-red-600 text-white px-2 py-1 rounded-md text-sm"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <div></div>
      </div>
      <GitHubCorner />
    </header>
  );
}
