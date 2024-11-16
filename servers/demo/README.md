# Demo Module - Flottform Integration

The **Demo** module highlights a range of practical applications of the **Flottform** library, which enables peer-to-peer connections through WebRTC.

## Overview

**Flottform** enables WebRTC-based peer-to-peer connections, allowing data exchange between two peers. The library provides a default UI component that creates an accordion with input field entries. Each entry includes:

- The name of the input field.
- A "Get a Link" button that initiates the connection process.

Upon clicking the button:

1. A QR code and link are displayed.
2. The client scans the QR code or opens the link.
3. A new page opens where the client can upload a file, send an image, or write text.
4. The data is sent to the other peer and attached to the corresponding input field.

## Customization

Users who prefer a customized UI can listen to events fired by the library's classes and modify the UI accordingly.

## Features

- **Peer-to-Peer Connection**: Establishes a secure WebRTC connection between peers.
- **Data Exchange**: Supports file, image, and text sharing.
- **Default UI**: Accordion with input field entries and connection initiation buttons.
- **Customizable Events**: Allows custom UI integration by listening to library events.

## Usage

The **Demo** module tests:

- File sharing between peers.
- Text communication.

This comprehensive demo ensures users can explore all potential use cases supported by the **Flottform** library.

## License

This project is licensed under `compose.us Non-Commercial License (CUNCL)`.

## Contact

For more information, please reach out at sales@flottform.io.
