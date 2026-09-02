# Realtime Bidirectional Voice/Audio Feasibility

## Status

Research note only. This document does not authorize implementation, a model change, new credentials, a public interface, or a change to the approved Pi-Coach text training flow.

## Scope of the Question

Can the current local Pi-Coach HEART practice flow be extended from text chat to bidirectional voice/audio, and under what conditions?

## Current Verified Baseline

Pi-Coach currently runs locally on loopback, uses a fixed internal text model, and coordinates isolated Guest and Evaluator sessions. The Guest starts a text role-play, the Evaluator validates relevance and produces final HEART feedback, and the user interacts through PowerShell.

The installed Pi SDK supports streamed assistant text through `AgentSession` subscriptions. In particular, consumers can receive `message_update` events with `text_delta` chunks.

## Pi SDK Findings

The installed Pi documentation lists streaming support for text-oriented provider APIs, including OpenAI Chat Completions and Responses APIs. It documents model input types as `text` and optionally `image`; it does not document native microphone capture, speaker playback, audio input content, WebRTC, or an OpenAI Realtime voice transport.

Pi can register a custom provider through an extension. For a non-standard API, the provider can implement `streamSimple` and translate upstream events into Pi assistant-message events. This is an extension point, not evidence of built-in audio or WebRTC support. A custom provider would still need an application-owned audio layer.

## Feasible Architectures

### Option A: Turn-Based Voice Wrapper (Recommended First Step)

```text
Microphone -> speech-to-text -> existing Pi-Coach text workflow
existing Guest text reply -> text-to-speech -> speaker
```

The existing Guest and Evaluator text architecture remains the system of record. The application converts a completed user utterance to text before relevance validation, and converts the Guest text reply to speech afterward.

Advantages:

- Preserves the current HEART transcript, validation, evaluator, limits, locks, and `/end` behavior.
- Keeps the Evaluator text-only and isolated from the user.
- Is simpler to test, secure, and operate than full duplex audio.
- Allows a push-to-talk interaction model before introducing interruptions.

Limitations:

- It is not simultaneous conversation.
- Each turn includes speech recognition and synthesis latency.
- Speech transcription errors can affect validation and HEART feedback.

### Option B: Full Realtime Bidirectional Voice

```text
Voice client <-> WebRTC or WebSocket <-> realtime voice provider
                              |
                              +-> Pi-Coach training state, transcript, Evaluator, limits, and end flow
```

A voice-capable Guest would receive and emit continuous audio, while Pi-Coach maintains the training record and sends final text evidence to the Evaluator. This is possible as an application architecture, but it is not provided natively by the current Pi SDK integration.

A custom Pi provider could potentially map textual events from a non-standard realtime provider into Pi streaming events. Audio transport, encoding, capture, playback, voice activity detection, and interruption handling remain separate application responsibilities. Direct integration with the provider's realtime API may be more appropriate than forcing the audio stream through `AgentSession`.

## Option B: Detailed Realtime Architecture

A full realtime version should be treated as three coordinated systems rather than a single voice model:

```text
Voice client <-> realtime Guest connection
                    |
                    +-> Pi-Coach conversation controller
                          |-- final transcript and turn order
                          |-- relevance gate and practice limits
                          |-- private Pi Evaluator session
                          +-- end, timeout, interruption, and cleanup control
```

The Guest is the only role the user hears. The Evaluator remains private and text-based unless a separate decision changes that design.

### Controlled Turn Flow

For HEART, natural audio must not remove server control. A safe target flow is:

1. The user finishes an utterance.
2. The realtime provider emits a final transcript.
3. Pi-Coach records the final text and sends it to Evaluator for relevance validation.
4. If the text is clearly unrelated, Pi-Coach prevents a Guest reply and returns the existing coaching block.
5. If the text is relevant, Pi-Coach permits Guest to generate and speak the next reply.
6. Pi-Coach appends the completed Guest transcript to the training record.

This requires a provider design that can either delay automatic Guest generation until the server authorizes it, or accept server-side cancellation/control of automatic responses. Provider support for this behavior must be verified before selection.

A low-latency conversation can still follow this flow. The important distinction is that the server validates the finalized user turn before it allows the next Guest turn, rather than treating every partial audio event as a completed response.

### Interruptions and Barge-In

A natural voice conversation allows the user to speak while Guest is speaking. The implementation must then:

1. Detect that the user has begun speaking.
2. Stop or cancel the currently playing Guest response.
3. Mark that Guest turn as interrupted so the transcript remains accurate.
4. Obtain the user's final transcript.
5. Apply the relevance gate and continue with one authorized next turn.

Without explicit interruption rules, Guest audio can continue after the user speaks, duplicate answers can be generated, or `/end` can leave active audio resources behind.

## Realtime Connection Models

### Direct Client-to-Provider Connection

```text
Browser or desktop client <-> provider realtime transport
                  ^
                  | short-lived authorization and control from Pi-Coach
```

This can provide the best responsiveness because audio does not pass through Pi-Coach. It requires provider-supported temporary credentials or equivalent safe authorization: a client must never receive a long-lived provider secret.

Pi-Coach still needs a server-side control path to create the practice, apply limits, receive authoritative transcript events, validate turns, end the practice, and handle interruptions. The selected provider must support the required server control or sideband connection model.

### Server-Mediated Connection

```text
Browser or desktop client <-> Pi-Coach realtime gateway <-> provider
```

Pi-Coach receives and forwards audio or realtime events. This gives the server stronger control over validation and lifecycle, but increases latency, bandwidth use, cost, privacy responsibility, and operational complexity.

The correct choice depends on provider capabilities, security requirements, acceptable latency, hosting, and the level of server control required by HEART validation.

## Custom Pi Provider: What It Would and Would Not Do

Pi supports custom providers through an extension. A custom provider may register a model and implement `streamSimple`, which maps a non-standard provider's streamed events into Pi assistant-message events such as text deltas, completion, errors, and cancellation.

For a realtime Guest, a custom provider would need to:

1. Register the selected provider and approved voice-model metadata.
2. Create, track, cancel, and close a realtime provider connection for the Guest lifecycle.
3. Send the Guest role instructions and controlled scenario to the provider.
4. Translate usable textual provider events into Pi streaming events.
5. Propagate timeout, abort, disconnect, and error states without exposing provider internals.
6. Coordinate with Pi-Coach state so a connection belongs to one opaque training ID and is disposed at `/end` or shutdown.

However, the current Pi SDK model interface documents text and image input, not raw microphone audio as an `AgentSession` input type. A custom provider therefore does not automatically solve audio capture, WebRTC/WebSocket transport, playback, transcription, or interruption handling. Those responsibilities remain in a Pi-Coach audio/realtime adapter.

A possible design is to keep Guest formally inside a Pi `AgentSession` through a custom provider, while an application-owned adapter manages audio and links it to that session. This is the more integrated Pi design, but it is also the more complex and uncertain one.

A second design is to use a provider-native realtime Guest connection outside `AgentSession`, while keeping the private Evaluator as a Pi text session. This often makes the audio lifecycle clearer, but changes the current two-Pi-session architecture and would require an explicit approved design decision.

The current server disables extension discovery and uses a fixed text model. Any custom-provider approach would require approved code and configuration changes; it cannot be enabled merely by adding a model name.

## Required Capabilities and Decisions

A future approved implementation would need all of the following:

1. **Voice provider entitlement.** A provider and model that support speech input, speech output, and the chosen realtime transport. Existing text-model or subscription access must not be assumed to include this capability.
2. **Secure credential design.** Browser or desktop clients must never receive a long-lived provider secret. The local server would need to proxy the session or issue provider-supported short-lived credentials. Secrets must not be logged or committed.
3. **Audio client.** PowerShell is suitable for the current text test flow but is not an appropriate primary bidirectional audio client. A local browser client or desktop application would need microphone permission, audio capture, playback, and device/error handling.
4. **Transport choice.** Decide between WebRTC and WebSocket according to the selected provider, local-only versus remote use, latency, firewall behavior, and reconnection needs.
5. **Turn model.** Decide whether the first version is push-to-talk/turn-based or supports full duplex speech and barge-in. Full duplex requires cancellation and synchronization rules when the user interrupts the Guest.
6. **Transcript authority.** Store only the text transcript needed for the training. Define whether partial speech recognition results can affect validation; a safer initial rule is to validate only final utterances.
7. **Guest/Evaluator separation.** Keep the Evaluator private and text-based unless a separate decision authorizes otherwise. The user should hear only the Guest voice and receive final HEART feedback.
8. **Limits and lifecycle.** Define maximum audio duration, bytes/bitrate, concurrent voice practices, provider timeout, reconnect policy, `/end` during active audio, and cleanup of audio/realtime resources as well as Pi sessions.
9. **Privacy and consent.** Define microphone consent, whether audio is retained, transcript retention, log redaction, local versus remote access, and any organizational policy required for guest-training recordings.
10. **Cost and observability.** Establish a budget, audio usage reporting, rate limits, safe operational logs, and failure messages that do not reveal provider internals or credentials.

## HEART-Specific Behavior

The intended training rules remain unchanged:

- The Guest speaks the controlled scenario and stays in character.
- The Team Member's finalized transcript is checked for relevance.
- Clearly unrelated content may be blocked; relevant but weak or operationally questionable responses should remain in the practice and be evaluated at the end.
- The final Evaluator feedback remains structured around Hear, Empathize, Apologize, Resolve, and Thank.
- Existing prohibited compensation and `missed-breakfast` constraints must remain in force.

## Risks

- Speech recognition can mis-transcribe a relevant response and create a false block or incorrect feedback.
- Audio interruptions create races between in-progress Guest output, user input, validation, and `/end`.
- Realtime audio increases provider cost, operational complexity, and privacy exposure.
- A browser client normally needs HTTPS outside localhost and must not expose long-lived provider credentials.
- Pi custom-provider support is extensible, but a custom realtime audio transport would need dedicated implementation and provider-specific testing.

## Suggested Delivery Sequence

A turn-based voice wrapper remains a lower-risk option, but it is not a mandatory prerequisite if the approved goal is direct realtime voice. A direct realtime sequence should be:

1. Approve a research-to-design task that selects a provider, model, transport, server-control capability, authentication approach, client type, and privacy policy.
2. Build a private realtime connectivity slice: one Guest voice connection, visible final transcripts, explicit start/end, and safe cleanup. Do not claim HEART validation or public availability yet.
3. Add server-controlled finalized-turn validation and the private Evaluator transcript flow; verify one clear block and one relevant continuation.
4. Add interruption/barge-in handling, cancellation, reconnect behavior, audio/session limits, and `/end` during active audio.
5. Perform voice-specific human QA for scenario fidelity, transcript quality, blocks, feedback, interruptions, cleanup, cost, and privacy behavior.
6. Consider broader deployment only after the text and voice security/operations requirements are separately approved.

## Verification Needed Before Any Implementation

- Confirm current provider/model voice and realtime availability, pricing, authentication requirements, and usage terms.
- Confirm whether the selected transport supports local browser use without exposing long-lived credentials.
- Prototype audio lifecycle behavior without changing the approved production training contract.
- Run voice-specific human QA for recognition quality, interruptions, blocked unrelated content, HEART feedback, `/end`, reconnects, and cleanup.

## Sources Consulted

- Installed Pi documentation: `README.md` (Providers & Models; Programmatic Usage).
- Installed Pi documentation: `docs/sdk.md` (AgentSession events and text streaming).
- Installed Pi documentation: `docs/models.md` (supported APIs and model input types).
- Installed Pi documentation: `docs/custom-provider.md` (custom providers and `streamSimple`).
- Installed Pi documentation: `docs/providers.md` (provider authentication and custom-provider boundary).

No provider-specific realtime capability was tested, no credentials were inspected, and no model call was made for this research.
