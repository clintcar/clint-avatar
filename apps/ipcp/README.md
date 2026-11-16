# IPCP SBAR Handoff

This CU Anschutz simulation uses Dr. Sherly Williams for the assessed handoff and preserves Sal Rodriguez as the optional patient reference. Assessment uses the 12-item IPCP I-SBAR checklist and the LiveAvatar session transcript. The PDF includes findings, verified learner quotes with turn IDs, and the original transcript.

Run `pnpm --filter ipcp dev` from the repository root.

Set `LIVEAVATAR_API_KEY` as a Sensitive environment variable on the IPCP Vercel project. The server looks for one matching Dr. Williams avatar and one matching context in that LiveAvatar workspace. If either item uses another name or matches multiple entries, set `IPCP_WILLIAMS_AVATAR_ID` and/or `IPCP_WILLIAMS_CONTEXT_ID` to the SDK identifiers. The iframe share ID is separate. Configure the existing Dr. Williams roleplay context in the LiveAvatar workspace.

The roleplay and hidden assessor both use LiveAvatar FULL mode. Quotes are accepted only from learner turns recorded by LiveAvatar. The result is formative with no grade or numerical score.
