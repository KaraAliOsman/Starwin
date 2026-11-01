import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ORIGIN, publicUrl, sitemapLocations, contentFingerprint, changedUrls, notificationPlan, notify} from '../scripts/indexnow.mjs';

test('IndexNow nunca transmite URL privadas, externas o de seguimiento', async () => {
  for (const url of ['https://otro.cl/', ORIGIN + '/api/contact', ORIGIN + '/?utm_source=x', ORIGIN + '/#x', 'http://starwinpvc.cl/', 'https://user:pass@starwinpvc.cl/']) assert.throws(() => publicUrl(url));
  assert.deepEqual(sitemapLocations(`<urlset><url><loc>${ORIGIN}/ventanas/</loc></url></urlset>`), [ORIGIN + '/ventanas/']);
  assert.throws(() => sitemapLocations('<urlset><url><loc>https://otro.cl/</loc></url></urlset>'));
  let calls = 0;
  await assert.rejects(notify(['https://otro.cl/'], 'a'.repeat(64), async () => {calls++;}));
  assert.equal(calls, 0);
});

test('Notifica altas, cambios y bajas, sin reenviar por CSS o JavaScript', () => {
  const before = '<title>Ventanas</title><style>.a{color:red}</style><h1 class="a">PVC</h1><script>one()</script>';
  const presentation = '<title>Ventanas</title><style>.b{color:blue}</style><h1 class="b">PVC</h1><script>two()</script>';
  assert.equal(contentFingerprint(before), contentFingerprint(presentation));
  assert.notEqual(contentFingerprint(before), contentFingerprint(before.replace('PVC', 'Termopanel')));
  assert.notEqual(contentFingerprint(before + '<meta name="description" content="Antes">'), contentFingerprint(before + '<meta name="description" content="Después">'));
  assert.deepEqual(changedUrls({[ORIGIN + '/']: 'new', [ORIGIN + '/nueva/']: 'a'}, {[ORIGIN + '/']: 'old', [ORIGIN + '/anterior/']: 'b'}), [ORIGIN + '/', ORIGIN + '/anterior/', ORIGIN + '/nueva/']);
  assert.deepEqual(changedUrls({[ORIGIN + '/']: 'same'}, {[ORIGIN + '/']: 'same'}), []);
  const protectedMail = hex => `<a href="/cdn-cgi/l/email-protection#${hex}"><span data-cfemail="${hex}">[email&#160;protected]</span></a>`;
  const first = protectedMail('fd8e899c8f8a94939e95949198bd9a909c9491d39e9290');
  const second = protectedMail('5427203526233d3a373c3d3831143339353d387a373b39');
  assert.equal(contentFingerprint(first), contentFingerprint(second), 'La protección rotativa de correo no es una modificación del contenido.');
  assert.notEqual(contentFingerprint(first), contentFingerprint('<a href="mailto:otro@example.cl">otro@example.cl</a>'));
});

test('Actualiza el registro de huellas sin reenviar las URL existentes, conservando altas y bajas', () => {
  const current = {[ORIGIN + '/']: 'stable', [ORIGIN + '/nueva/']: 'new'};
  const legacy = {version: 1, pages: {[ORIGIN + '/']: 'transient', [ORIGIN + '/retirada/']: 'old'}};
  assert.deepEqual(notificationPlan(current, legacy), {urls: [ORIGIN + '/nueva/', ORIGIN + '/retirada/'], baselineMigration: 'v1_to_v2'});
  assert.deepEqual(notificationPlan(current, {version: 2, pages: current}), {urls: [], baselineMigration: null});
  assert(notificationPlan({...current, [ORIGIN + '/']: 'real-change'}, {version: 2, pages: current}).urls.includes(ORIGIN + '/'));
});

test('Distingue recepción, verificación pendiente y rechazo sin prometer indexación', async () => {
  for (const status of [200, 202]) {
    const result = await notify([ORIGIN + '/'], 'a'.repeat(64), async (url, options) => {
      assert.equal(url, 'https://api.indexnow.org/indexnow');
      const body = JSON.parse(options.body);assert.equal(body.host, 'starwinpvc.cl');assert.equal(body.keyLocation, ORIGIN + '/indexnow-key.txt');
      return new Response('', {status});
    });
    assert.equal(result.httpStatus, status);assert.equal(result.indexed, 'not_verified');
    assert.equal(result.state, status === 200 ? 'received' : 'received_pending_key_verification');
  }
  await assert.rejects(notify([ORIGIN + '/'], 'a'.repeat(64), async () => new Response('', {status: 429})), /rechazó/);
});
