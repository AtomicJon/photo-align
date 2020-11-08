/* eslint-disable jsx-a11y/media-has-caption */
import VideoSelect from 'components/VideoSelect';
import React, { useEffect, useRef, useState } from 'react';

import styles from './PhotoAlign.module.scss';

const PhotoAlign: React.FC = () => {
  const videoRef = useRef() as React.MutableRefObject<HTMLVideoElement>;
  const imageFileInputRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  const [videoSource, setVideoSource] = useState<MediaDeviceInfo|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [referenceImage, setReferenceImage] = useState<string|null>(null);

  const onCapture = () => {
    if (!videoRef.current) {
      return;
    }

    const { videoWidth, videoHeight } = videoRef.current;
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const context = canvas.getContext('2d');
    context?.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

    const link = document.createElement('a');
    link.download = `Image_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    const loadCam = async () => {
      if (!videoSource) {
        return;
      }

      try {
        const {
          deviceId,
          groupId,
        } = videoSource;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { min: 1280 },
            height: { min: 720 },
            deviceId,
            groupId,
          },
          audio: false,
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (ex) {
        setError(ex.message);
      }
    };

    loadCam();
  }, [videoSource]);

  const onLoadImage = (evt: React.ChangeEvent) => {
    const { files } = evt.target as HTMLInputElement;
    if (!files || files.length < 1) {
      return;
    }

    // Only use the first one if multiple are selected
    const imageFile = files[0];
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setReferenceImage(fileReader.result as string);
    };

    fileReader.onerror = () => {
      setError('Error Loading File');
    };
    fileReader.readAsDataURL(imageFile);
  };

  return (
    <div className={styles.photo_align}>
      <div className={styles.video_container}>
        <video className={styles.video} ref={videoRef}>
          Video stream not available.
        </video>
        {referenceImage && (
          <img className={styles.reference_image} src={referenceImage} alt="" />
        )}
      </div>
      <div className={styles.controls}>
        <VideoSelect
          onLoad={(sources) => {
            if (sources.length > 0) {
              setVideoSource(sources[0]);
            }
          }}
          onChange={setVideoSource}
          onError={setError}
        />
        <button
          type="button"
          disabled={!videoSource}
          onClick={onCapture}
        >
          Take Photo
        </button>
        <button type="button" onClick={() => imageFileInputRef.current.click()}>
          Load Reference
        </button>
        <input
          accept="image/png, image/jpeg"
          type="file"
          style={{
            position: 'absolute',
            width: 0,
            height: 0,
          }}
          ref={imageFileInputRef}
          onChange={onLoadImage}
        />
      </div>

      {error && (
        <div className={styles.error}>
          <h1>Error</h1>
          <p>{error}</p>
          <button type="button" onClick={() => setError(null)}>OK</button>
        </div>
      )}
    </div>
  );
};

export default PhotoAlign;
