"use client";
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

const qrcodeRegionId = "html5qr-code-full-region";

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props) => {
    let config = {};
    if (props.fps) {
        config.fps = props.fps;
    }
    if (props.qrbox) {
        config.qrbox = props.qrbox;
    }
    if (props.aspectRatio) {
        config.aspectRatio = props.aspectRatio;
    }
    if (props.disableFlip !== undefined) {
        config.disableFlip = props.disableFlip;
    }
    if (props.videoConstraints) {
        config.videoConstraints = props.videoConstraints;
    }
    if (props.zoom) {
        config.zoom = props.zoom;
    }
    if (props.delay) {
        config.delay = props.delay;
    }
    if (props.beep) {
        config.beep = props.beep;
    }
    if (props.canvasWidth) {
        config.canvasWidth = props.canvasWidth;
    }
    if (props.canvasHeight) {
        config.canvasHeight = props.canvasHeight;
    }
        config.supportedScanTypes = [0];
        config.rememberLastUsedCamera= true;
        config.showTorchButtonIfSupported= true;

    return config;
};

const QRScan = (props) => {

    useEffect(() => {
        // when component mounts
        const config = createConfig(props);
        const verbose =  false;
        // Suceess callback is required.
        if (!(props.qrCodeSuccessCallback)) {
            throw "qrCodeSuccessCallback is required callback.";
        }
        const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
        html5QrcodeScanner.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);
        

        // cleanup function when component will unmount
        return () => {
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, []);

    return (
        <div id={qrcodeRegionId} />
    );
};

export default QRScan;