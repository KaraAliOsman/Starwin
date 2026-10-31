import {handleContactRequest} from '../../scripts/contact-core.mjs';

// Prepared for Cloudflare Pages; no external delivery occurs without both secrets.
export async function onRequest(context) {
 return handleContactRequest(context.request,{env:context.env,ip:context.request.headers.get('CF-Connecting-IP')||'unknown'});
}
