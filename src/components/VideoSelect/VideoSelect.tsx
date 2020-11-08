import React, { useEffect, useState } from 'react';

interface VideoSelectProps {
  onChange?: (devices: MediaDeviceInfo) => void,
  onError?: (message: string) => void,
  onLoad?: (devices: MediaDeviceInfo[]) => void,
}

const VideoSelect: React.FC<VideoSelectProps> = ({
  onChange = () => {},
  onError = () => {},
  onLoad = () => {},
}: VideoSelectProps) => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (!navigator.mediaDevices) {
      onError('navigator.mediaDevices not supported');
      return;
    }

    const loadDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const filteredDevices = devices.filter(({ kind }) => kind === 'videoinput');
      setVideoDevices(filteredDevices);
      onLoad(filteredDevices);
    };

    loadDevices();
  }, []);

  const onDeviceSelected = (evt: React.ChangeEvent) => {
    const deviceIndex = parseInt((evt.target as HTMLSelectElement).value, 10);
    onChange(videoDevices[deviceIndex]);
  };

  return (
    <select onBlur={onDeviceSelected} onChange={onDeviceSelected} disabled={videoDevices.length === 0}>
      {videoDevices.length === 0 && (
        <option>No devices found</option>
      )}
      {videoDevices.map(({ deviceId, label }, index) => (
        <option key={label || deviceId} value={index}>{label || deviceId}</option>
      ))}
    </select>
  );
};

export default VideoSelect;
