
'use client'

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navigation/NavbarComponent'
import SettingsComponent from "./components/Settings/SettingsComponent"
import ChatComponent from './components/Chat/ChatComponent';
import DocumentViewerComponent from './components/Document/DocumentViewerComponent';
import StatusComponent from './components/Status/StatusComponent';
import { Settings, BaseSettings } from "./components/Settings/types"
import { Inter, Plus_Jakarta_Sans, Open_Sans, PT_Mono } from "next/font/google";
import RAGComponent from './components/RAG/RAGComponent';

import { RAGConfig, RAGResponse } from './components/RAG/types';

import { detectHost } from "./api"

// Fonts
const inter = Inter({ subsets: ["latin"] });
const plus_jakarta_sans = Plus_Jakarta_Sans({ subsets: ["latin"] });
const open_sans = Open_Sans({ subsets: ["latin"] });
const pt_mono = PT_Mono({ subsets: ["latin"], weight: "400" });

type FontKey = "Inter" | "Plus_Jakarta_Sans" | "Open_Sans" | "PT_Mono";

const fonts: Record<FontKey, typeof inter> = {
  "Inter": inter,
  "Plus_Jakarta_Sans": plus_jakarta_sans,
  "Open_Sans": open_sans,
  "PT_Mono": pt_mono
}

export default function Home() {

  // Page States
  const [currentPage, setCurrentPage] = useState<"CHAT" | "DOCUMENTS" | "STATUS" | "ADD" | "SETTINGS" | "RAG">("CHAT")

  // Settings
  const [settingTemplate, setSettingTemplate] = useState("Default")
  const [baseSetting, setBaseSetting] = useState<Settings>(BaseSettings)

  const fontKey = baseSetting[settingTemplate].Customization.settings.font.value as FontKey; // Safely cast if you're sure, or use a check
  const fontClassName = fonts[fontKey]?.className || "";

  // RAG Config
  const [RAGConfig, setRAGConfig] = useState<RAGConfig | null>(null)

  const [APIHost, setAPIHost] = useState<string | null>(null)

  useEffect(() => {
    const fetchHost = async () => {
      try {
        const host = await detectHost();
        setAPIHost(host);
        if (host === "" || host === "http://localhost:8000") {
          try {
            const response = await fetch(host + "/api/config", {
              method: "GET",
            });
            const data: RAGResponse = await response.json();

            if (data) {

              if (data.error) {
                console.log(data.error)
              }
              setRAGConfig(data.data)

            } else {
              console.warn("Configuration could not be retrieved")
            }
          } catch (error) {
            console.error("Failed to fetch configuration:", error);
            setRAGConfig(null)
          }
        }
      } catch (error) {
        console.error('Error detecting host:', error);
        setAPIHost(null); // Optionally handle the error by setting the state to an empty string or a specific error message
      }
    };

    fetchHost();
  }, []);

  return (
    <main className={`min-h-screen p-5 bg-bg-verba text-text-verba ${fontClassName}`} data-theme={baseSetting[settingTemplate].Customization.settings.theme}>
      <Navbar APIHost={APIHost} title={baseSetting[settingTemplate].Customization.settings.title.text} subtitle={baseSetting[settingTemplate].Customization.settings.subtitle.text} imageSrc={baseSetting[settingTemplate].Customization.settings.image.src} version='v1.0.0' currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {currentPage === "CHAT" && (
        <ChatComponent settingConfig={baseSetting[settingTemplate]} APIHost={APIHost} />
      )}

      {currentPage === "DOCUMENTS" && (
        <DocumentViewerComponent settingConfig={baseSetting[settingTemplate]} APIHost={APIHost} />
      )}

      {currentPage === "STATUS" && (
        <StatusComponent settingConfig={baseSetting[settingTemplate]} APIHost={APIHost} />
      )}

      {currentPage === "ADD" && (
        <RAGComponent buttonTitle="Import" settingConfig={baseSetting[settingTemplate]} APIHost={APIHost} RAGConfig={RAGConfig} setRAGConfig={setRAGConfig} showComponents={["Reader", "Chunker", "Embedder"]} />
      )}

      {currentPage === "RAG" && (
        <RAGComponent buttonTitle="Save" settingConfig={baseSetting[settingTemplate]} APIHost={APIHost} RAGConfig={RAGConfig} setRAGConfig={setRAGConfig} showComponents={["Embedder", "Retriever", "Generator"]} />
      )}

      {currentPage === "SETTINGS" && (
        <SettingsComponent settingTemplate={settingTemplate} setSettingTemplate={setSettingTemplate} baseSetting={baseSetting} setBaseSetting={setBaseSetting} />
      )}

      <footer className="footer footer-center p-4 mt-8 bg-bg-verba text-text-alt-verba">
        <aside>
          <p>Build with ♥ and Weaviate © 2024</p>
        </aside>
      </footer>

    </main >
  );
}