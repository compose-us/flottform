# Flottform's Signaling Server

## Overview

The Signaling Server module is an integral part of the WebRTC connection process. It facilitates the initial data exchange (such as ICE candidates and session descriptions) between peers before establishing a peer-to-peer connection. This implementation uses long polling for data exchange and is built using SvelteKit.

## Features

- Handles ICE candidate exchange between client and host.

- Supports creating new connection entries for peers.

- Provides STUN/TURN server credentials for facilitating NAT traversal.

## Usage

- **Creating a session**: Send a POST request to `flottform/create` to initialize a session for a new connection.

- **Adding ICE candidates**: Send PUT requests to `flottform/[endpoint]/client` and `/flottform/[endpoint]/host` to add ice candidates for both the client and the host.

- **Retrieving ICE server credentials**: Send a GET request to `flottform/ice-server-credentials` to obtain the necessary STUN/TURN server information.

## License

This project is licensed under `compose.us Non-Commercial License (CUNCL)`.

## Contact

For any inquiries, please contact sales@flottform.io.
