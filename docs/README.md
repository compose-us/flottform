# Flottform

## Overview

## Part : Flottform Server - Standalone service to exchange offers (Docker image using @flottform/server-standalone)

## Part : @flottform/server - Module to store and retrieve open offers (TypeScript module)

Exports multiple functions:
1. Create a new endpoint, returning a secret id and host key (pass callback to retrieve peer offers)
2. Delete an endpoint (secret id and host key necessary)
3. Put host information (secret id and host key necessary)
4. Put peer information (secret id necessary)
5. Retrieve host offer (secret id necessary)

Where do we set the stun / turn server configuration?

## Part : @flottform/server-standalone - Module using @flottform/server and allow communication via WebSockets and REST API (TypeScript module)

Exposes a `POST /flottform/create` for creating a new endpoint which another device can connect to. The response of the `POST` request includes the `secretId` of the endpoint and a `Host-Key` that can be used to manage the host WebRTC offer with `PUT /flottform/:secretId?key=<Host-Key>` and remove the endpoint by using `DELETE /flottform/:secretId`. A client connects by sending their offer to `PUT /flottform/:secretId` without a key. On `GET /flottform/:secretId`, a peer receives the information for the host form device.

It includes all HTML and JavaScript necessary to work with the above endpoints.

## Part : @flottform/forms - npm module / JavaScript file to include on your page (TypeScript module)

Can be configured to use any kind of @flottform/server-standalone compatible host.

## Part : Your server / existing service using forms (Wordpress instance, hosted server, ... we use SvelteKit for a demo)
