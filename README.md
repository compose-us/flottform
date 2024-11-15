# Flottform Project Overview

**Flottform** is a library designed to facilitate peer-to-peer (P2P) connections using WebRTC technology. It simplifies the process of establishing data channels between peers, enabling file, data, and text exchanges. The library also offers a default UI for rapid development and fires multiple event for developers who wish to create tailored experiences.

## Key Features

- **WebRTC Integration**: Simplifies the establishment of P2P connections by handling signaling, ICE candidate exchange, and peer management.
- **Default UI Component**: Provides a ready-to-use accordion-style interface for rapid integration.
- **Event-Driven Architecture**: Emits events for different connection states (e.g., `new`, `endpoint-created`, `connected`, `disconnected`, `error`) to enable UI customization.
- **Modular Structure**: Supports file and text transfer through specialized classes.
- **Cross-Device Compatibility**: Ensures reliable P2P connections across various devices and platforms.

## Module Overview

### 1. **Signaling Server Module**

Handles the initial data exchange necessary for WebRTC connection setup. This module supports routes for adding ICE candidates, session descriptions, and returning server credentials for establishing connections.

### 2. **Forms Module**

Contains the primary classes for managing WebRTC connections:

- **FlottformChannelHost** & **FlottformChannelClient**: Core classes for connection management and event emission.
- **FlottformFileInputHost** & **FlottformFileInputClient**: Specialized classes for file transfer, using `FlottformChannelHost` and `FlottformChannelClient` as properties.
- **FlottformTextInputHost** & **FlottformTextInputClient**: Specialized classes for text transfer, using `FlottformTextInputHost` and `FlottformTextInputClient` as properties.

### 3. **Demo Module**

Showcases the various features and capabilities of the **Flottform** library through real-world scenarios. Demonstrates connection setup, file, and text sharing in diverse use cases, making it easier for developers to understand and adapt the library.

### 4. **Where Are You At Module**

A practical implementation of **Flottform**, enabling users to share and access location data easily. This module emphasizes the library’s ability to create responsive, user-friendly applications for real-time data sharing.

## Customization

Developers can override the default UI by listening to events emitted by the `FlottformTextInputHost`, `FlottformTextInputClient`, `FlottformFileInputHost`, `FlottformFileInputClient` and updating the UI based on these events.

## Use Cases

- **File Sharing Applications**: Securely send and receive files between users.
- **Real-Time Collaboration Tools**: Share text and images instantly with peers.
- **Location-Based Services**: Access your friend's location with one click.

## License

This project is licensed under `compose.us Non-Commercial License (CUNCL)`.

## Contact

For questions or support, please reach out to sales@flottform.io.
