"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.scss";
import StartingScreen from "./components/StartingScreen";
import Game from "./components/Game";

export default function Home() {
  const searchParams = useSearchParams();
  const isViewMode = searchParams.get("view") === "true";
  const [getClient, setClient] = useState(undefined);
  const [getChannel, setChannel] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const tmi = require("tmi.js");

  const playOffline = () => {
    setIsConnected(true);
  };

  const changeChannel = (channel) => {
    setChannel(channel);
  };

  const handleViewMode = (channel) => {
    setIsConnected(true);
    setChannel(channel);
  };

  useEffect(() => {
    if (getClient) {
      setIsConnecting(true);
      let tryConnection;
      let connectionTries = 0;
      const checkConnection = () => {
        if (getClient.channels.length > 0) {
          setIsConnected(true);
          clearInterval(tryConnection);
          const params = new URLSearchParams(searchParams.toString());
          params.set("channel", getClient.getChannels()[0].slice(1));
          window.history.pushState(null, "", `?${params.toString()}`);
        } else if (connectionTries >= 5) {
          clearInterval(tryConnection);
          alert("Connection failed");
          setChannel("");
          setIsConnecting(false);
          const params = new URLSearchParams(searchParams.toString());
          params.delete("channel");
          const queryString = params.toString();
          const newUrl = queryString ? `?${queryString}` : "/";
          window.history.pushState(null, "", newUrl);
          setClient(null);
        } else {
          connectionTries++;
        }
      };

      tryConnection = setInterval(checkConnection, 500);
    }
  }, [getClient]);

  useEffect(() => {
    if (getChannel) {
      let client = new tmi.Client({
        channels: [getChannel],
      });
      setClient(client);
      client.connect();
    }
  }, [getChannel]);

  useEffect(() => {
    // Parse URL parameters
    const channelParam = searchParams.get("channel");
    const authKeyParam = searchParams.get("key");
    // If auth key is not provided, redirect to view mode
    if (!authKeyParam && !isViewMode) {
      const currentUrl = new URL(window.location.href);
      // redirect to current url with all parameters but with view mode enabled
      window.location.href = `${currentUrl.origin}${currentUrl.pathname}?${currentUrl.searchParams.toString()}&view=true`;
    }
    // If not loaded in an iframe, set the body background to black
    if (window.self === window.top && isViewMode) {
      document.body.style.backgroundColor = "black !important";
    }
    if (channelParam) {
      if (isViewMode) {
        handleViewMode(channelParam);
      } else {
        setIsConnecting(true);
        setChannel(channelParam);
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <main className={`${styles.main} ${isViewMode ? styles.viewMode : ''}`}>
      {!isConnected ? (
        !isConnecting ? (
          !isLoading ? (
            <>
              <StartingScreen
                changeChannel={changeChannel}
                playOffline={playOffline}
                isViewMode={isViewMode}
              />
            </>
          ) : (
            <span>Loading...</span>
          )
        ) : (
          <span>Connecting...</span>
        )
      ) : (
        <Game
          client={getClient}
          channel={getChannel}
          isViewMode={isViewMode}
        />
      )}
    </main>
  );
}
