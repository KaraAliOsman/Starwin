import {handleContactRequest} from '../../scripts/contact-core.mjs';

// Delivery uses the configured transport; without credentials it prepares a draft.
export async function onRequest(context) {
 return handleContactRequest(context.request,{env:context.env,ip:context.request.headers.get('CF-Connecting-IP')||'unknown'});
}
