# Public learning MCP

Connect an MCP client over Streamable HTTP at `https://w3develops.org/mcp`.
The only tool is `find_public_learning_resources`, which returns up to eight
curated w3Develops links with short descriptions. It does not read page bodies,
lookup people or enrollment, call a model, act as a user, or make changes.
No account or API key is used. Do not send personal data in keyword queries.
The site still opts out of AI input and training and permits search indexing.

The canonical server card is at `/mcp/server-card`, with a site-discovery alias
at `/.well-known/mcp/server-card.json`. Both use the
[MCP Server Card extension](https://github.com/modelcontextprotocol/ext-server-card).
Supported clients can connect with either the MCP 2025-11-25 handshake or
2026-07-28 discovery. Browser requests that include an Origin must match
`https://w3develops.org`. The service has no CORS permission for another origin.

## Runtime safeguards and verification

The existing App Hosting runtime handles requests. This is stateless, with no
database, upstream API, paid dependency, standalone connections, or background
requests. It accepts one JSON-RPC message per POST, at most 4 KiB with a
two-second body-read deadline and a 160-character query. The local circuit
breaker is per application instance, not a shared quota or billing guarantee.
It accepts up to 12 concurrent body reads/exchanges, with an initial burst of
18 and a sustained one admitted POST per second; a busy instance returns 429.
No MCP requests or outputs are cached. Limiters affect only this endpoint.

Run the production build, then `node --test tests/public-learning-mcp.test.mjs`.
For a built or deployed test server without a local launch, set
`PUBLIC_MCP_TEST_URL`; the slow-body and burst tests only run on the test’s local server.
