import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import { useTextChat } from "./logic/useTextChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon, FullscreenIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";

import { AVATARS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: "Judy_Lawyer_Sitting2_public",
  knowledgeId: "7dc185e570bb4c73896532b2ecdd8d78",
  voice: {
    rate: 1.0,
    emotion: "friendly" as VoiceEmotion,
    model: ElevenLabsModel.eleven_flash_v2_5,
    voiceId: "e7f265ef0dc7426e8ed217c58da7e371",
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { sendMessage } = useTextChat();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(() => {
    // Load from localStorage on mount, or use default
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('avatarBackgroundImage');
      return saved || '/judy-background.jpg';
    }
    return '/judy-background.jpg';
  });
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const mediaStream = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useMemoizedFn(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen toggle failed", err);
    }
  });

  const exitFullscreenIfActive = useMemoizedFn(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error("Failed to exit fullscreen", err);
      }
    }
  });

  const stopAvatarAndExitFullscreen = useMemoizedFn(async () => {
    await exitFullscreenIfActive();
    stopAvatar();
  });

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
        setIsSpeaking(true);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
        setIsSpeaking(false);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
      });

      await startAvatar(config);

      if (isVoiceChat) {
        await startVoiceChat();
      }

      // Auto-greet to ensure avatar starts speaking on session start
      setTimeout(() => {
        sendMessage(
          "Hello! I'm your assistant. How can I help you today?"
        );
      }, 300);
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  useUnmount(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    stopAvatar();
  });

  // Reset timer when session stops, start timer when session connects
  useEffect(() => {
    if (sessionState === StreamingAvatarSessionState.INACTIVE) {
      setTimeRemaining(null);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else if (sessionState === StreamingAvatarSessionState.CONNECTED && timerDuration !== null && timerDuration > 0 && timeRemaining === null) {
      // Start timer when session becomes connected
      setTimeRemaining(timerDuration * 60); // Convert minutes to seconds
    }
  }, [sessionState, timerDuration]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining === null || sessionState !== StreamingAvatarSessionState.CONNECTED) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    if (timeRemaining <= 0) {
      // Timer reached 0, stop the session and exit fullscreen
      stopAvatarAndExitFullscreen();
      setTimeRemaining(null);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    // Start countdown
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timeRemaining, sessionState, stopAvatar]);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
        {sessionState === StreamingAvatarSessionState.INACTIVE && (
          <div className="flex flex-row justify-center items-center gap-4 p-4 border-b border-zinc-700">
            <Button onClick={() => startSessionV2(true)}>Start Voice Chat</Button>
            <Button onClick={() => startSessionV2(false)}>Start Text Chat</Button>
          </div>
        )}
        <div ref={containerRef} className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center bg-black">
          {sessionState === StreamingAvatarSessionState.CONNECTED ? (
            <AvatarVideo ref={mediaStream} timeRemaining={timeRemaining} />
          ) : (
            backgroundImage && (
              <>
                <img
                  src={backgroundImage}
                  alt="Background"
                  className="w-full h-full object-cover"
                />
                {sessionState === StreamingAvatarSessionState.CONNECTING && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <LoadingIcon />
                  </div>
                )}
              </>
            )
          )}
          {/* <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-6 py-2 rounded-md text-lg font-medium">
            María Teresa Fuster
          </div> */}
          <button
            aria-label="Toggle Full Screen"
            onClick={toggleFullscreen}
            className="absolute bottom-4 right-4 bg-zinc-900 text-white p-2 rounded-md"
          >
            <FullscreenIcon size={20} />
          </button>
          {sessionState === StreamingAvatarSessionState.CONNECTED && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
              {isSpeaking ? 'Avatar is speaking' : 'Avatar is listening'}
            </div>
          )}
        </div>
        {sessionState === StreamingAvatarSessionState.INACTIVE && (
          <div className="border-t border-zinc-700">
            <div
              className="w-full cursor-pointer select-none p-4 text-sm font-medium bg-zinc-800 text-white"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              {isSettingsOpen ? "▲ Settings" : "▼ Settings"}
            </div>
            {isSettingsOpen && (
              <div className="p-4">
                <AvatarConfig 
                  config={config} 
                  onConfigChange={setConfig}
                  timerDuration={timerDuration}
                  onTimerDurationChange={setTimerDuration}
                  backgroundImage={backgroundImage}
                  onBackgroundImageChange={(image) => {
                    setBackgroundImage(image);
                    // Save to localStorage
                    if (typeof window !== 'undefined') {
                      if (image) {
                        localStorage.setItem('avatarBackgroundImage', image);
                      } else {
                        localStorage.removeItem('avatarBackgroundImage');
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-6 items-center justify-center p-8 border-t border-zinc-700 w-full">
          {sessionState === StreamingAvatarSessionState.CONNECTED ? (
            <AvatarControls />
          ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
            <></>
          ) : (
            <LoadingIcon />
          )}
        </div>
      </div>
      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <MessageHistory />
      )}
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
