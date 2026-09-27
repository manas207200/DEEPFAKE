import { useAudioRecorder, useAudioRecorderState, useAudioPlayer, RecordingPresets, AudioModule } from "expo-audio";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeAudio } from "../api";
import type { AudioAnalysis, DemoClipId } from "../types";
import { escalate } from "./risk";

const EMPTY: AudioAnalysis = {
  risk_level: "low",
  confidence: 0,
  matched_pattern: "",
  detection_type: "none",
};

const DEMO_ASSETS: Record<DemoClipId, number> = {
  clean_call: require("../../assets/demo_audio/clean_call.wav"),
  scam_script_call: require("../../assets/demo_audio/scam_script_call.wav"),
  voice_clone_sample: require("../../assets/demo_audio/voice_clone_sample.wav"),
};

export function useAudioAnalysis(opts: {
  apiUrl: string;
  demoMode: boolean;
  demoClip: DemoClipId;
  enabled: boolean;
}) {
  const [analysis, setAnalysis] = useState<AudioAnalysis>(EMPTY);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chunkIndex = useRef(0);
  const cancelled = useRef(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(opts.demoMode ? DEMO_ASSETS[opts.demoClip] : null);

  const runChunk = useCallback(
    async (payload: { audio_base64?: string; demo_clip?: DemoClipId }) => {
      const result = await analyzeAudio(opts.apiUrl, {
        ...payload,
        chunk_index: chunkIndex.current,
      });
      chunkIndex.current += 1;
      setAnalysis((prev) => escalate(prev, result));
    },
    [opts.apiUrl]
  );

  useEffect(() => {
    cancelled.current = false;
    if (!opts.enabled) {
      setListening(false);
      return;
    }

    setAnalysis(EMPTY);
    chunkIndex.current = 0;
    setError(null);
    setListening(true);

    (async () => {
      try {
        const permission = await AudioModule.requestRecordingPermissionsAsync();
        if (!permission.granted) {
          throw new Error("Microphone permission not granted");
        }

        await AudioModule.setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });

        if (opts.demoMode) {
          player.loop = true;
          player.volume = 0.85;
          player.play();

          while (!cancelled.current) {
            await runChunk({ demo_clip: opts.demoClip });
            await delay(4000);
          }
          return;
        }

        while (!cancelled.current) {
          await recorder.prepareToRecordAsync();
          recorder.record();
          await delay(4000);

          if (cancelled.current) {
            await recorder.stop();
            break;
          }

          await recorder.stop();
          const uri = recorder.uri;
          if (!uri) continue;

          const audio_base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await FileSystem.deleteAsync(uri, { idempotent: true });

          if (cancelled.current) break;
          await runChunk({ audio_base64 });
        }
      } catch (err) {
        if (!cancelled.current) {
          setError(err instanceof Error ? err.message : "Analysis failed");
        }
      } finally {
        setListening(false);
      }
    })();

    return () => {
      cancelled.current = true;
      player.pause();
    };
  }, [opts.enabled, opts.demoMode, opts.demoClip, runChunk]);

  return { analysis, listening, error };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}