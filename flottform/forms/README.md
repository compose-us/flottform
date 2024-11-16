# Forms Module - Peer-to-Peer Connection Classes

The **Forms** module is part of the **Flottform** library and provides classes essential for establishing WebRTC-based peer-to-peer connections for file and text data transfer. Users who prefer custom UI implementations can instantiate these classes directly for full control.

## Classes Overview

### 1. **FlottformChannelHost** & **FlottformChannelClient**

These classes manage the core logic for establishing WebRTC connections, including interactions with the signaling server and ICE candidate exchange. They work on:

- **Connection Management**: Handle the entire WebRTC connection lifecycle.
- **Event Emission**: Emit events (`new`, `endpoint-created`, `connected`, `disconnected`, `error`) to indicate various connection states.

### 2. **FlottformFileInputHost** & **FlottformFileInputClient**

These classes use `FlottformChannelHost` and `FlottformChannelClient` as properties and do:

- **Event Handling**: Listen to and retransmit connection events, allowing developers to customize their UI.
- **File Transfer Logic**: Implement the logic for sending and receiving files, as `FlottformChannelHost` and `FlottformChannelClient` do not include this functionality.

### 3. **FlottformTextInputHost** & **FlottformTextInputClient**

These classes also use `FlottformChannelHost` and `FlottformChannelClient` as properties and:

- **Text Transfer Logic**: Implement the logic for sending and receiving text data.
- **Event Handling**: Support UI customization through event listening and retransmission.

## Additional Component

### **default-component.ts**

This file provides the logic to create the default accordion-style UI with input fields and "Get a Link" buttons for initiating WebRTC connections.

## Key Features

- **Complete WebRTC Integration**: Handles signaling, ICE candidate exchange, and peer-to-peer connections.
- **Customizable Events**: Developers can listen to events for UI customization.
- **Dedicated Data Handling**: Specialized classes for file and text data transfer.
- **Default UI Option**: Pre-built accordion-style component for immediate use.

## License

This module is licensed under `compose.us Non-Commercial License (CUNCL)`.

## Contact

For further information or assistance, please contact sales@flottform.io.
