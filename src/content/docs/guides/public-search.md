---
title: Public learning search
description: Find w3Develops public learning pages and guides through a small read-only API.
---

The anonymous public search returns up to eight links and short descriptions from a curated list. It does not search member profiles, private groups, notes, or live membership and schedule data. The search does not call a model or a database.

- Send a GET request to [/.well-known/search?q=study%20groups](/.well-known/search?q=study%20groups).
- Supply one `q` parameter with 1 to 160 characters. Use short topic names or keywords.
- A successful response is Markdown. No matches is a valid outcome. Check the linked site page for the current details rather than relying on a search excerpt.
- Do not send credentials or personal data in a query.

The site's [content-use policy](/robots.txt) is unchanged. Search indexing is allowed; AI input and training are opted out.
