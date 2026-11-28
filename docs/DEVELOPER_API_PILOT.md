# Developer API pilot

The pilot uses the existing Firebase account to approve a read-only OAuth grant. The initial client is the w3Develops CLI. It requests `directory:read` and receives an opaque token for ten minutes. The CLI keeps it in memory and revokes it when it finishes. Firestore stores token and code digests. The service uses the existing App Hosting and Firebase project.

## Try the pilot locally

With Node 24, the Firebase CLI and Java 21 installed, run `npm ci`, `npm run build` and `npm run test:developer-api`. The test harness rejects non-loopback Firebase emulator addresses. It exercises the versioned resource, a real CLI loopback callback, and the maintainer commands using test accounts and test groups.

## Enroll the first client

Deploy the Firestore rules for the approved source alongside the website release. Use the existing backend's runtime variables to set `DEVELOPER_API_ENABLED=true` when ready to enroll the pilot member. The protected API, authorization flow, and consent page return 404 by default. Check the production request and consent flow before enabling public discovery with `DEVELOPER_API_DISCOVERY_ENABLED=true`. The pilot serves its own OpenAPI document at `/api/developer/v1/openapi.json`.

An eligible member signs into `/developer/access` and submits a use case. Run the maintainer commands in an authorized terminal using Application Default Credentials for the existing Firebase project. The maintainer label records the operator's name and the actual access boundary is Cloud IAM. Treat requests and UIDs as private operational data.

```sh
export DEVELOPER_API_FIREBASE_PROJECT=your-firebase-project
export DEVELOPER_API_MAINTAINER=your-operator-label

node scripts/developer-access.mjs list-requests
node scripts/developer-access.mjs approve member-firebase-uid
node scripts/developer-access.mjs publish-group group-document-id 'Approved title' 'Approved public summary'
```

Use the group ID from the canonical public group page. Review the title and summary before publishing them. Use `withdraw-group` with the group ID to remove the entry. Run `node scripts/developer-cli.mjs` to open the browser, approve the grant, and read the approved summaries. Users can revoke their access from the access page. Maintainers can run `node scripts/developer-access.mjs revoke member-firebase-uid`.

The authorization page requires an existing, recently authenticated Firebase user token and a bound, single-use browser interaction. Pilot clients receive a developer token intended for the API. Configure logs to redact credential request bodies, bearer values, callback queries and cookie headers. Verify redaction before admitting a real member. Review request volume and the Firestore/Auth reads before expanding admission. The API caps reads per member across instances. The early anonymous throttle is per instance and does not depend on an unverified forwarded address.

For rollback, disable both runtime flags, revoke active grants, and verify that the OAuth and protected routes return 404. Expiration is enforced by the application. Review expired credentials with `node scripts/developer-access.mjs prune-expired`. Add `--apply` to remove up to 100 expired records per collection per run. Coordinate the maintenance schedule and expected Firestore usage before opening the pilot. Provider tests cover the authorized OAuth code flow. Agent registration and OpenID Connect discovery require their own features.
