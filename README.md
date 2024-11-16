# Flottform Project Overview

Flottform allows your web application to connect a secondary device to it. Leveraging peer-to-peer (P2P) connections using WebRTC, it simplifies the process of establishing data channels between peers, enabling file, data, and text exchanges. The library offers a default UI for rapid development and lets developers create completely customizable experiences, tailored to the application at hand.

## Key Features

- **Default UI Component**: Provides a ready-to-use accordion-style interface for rapid integration.
- **WebRTC Integration**: Simplifies the establishment of P2P connections by handling signaling, ICE candidate exchange, and peer management.
- **Event-Driven Architecture**: Emits events for different connection states (e.g., `new`, `endpoint-created`, `connected`, `disconnected`, `error`) to enable UI customization.
- **Modular Structure**: Supports different data transfer through specialized classes (currently files and text).
- **Cross-Device Compatibility**: Ensures reliable P2P connections across various devices and platforms.

## Module Overview

### 1. **Forms Module**

Contains the primary classes for managing WebRTC connections. Use this to add Flottform to your web application. See the [@flottform/forms](./flottform/forms/README.md) package for more information.

### 2. **Signaling Server Module**

Handles the initial data exchange necessary for WebRTC connection setup. This module supports routes for adding ICE candidates, session descriptions, and returning server credentials for establishing connections.

See the [@flottform/signaling-server](./servers/signaling-server/README.md) package for more information.

### 3. **Demo Module**

Showcases the various features and capabilities of the **Flottform** library through real-world scenarios. Demonstrates connection setup, file, and text sharing in diverse use cases, making it easier for developers to understand and adapt the library.

See the [@flottform/demo](./servers/demo/README.md) package for more information.

### 4. **Where Are You At Module**

A practical implementation of **Flottform**, enabling users to share and access location data easily. This module emphasizes the library’s ability to create responsive, user-friendly applications for real-time data sharing.

See [the where-are-you.at server](./servers/where-are-you-at/README.md) for more information.

## Customization

Developers can override the default UI by listening to events emitted by the `FlottformTextInputHost`, `FlottformTextInputClient`, `FlottformFileInputHost`, `FlottformFileInputClient` and updating the UI based on these events.

## Use Cases

- **File Sharing Applications**: Securely send and receive files between users.
- **Real-Time Collaboration Tools**: Share text and images instantly with peers.
- **Location-Based Services**: Access your friend's location with one click.
- **Use capabilities of another device**: Use the pen on your tablet to draw something you want to have on your laptop.

## License

This project is licensed under `compose.us Non-Commercial License (CUNCL)`.

## Contact

For questions or support, please reach out to sales@flottform.io.
