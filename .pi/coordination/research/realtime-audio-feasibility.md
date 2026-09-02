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

1. Approve a research-to-design task that selects a provider, authentication approach, client type, and privacy policy.
2. Build a turn-based voice proof of concept with final speech-to-text results and text-to-speech playback, while preserving the current text path for QA.
3. Define and test voice-specific limits, failure handling, consent, and cleanup.
4. Only then evaluate full realtime/WebRTC or WebSocket audio with barge-in support.

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
